"""
SalesMemory ingestion pipeline (Python)
----------------------------------------
Walks dataset/<deal>/<category>/<file>.txt and pushes every file into
Supermemory as a document, scoped by containerTag = one deal, tagged with
metadata that the dashboard later filters/sorts on.

Works against both the hosted API and a self-hosted instance — see
https://supermemory.ai/docs/self-hosting/quickstart. Just point
SUPERMEMORY_BASE_URL at your local server (e.g. http://localhost:6767)
and everything below runs identically.

    pip install supermemory

    # Hosted:
    SUPERMEMORY_API_KEY=sm_... python ingest.py

    # Self-hosted (after `curl -fsSL https://supermemory.ai/install | bash`
    # and running `supermemory-server`):
    SUPERMEMORY_API_KEY=sm_... SUPERMEMORY_BASE_URL=http://localhost:6767 python ingest.py
"""

import sys
import time
import concurrent.futures
from pathlib import Path

# Per-document shaping (containerTag/metadata/entityContext) and the
# actual client.add() call live in backend/ingest_core.py -- the single
# source of truth also used by the live POST /interactions endpoint, so
# bulk-loaded and manually-added documents are indistinguishable to
# generate_brief().
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))
import ingest_core  # noqa: E402
from state import mark_ingested  # noqa: E402

container_tag_for = ingest_core.container_tag_for
ACCOUNT_NAMES = ingest_core.ACCOUNT_NAMES
ENTITY_CONTEXT = ingest_core.ENTITY_CONTEXT
SOURCE_WEIGHT = ingest_core.SOURCE_WEIGHT

DATASET_ROOT = Path(__file__).parent.parent / "dataset"

# ---- Per-file metadata schema -----------------------------------------
# Every file lives at <deal>/<category>/<seq>_<date>_<slug>.txt.
# We turn that path into structured metadata so the dashboard and any
# filtered search ("only show me calls", "only show me the last 30 days")
# can hit Supermemory's metadata filters instead of re-parsing content.
import re

FILENAME_RE = re.compile(r"^(\d+)_(\d{4}-\d{2}-\d{2})_(.+)\.txt$")


def parse_file(category: str, filename: str):
    match = FILENAME_RE.match(filename)
    if not match:
        return None
    seq, date, slug = match.groups()
    return {
        "seq": int(seq),
        "date": date,  # ISO yyyy-mm-dd, sorts and filters natively
        "slug": slug.replace("_", " "),
        "category": category,
    }


# ---- Batch ingestion with backoff --------------------------------------
def ingest_with_retry(doc: dict, max_retries: int = 3):
    for attempt in range(1, max_retries + 1):
        try:
            # add_document(...) is the single shared path to
            # POST /v3/documents -- also used by the live
            # POST /interactions endpoint, so both routes hit Supermemory
            # identically.
            return ingest_core.add_document(doc)
        except Exception as err:
            if attempt == max_retries:
                raise
            time.sleep(1 * attempt)


def ingest_batch(docs: list[dict], batch_size: int = 5, delay_s: float = 1.5):
    # Docs recommend batches of 3-5 with 1-2s between requests to stay
    # comfortably under rate limits during a bulk import like this one.
    total_batches = (len(docs) + batch_size - 1) // batch_size
    for i in range(0, len(docs), batch_size):
        batch = docs[i : i + batch_size]
        print(f"  batch {i // batch_size + 1}/{total_batches}")

        with concurrent.futures.ThreadPoolExecutor(max_workers=batch_size) as pool:
            futures = {pool.submit(ingest_with_retry, doc): doc for doc in batch}
            for future in concurrent.futures.as_completed(futures):
                doc = futures[future]
                try:
                    future.result()
                except Exception as err:
                    print(f"  ✗ failed: {doc['customId']} ({err})")

        if i + batch_size < len(docs):
            time.sleep(delay_s)


# ---- Walk the dataset and build the document list -----------------------
def main():
    deals = sorted(p.name for p in DATASET_ROOT.iterdir() if p.is_dir())

    for deal_folder in deals:
        container_tag = container_tag_for(deal_folder)
        print(f"\n=== {deal_folder} -> {container_tag} ===")

        deal_path = DATASET_ROOT / deal_folder
        docs = []

        for category_path in sorted(deal_path.iterdir()):
            if not category_path.is_dir():
                continue
            category = category_path.name

            for file_path in sorted(category_path.iterdir()):
                parsed = parse_file(category, file_path.name)
                if not parsed:
                    continue

                content = file_path.read_text(encoding="utf-8")

                docs.append(
                    ingest_core.build_document(
                        deal_folder=deal_folder,
                        category=category,
                        title=parsed["slug"],
                        content=content,
                        date=parsed["date"],
                        # customId makes this idempotent: re-running ingest
                        # on an updated dataset upserts instead of
                        # duplicating.
                        custom_id=f"{deal_folder}:{category}:{file_path.stem}",
                        seq=parsed["seq"],
                    )
                )

        print(f"  {len(docs)} documents queued")
        ingest_batch(docs)

        # Seeds the first-run staleness baseline (so the very first
        # /api/brief call has something to compare against) AND
        # correctly invalidates any previously-cached brief if bulk
        # ingest is re-run later.
        mark_ingested(container_tag)

    print("\nDone. Documents process async -- poll GET /v3/documents/{id}")
    print("(client.documents.get(doc_id)) for status before querying.")


if __name__ == "__main__":
    main()

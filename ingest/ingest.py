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

import os
from dotenv import load_dotenv
import re
import time
import concurrent.futures
from pathlib import Path
load_dotenv(Path(__file__).parent.parent / ".env")
from supermemory import Supermemory

client = Supermemory(
    api_key=os.environ.get("SUPERMEMORY_API_KEY"),
    # Omit base_url entirely to hit the hosted API. Set SUPERMEMORY_BASE_URL
    # to point at a local `supermemory-server` instead — same calls, no
    # code changes, per the self-hosting quickstart.
    base_url=os.environ.get("SUPERMEMORY_BASE_URL") or None,
)

DATASET_ROOT = Path(__file__).parent.parent / "dataset"

# ---- 1. Deal-level identity -------------------------------------------------
# One containerTag per deal. This is the single most important design
# decision in the whole pipeline: everything downstream (search, profile,
# the dashboard's customer switcher) is scoped by this tag, so it has to be
# stable, unique, and cheap to derive from the folder name.
#
# dataset/padma_oracle/... -> containerTag "deal-padma-oracle"
def container_tag_for(deal_folder: str) -> str:
    return f"deal-{deal_folder.replace('_', '-')}"


# Human-readable account name + a short blurb per deal. The blurb becomes
# entityContext on every document in that container -- Supermemory's docs
# describe this as guidance for memory extraction that "persists on the
# container tag" (max 1500 chars), so it's worth setting deliberately
# instead of leaving extraction to guess what this container is about.
ACCOUNT_NAMES = {
    "padma_oracle": "Oracle Corporation, Cloud Applications",
    "rayhan_nvidia": "NVIDIA, AI Infrastructure",
    "rithvik_intellibuddies": "IntelliBuddies",
    "suhani_nokia": "Nokia, Network Ops",
}

ENTITY_CONTEXT = {
    "padma_oracle": (
        "Enterprise sales deal between MemoryIQ and Oracle Corporation "
        "(Cloud Applications). Champion: Padma Deepak, VP Cloud "
        "Applications. Focus on buying-committee roles, security/legal "
        "review milestones, competitive positioning against Gong, and "
        "commercial terms."
    ),
    "rayhan_nvidia": (
        "Enterprise sales deal between MemoryIQ and NVIDIA (AI "
        "Infrastructure). Champion: Rayhan Sadat, Senior AI Infrastructure "
        "Engineer. Focus on build-vs-buy dynamics, technical validation, "
        "and champion engagement/silence patterns."
    ),
    "rithvik_intellibuddies": (
        "Startup sales deal between MemoryIQ and IntelliBuddies. Champion: "
        "Rithvik RK, Founder. Focus on pricing sensitivity, technical "
        "validation (data lock-in), and deal velocity."
    ),
    "suhani_nokia": (
        "Enterprise sales deal between MemoryIQ and Nokia (Network Ops). "
        "Champion: Suhani Jain, Director Network Ops. Focus on security "
        "review pace, technical validation, and executive sign-off path."
    ),
}

# ---- 2. Per-file metadata schema -------------------------------------------
# Every file lives at <deal>/<category>/<seq>_<date>_<slug>.txt.
# We turn that path into structured metadata so the dashboard and any
# filtered search ("only show me calls", "only show me the last 30 days")
# can hit Supermemory's metadata filters instead of re-parsing content.
# Per the docs, metadata values must be string / number / boolean only --
# no nested objects or arrays.
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
        "category": category,  # emails | calls | crm | meetings | slack |
        # proposals | negotiation | security | executive | procurement |
        # sales_notes | outcome
    }


# A source-type -> weight map. Not required by Supermemory, but useful
# metadata for the dashboard to decide which cards ("What they said") to
# surface first -- a verbatim call transcript quote is worth more than an
# internal sales note paraphrasing the same thing.
SOURCE_WEIGHT = {
    "calls": 1.0,
    "meetings": 0.9,
    "emails": 0.8,
    "slack": 0.6,
    "crm": 0.5,
    "sales_notes": 0.4,  # internal-only, never shown to the customer-facing side
    "negotiation": 0.9,
    "security": 0.8,
    "executive": 0.9,
    "procurement": 0.6,
    "proposals": 0.8,
    "outcome": 0.7,
}


# ---- 3. Batch ingestion with backoff ---------------------------------------
def ingest_with_retry(doc: dict, max_retries: int = 3):
    for attempt in range(1, max_retries + 1):
        try:
            # client.add(...) is the documented shortcut for POST /v3/documents
            # (self-hosted docs also show the equivalent client.memories.add(...) --
            # both hit the same endpoint, add() works against either backend).
            return client.add(
                content=doc["content"],
                containerTag=doc["containerTag"],
                custom_id=doc["customId"],
                metadata=doc["metadata"],
                entity_context=doc.get("entityContext"),
            )
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
                    print(f"  \u2717 failed: {doc['customId']} ({err})")

        if i + batch_size < len(docs):
            time.sleep(delay_s)


# ---- 4. Walk the dataset and build the document list -----------------------
def main():
    deals = sorted(p.name for p in DATASET_ROOT.iterdir() if p.is_dir())

    for deal_folder in deals:
        container_tag = container_tag_for(deal_folder)
        account_name = ACCOUNT_NAMES.get(deal_folder, deal_folder)
        entity_context = ENTITY_CONTEXT.get(deal_folder)
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
                    {
                        "content": content,
                        "containerTag": container_tag,
                        # customId makes this idempotent: re-running ingest on
                        # an updated dataset upserts instead of duplicating.
                        "customId": f"{deal_folder}:{category}:{file_path.stem}",
                        "metadata": {
                            "deal": deal_folder,
                            "account": account_name,
                            "category": parsed["category"],
                            "date": parsed["date"],
                            "title": parsed["slug"],
                            "seq": parsed["seq"],
                            "weight": SOURCE_WEIGHT.get(category, 0.5),
                        },
                        "entityContext": entity_context,
                    }
                )

        print(f"  {len(docs)} documents queued")
        ingest_batch(docs)

    print("\nDone. Documents process async -- poll GET /v3/documents/{id}")
    print("(client.documents.get(doc_id)) for status before querying.")


if __name__ == "__main__":
    main()
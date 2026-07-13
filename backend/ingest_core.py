"""Single source of truth for turning (deal, category, title, content,
date) into a Supermemory document. Used by:
  - ingest/ingest.py's bulk main() (stable, filename-derived customId,
    upsert-safe on re-run)
  - backend/app.py's POST /interactions (uuid-suffixed customId, one-shot
    live add)

Also owns the deal identity mappings (ACCOUNT_NAMES, ENTITY_CONTEXT,
SOURCE_WEIGHT, container_tag_for, and the reverse lookup) so ingest.py and
app.py can never define these independently and drift.
"""
import os
import re
import uuid
from datetime import date as date_cls
from pathlib import Path

from dotenv import load_dotenv
from supermemory import Supermemory

load_dotenv(Path(__file__).parent.parent / ".env")

# base_url is only passed when explicitly set -- the SDK's own default
# (hosted https://api.supermemory.ai) only kicks in when the kwarg is
# omitted entirely; passing base_url=None explicitly breaks it (resolves
# to an empty base URL instead of falling back).
_supermemory_kwargs = {"api_key": os.environ.get("SUPERMEMORY_API_KEY")}
if os.environ.get("SUPERMEMORY_BASE_URL"):
    _supermemory_kwargs["base_url"] = os.environ["SUPERMEMORY_BASE_URL"]

client = Supermemory(**_supermemory_kwargs)


def container_tag_for(deal_folder: str) -> str:
    return f"deal-{deal_folder.replace('_', '-')}"


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

SOURCE_WEIGHT = {
    "calls": 1.0,
    "meetings": 0.9,
    "emails": 0.8,
    "slack": 0.6,
    "crm": 0.5,
    "sales_notes": 0.4,
    "negotiation": 0.9,
    "security": 0.8,
    "executive": 0.9,
    "procurement": 0.6,
    "proposals": 0.8,
    "outcome": 0.7,
}

# New, additive: name + role per deal, needed for the roster screen (which
# ACCOUNT_NAMES alone doesn't carry). Colocated here since it describes the
# same 4 deals.
CHAMPIONS = {
    "padma_oracle": {"name": "Padma Deepak", "role": "VP, Cloud Applications"},
    "rayhan_nvidia": {"name": "Rayhan Sadat", "role": "Sr. AI Infrastructure Engineer"},
    "rithvik_intellibuddies": {"name": "Rithvik RK", "role": "Founder"},
    "suhani_nokia": {"name": "Suhani Jain", "role": "Director, Network Ops"},
}

TAG_TO_DEAL_FOLDER = {container_tag_for(folder): folder for folder in ACCOUNT_NAMES}

_SLUG_RE = re.compile(r"[^a-z0-9]+")


def _slugify(title: str) -> str:
    return _SLUG_RE.sub("-", title.strip().lower()).strip("-")


def build_document(
    deal_folder: str,
    category: str,
    title: str,
    content: str,
    date: str,
    custom_id: str,
    seq: int = 0,
) -> dict:
    """Pure -- no network call. Shapes one Supermemory document payload.
    Bulk ingest supplies its own stable custom_id; ingest_interaction()
    (below) generates a fresh one per call."""
    if deal_folder not in ACCOUNT_NAMES:
        raise ValueError(f"Unknown deal folder '{deal_folder}'")
    if category not in SOURCE_WEIGHT:
        raise ValueError(
            f"Unknown category '{category}', expected one of {sorted(SOURCE_WEIGHT)}"
        )

    return {
        "content": content,
        "containerTag": container_tag_for(deal_folder),
        "customId": custom_id,
        "metadata": {
            "deal": deal_folder,
            "account": ACCOUNT_NAMES[deal_folder],
            "category": category,
            "date": date,
            "title": title,
            "seq": seq,
            "weight": SOURCE_WEIGHT[category],
        },
        "entityContext": ENTITY_CONTEXT.get(deal_folder),
    }


def add_document(doc: dict):
    """The ONE place that calls client.add(). Shared by ingest.py's
    retrying bulk path (ingest_with_retry wraps this) and
    ingest_interaction()'s single-shot live path."""
    return client.add(
        content=doc["content"],
        container_tag=doc["containerTag"],
        custom_id=doc["customId"],
        metadata=doc["metadata"],
        entity_context=doc.get("entityContext"),
    )


def ingest_interaction(
    deal_folder: str,
    category: str,
    title: str,
    content: str,
    date: str | None = None,
) -> dict:
    """Adds one new document for an existing deal -- used by
    POST /api/deals/{tag}/interactions. Custom ID:
    {deal}:{category}:{date}-{slugified title}-{short uuid}."""
    resolved_date = date or date_cls.today().isoformat()
    custom_id = (
        f"{deal_folder}:{category}:{resolved_date}-{_slugify(title)}-{uuid.uuid4().hex[:8]}"
    )
    doc = build_document(deal_folder, category, title, content, resolved_date, custom_id)
    result = add_document(doc)
    return {"documentId": result.id, "status": result.status}

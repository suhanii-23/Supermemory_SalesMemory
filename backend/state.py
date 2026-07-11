"""In-memory + on-disk dirty-flag cache for generated briefs. Hackathon-
appropriate: a dict, persisted to state.json on every write so a backend
restart mid-demo doesn't lose cached briefs or ingestion timestamps.

Concurrency model: FastAPI runs sync route handlers in a threadpool, so
multiple requests against ONE uvicorn process are genuinely concurrent.
A single process-wide Lock serializes the read-modify-write cycle to avoid
lost updates between two threads. This does NOT protect against a second
OS process (e.g. `python ingest/ingest.py` running at the same moment as
the backend) writing state.json concurrently -- acceptable here because
bulk ingest always finishes before the backend starts.
"""
import json
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock

STATE_PATH = Path(__file__).parent / "state.json"
_lock = Lock()

_DEFAULT_ENTRY = {
    "last_ingested_at": None,
    "cached_brief": None,
    "brief_generated_at": None,
}


def _now_iso() -> str:
    # All timestamps in this file MUST come from this one function --
    # needs_regeneration() compares them with plain string `>`, which is
    # only chronologically correct if every timestamp shares the exact
    # same fixed-offset ISO-8601 format.
    return datetime.now(timezone.utc).isoformat()


def _read_state() -> dict:
    if not STATE_PATH.exists():
        return {}
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        # Corrupted/partial write from a crash mid-write -- self-heal by
        # treating it as empty rather than crashing every request.
        return {}


def _write_state(state: dict) -> None:
    # Write-to-temp-then-rename so a crash mid-write can never leave a
    # half-written state.json that the next _read_state() chokes on.
    # Path.replace() is atomic on POSIX (macOS included).
    tmp_path = STATE_PATH.with_suffix(".json.tmp")
    tmp_path.write_text(json.dumps(state, indent=2), encoding="utf-8")
    tmp_path.replace(STATE_PATH)


def get_deal_state(container_tag: str) -> dict:
    state = _read_state()
    return state.get(container_tag, dict(_DEFAULT_ENTRY))


def mark_ingested(container_tag: str, when: str | None = None) -> None:
    """Bump last_ingested_at. Called by POST /interactions after a
    successful add, AND by ingest.py's bulk main() once per deal after
    that deal's batch finishes -- both write the same file, same shape."""
    with _lock:
        state = _read_state()
        entry = state.setdefault(container_tag, dict(_DEFAULT_ENTRY))
        entry["last_ingested_at"] = when or _now_iso()
        _write_state(state)


def save_brief(container_tag: str, brief: dict) -> None:
    with _lock:
        state = _read_state()
        entry = state.setdefault(container_tag, dict(_DEFAULT_ENTRY))
        entry["cached_brief"] = brief
        entry["brief_generated_at"] = _now_iso()
        _write_state(state)


def needs_regeneration(container_tag: str) -> bool:
    entry = get_deal_state(container_tag)
    if entry["cached_brief"] is None:
        return True
    if entry["brief_generated_at"] is None:
        return True
    ingested_at = entry["last_ingested_at"]
    if ingested_at is not None and ingested_at > entry["brief_generated_at"]:
        return True
    return False

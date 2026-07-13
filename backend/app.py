"""Thin FastAPI wrapper around mind.py's generate_brief(). All synthesis
logic stays in mind.py, untouched -- this is a pass-through with a
backend-owned staleness cache (state.py) so the frontend never has to
reason about when to call Claude vs. serve a cached brief.
"""
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))
from mind import generate_brief, BriefGenerationError  # noqa: E402

from fastapi import FastAPI, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import state
from ingest_core import ACCOUNT_NAMES, CHAMPIONS, TAG_TO_DEAL_FOLDER, container_tag_for, ingest_interaction

app = FastAPI(title="SaleSights API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/deals")
def list_deals():
    deals = []
    for deal_folder, account in ACCOUNT_NAMES.items():
        tag = container_tag_for(deal_folder)
        cached = state.get_deal_state(tag)["cached_brief"]
        champion = CHAMPIONS[deal_folder]
        deals.append(
            {
                "containerTag": tag,
                "dealFolder": deal_folder,
                "champion": champion["name"],
                "role": champion["role"],
                "account": account,
                # null until this deal's brief has been generated at
                # least once -- stage is Claude output, not static data.
                "stage": cached["stage"] if cached else None,
            }
        )
    return deals


@app.get("/api/brief")
def get_brief(
    deal: str,
    context: str,
    force: bool = False,
    x_anthropic_api_key: str | None = Header(default=None),
):
    if deal not in TAG_TO_DEAL_FOLDER:
        return JSONResponse(status_code=404, content={"error": f"Unknown deal '{deal}'"})

    if not (force or state.needs_regeneration(deal)):
        return state.get_deal_state(deal)["cached_brief"]

    # Caught explicitly here (rather than via @app.exception_handler) so
    # the error response is always produced by the *route*, going through
    # FastAPI's normal CORSMiddleware-wrapped response path every time --
    # relying on Starlette's exception-handler dispatch was empirically
    # dropping CORS headers on error responses (a documented ASGI
    # middleware-ordering gotcha), which surfaced in the browser as an
    # opaque "CORS policy" failure instead of the real error message.
    try:
        # X-Anthropic-Api-Key lets a visitor bring their own Claude key
        # (e.g. a judge trying the deployed demo) instead of spending the
        # team's -- never persisted server-side, used for this one call.
        brief = generate_brief(deal, context, anthropic_api_key=x_anthropic_api_key)
    except BriefGenerationError as err:
        return JSONResponse(status_code=503, content={"error": str(err)})
    except Exception as err:  # noqa: BLE001 -- deliberate catch-all, see comment above
        return JSONResponse(
            status_code=500, content={"error": f"{type(err).__name__}: {err}"}
        )

    state.save_brief(deal, brief)
    return brief


@app.post("/api/deals/{container_tag}/interactions")
def add_interaction(container_tag: str, body: dict = Body(...)):
    deal_folder = TAG_TO_DEAL_FOLDER.get(container_tag)
    if deal_folder is None:
        return JSONResponse(status_code=404, content={"error": f"Unknown deal '{container_tag}'"})

    for field in ("category", "title", "content"):
        if not body.get(field):
            return JSONResponse(
                status_code=422, content={"error": f"Missing required field '{field}'"}
            )

    try:
        result = ingest_interaction(
            deal_folder=deal_folder,
            category=body["category"],
            title=body["title"],
            content=body["content"],
            date=body.get("date"),
        )
    except ValueError as err:
        return JSONResponse(status_code=422, content={"error": str(err)})
    except Exception as err:  # noqa: BLE001
        return JSONResponse(
            status_code=500, content={"error": f"{type(err).__name__}: {err}"}
        )

    state.mark_ingested(container_tag)
    return {"documentId": result["documentId"], "status": result["status"]}

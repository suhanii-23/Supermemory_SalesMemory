"""
SalesMemory brief generator (Python)
--------------------------------------
Run this ~30 min before a meeting (cron, calendar webhook, or a "Refresh"
button in the dashboard). It does two calls, matching the pattern in
Supermemory's own quickstart (https://supermemory.ai/docs/quickstart):

  1. client.profile() -- returns a static/dynamic user profile PLUS bundled
     search_results, scoped to one deal's containerTag.
  2. client.search.documents() -- a second, document-level search so we can
     cite exact source text (who said it, what type of document, when) for
     the dashboard's "What they said" cards, which profile's bundled
     memories don't carry the same source metadata for.
  3. Claude, given both, turns it into the exact JSON shape the dashboard
     cards expect (Remember / They'll ask / You should say / Risks).

Supermemory does recall, Claude does synthesis, the dashboard just renders.

Works against both the hosted API and a self-hosted instance -- see
https://supermemory.ai/docs/self-hosting/quickstart. Point
SUPERMEMORY_BASE_URL at your local server and everything below is identical.

    pip install supermemory anthropic

    SUPERMEMORY_API_KEY=sm_... ANTHROPIC_API_KEY=sk-ant-... python generate_brief.py

    # Self-hosted:
    SUPERMEMORY_API_KEY=sm_... SUPERMEMORY_BASE_URL=http://localhost:6767 \\
      ANTHROPIC_API_KEY=sk-ant-... python generate_brief.py
"""

import os
from dotenv import load_dotenv
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

load_dotenv(Path(__file__).parent / ".env")
import json
import re

from supermemory import Supermemory
import anthropic

# base_url is only passed when explicitly set -- the SDK's own default
# (hosted https://api.supermemory.ai) only kicks in when the kwarg is
# omitted entirely; passing base_url=None explicitly breaks it (resolves
# to an empty base URL instead of falling back).
_supermemory_kwargs = {"api_key": os.environ.get("SUPERMEMORY_API_KEY")}
if os.environ.get("SUPERMEMORY_BASE_URL"):
    _supermemory_kwargs["base_url"] = os.environ["SUPERMEMORY_BASE_URL"]

memory = Supermemory(**_supermemory_kwargs)
claude = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# NOTE: tried enforcing this via output_config.format (Structured Outputs) --
# Claude rejected it with "the compiled grammar is too large" (400). The
# schema has 11 top-level fields with nested objects/enums, past what the
# grammar compiler will constrain-decode in one request. Falling back to
# prompt-based JSON (see the system prompt below), with a regex-based
# extraction that's robust to code fences and stray prose (see
# generate_brief) instead of the original naive string-replace.
BRIEF_SCHEMA = """
{
  "remember": [
    {
      "text": "...",
      "importance": "High | Medium | Low",
      "evidence": ["document ids or titles"]
    }
  ],

  "theyllAsk": [
    {
      "question": "...",
      "confidence": "High | Medium | Low",
      "reason": "...",
      "evidence": ["document ids or titles"]
    }
  ],

  "youShouldSay": [
    {
      "text": "...",
      "supports": ["document ids or titles"]
    }
  ],

  "risks": [
    {
      "text": "...",
      "severity": "High | Medium | Low",
      "evidence": ["document ids or titles"]
    }
  ],

  "buyingIntent": {
    "level": "High | Medium | Low | Unknown",
    "confidence": "High | Medium | Low",
    "reason": "...",
    "evidence": ["document ids or titles"]
  },

  "sentiment": {
    "trend": "Improving | Stable | Declining | Mixed | Unknown",
    "confidence": "High | Medium | Low",
    "reason": "...",
    "evidence": ["document ids or titles"]
  },
  "relationshipMemory":[
{
"text":"...",
"importance":"High | Medium | Low",
"evidence":["..."]
}
],

  "stage": "...",

  "nextSteps": [
    {
      "label": "...",
      "done": true,
      "evidence": ["document ids or titles"]
    }
  ],

  "quotes": [
    {
      "speaker": "...",
      "role": "...",
      "sourceType": "...",
      "date": "...",
      "document": "...",
      "text": "Exact verbatim quote."
    }
  ],

  "timeline": [
    {
      "date": "...",
      "title": "...",
      "detail": "...",
      "evidence": ["document ids or titles"]
    }
  ]
}
"""


class BriefGenerationError(Exception):
    """Raised when generate_brief can't produce a usable brief."""


def generate_brief(
    deal_container_tag: str,
    meeting_context: str,
    anthropic_api_key: str | None = None,
) -> dict:
    # 1. Profile (static facts + dynamic context + bundled memories) and
    # 2. document-level search (gives us category/date/title metadata so
    # Claude can attribute a quote to "Email, Ahmed Farouk, 3 days ago"
    # rather than a floating fact) are independent reads -- run them
    # concurrently instead of back-to-back to cut latency.
    with ThreadPoolExecutor(max_workers=2) as pool:
        profile_future = pool.submit(
            memory.profile, container_tag=deal_container_tag, q=meeting_context
        )
        search_future = pool.submit(
            memory.search.documents,
            q=meeting_context,
            container_tags=[deal_container_tag],
            limit=15,
        )
        profile = profile_future.result()
        search = search_future.result()

    static = "\n".join(profile.profile.static)
    dynamic = "\n".join(profile.profile.dynamic)
    bundled_memories = "\n".join(
        r.get("memory", "") for r in profile.search_results.results
    )

    # Bail before spending Claude tokens if Supermemory has nothing yet --
    # this happens for a deal whose background memory extraction hasn't
    # finished (ingest is async). Generating a brief from an empty profile
    # just produces an empty-but-billed brief.
    if not (static or dynamic or bundled_memories or search.results):
        raise BriefGenerationError(
            f"No Supermemory data available yet for '{deal_container_tag}' -- "
            "memory extraction may still be processing. Try again shortly."
        )

    # Higher-fidelity sources first (calls/meetings) so Claude leans on them
    # over lower-weight ones (internal sales_notes) when context is tight.
    # Uses the `weight` metadata ingest.py already writes on every document.
    ranked_results = sorted(
        search.results,
        key=lambda r: r.metadata.get("weight", 0) if r.metadata else 0,
        reverse=True,
    )

    context = f"""
========================
MEETING
========================

{meeting_context}


========================
ACCOUNT PROFILE
========================

{static}


========================
RECENT DEVELOPMENTS
========================

{dynamic}


========================
SUPERMEMORY PROFILE MEMORIES
========================

{bundled_memories}


========================
RETRIEVED SOURCE DOCUMENTS
========================

The following are the original retrieved documents.
Use these for evidence and verbatim quotations.

{json.dumps([_to_dict(r) for r in ranked_results], indent=2, default=str)}
"""
    # 3. Ask Claude to synthesize the brief in the dashboard's shape.
    # A per-request key (e.g. a judge/user pasting their own Anthropic key
    # into the dashboard) uses a throwaway client for just this call;
    # otherwise falls back to the module-level client built from .env.
    client = anthropic.Anthropic(api_key=anthropic_api_key) if anthropic_api_key else claude
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=10000,
        system=(
            """You are an enterprise sales analyst preparing a pre-meeting brief.
            Your job is NOT to summarize.
            Your job is to produce an evidence-backed report that another salesperson
            can completely trust.
            Rules:
            1. Every factual statement must be supported by the retrieved context.
            2. Never invent names, dates, numbers, quotes, stages or recommendations.
            3. If evidence is insufficient, return [ ], Never guess.
            4. Quotes MUST be exact substrings from the retrieved documents. Do not summarize. Do not rewrite.If no suitable quote exists, return an empty array.
            5. Every insight must include evidence using the supplied document title or metadata.
            6. Separate facts from recommendations. Facts belong in Remember, Risks, Timeline and Quotes.
            Recommendations belong only in YouShouldSay.
            7. Buying Intent and Sentiment must NEVER be numeric.
            Return:
            - Level
            - Confidence
            - Reason
            - Evidence
            instead.
            8. If multiple documents disagree, mention the disagreement rather than choosing one.
            9. Only predict buyer questions that are directly supported by previous emails, meetings or calls.
            10. Respond with valid JSON only.
            The JSON must exactly match this schema:""" + BRIEF_SCHEMA
            ),
        messages=[
            {
                "role": "user",
                "content": context,
            }
        ],
    )

    if msg.stop_reason == "max_tokens":
        raise BriefGenerationError(
            f"Claude's response was truncated at {msg.usage.output_tokens} "
            "output tokens -- raise max_tokens and retry, the brief JSON is incomplete."
        )

    # Extract the outermost {...} block instead of literal-replacing
    # ```json fences -- robust to prose before/after the JSON and to a
    # legitimate ``` substring appearing inside a quoted field, neither of
    # which the original .replace("```json", "") handled safely.
    text = next((b.text for b in msg.content if b.type == "text"), "{}")
    match = re.search(r"\{.*\}", text, re.DOTALL)
    json_str = match.group(0) if match else text
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as err:
        raise BriefGenerationError(
            f"Claude's response wasn't valid JSON ({err}). "
            f"stop_reason={msg.stop_reason}, response length={len(text)} chars."
        ) from err


def _to_dict(obj):
    """SDK responses are pydantic-style models; fall back gracefully if not."""
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "__dict__"):
        return obj.__dict__
    return obj


if __name__ == "__main__":
    # Example call -- wire this to your calendar webhook / cron / dashboard button
    brief = generate_brief(
        "deal-rayhan-nvidia",
        "Discovery call with Rayhan Sadat in 30 minutes",
    )
    print(json.dumps(brief, indent=2))
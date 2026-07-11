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

load_dotenv(Path(__file__).parent / ".env")
import json

from supermemory import Supermemory
import anthropic

memory = Supermemory(
    api_key=os.environ.get("SUPERMEMORY_API_KEY"),
    base_url=os.environ.get("SUPERMEMORY_BASE_URL") or None,
)
claude = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

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


def generate_brief(deal_container_tag: str, meeting_context: str) -> dict:
    # 1. Profile: static facts + dynamic (recent) context + Supermemory's own
    # bundled relevant memories, exactly per the quickstart pattern.
    profile = memory.profile(container_tag=deal_container_tag, q=meeting_context)

    static = "\n".join(profile.profile.static)
    dynamic = "\n".join(profile.profile.dynamic)
    bundled_memories = "\n".join(
        r.get("memory", "") for r in profile.search_results.results
    )

    # 2. Document-level search: gives us the metadata (category, date, title)
    # we wrote on ingest, so Claude can attribute a quote to "Email, Ahmed
    # Farouk, 3 days ago" rather than just a floating fact.
    search = memory.search.documents(
        q=meeting_context,
        container_tags=[deal_container_tag],
        limit=15,
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

{json.dumps([_to_dict(r) for r in search.results], indent=2, default=str)}
"""
    # 3. Ask Claude to synthesize the brief in the dashboard's shape.
    msg = claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
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
            9.Only predict buyer questions that are directly supported by previous emails, meetings or calls.
            10. Respond with valid JSON only.
            The JSON must exactly match this schema:""" + BRIEF_SCHEMA
            ),
        messages=[
            {
                "role": "user",
                "content": f"Meeting context: {meeting_context}\n\n{context}",
            }
        ],
    )

    text = next((b.text for b in msg.content if b.type == "text"), "{}")
    cleaned = text.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)


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
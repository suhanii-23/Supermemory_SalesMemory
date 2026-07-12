# SaleSights — A Persistent AI Memory Layer for B2B Sales

Built on **Supermemory** (persistent, entity-scoped memory) and **Claude** (evidence-grounded synthesis). SaleSights ingests every customer interaction — email, calls, CRM, Slack, security reviews, negotiation — and turns it into a structured, source-cited pre-meeting brief, per deal, that updates itself as new interactions happen.

---

## 1. Problem Statement

Sales conversations happen across a dozen disconnected surfaces — email, calls, Slack, CRM notes, security reviews, negotiation threads — and none of them talk to each other. The knowledge from every interaction lives in someone's memory, not in a system, so it disappears the moment that person is busy, distracted, or leaves. Reps walk into meetings unprepared, promises get forgotten, and deals stall not because the product was wrong, but because nobody remembered what the customer already told them.

**Anchor example (from the actual dataset):** Padma Deepak, VP Cloud Applications at Oracle, told her sales rep in the very first discovery call why she was even taking the meeting — her team had nearly lost a $2M healthcare account because a critical piece of context lived only in one person's memory, not anywhere the rest of the team could access. That's the exact failure mode this project prevents.

---

## 2. Synopsis

SaleSights is a persistent AI memory layer for B2B sales. Instead of scattering customer context across email, call transcripts, CRM entries, Slack, and security review threads — where it lives only as long as someone remembers it — SaleSights ingests every interaction into a per-deal memory that persists independently of any one rep. Before a meeting, it retrieves that memory and synthesizes it into a structured, evidence-cited brief: what to remember, what the buyer will likely ask, what to say, what's at risk, how buying intent and sentiment are trending, and a full timeline — each point traceable back to the exact document it came from. When a new interaction happens, the memory updates incrementally, and the brief regenerates only when something's actually changed.

Validated end-to-end on **four realistic sales deals** (Oracle, NVIDIA, IntelliBuddies, Nokia) spanning cold outreach through close, with a working ingestion pipeline, a FastAPI backend, and a full React dashboard.

---

## 3. Proposed Solution — 5 Pillars

1. **Ingest everything, scoped per deal.** Every interaction is pushed into Supermemory under a deal-specific container, so one customer's context can never bleed into another's.
2. **Let memory synthesize itself.** Supermemory extracts and maintains an evolving profile per deal — stable facts separated from current-state facts — updated incrementally, not rebuilt from scratch.
3. **Turn retrieved memory into a structured, cited brief.** Claude synthesizes an 11-field brief from retrieved memory, grounded in real evidence, never guessing.
4. **Close the loop with live ingestion.** Reps log what happened after a meeting; that new memory triggers a targeted re-synthesis, not a full reprocess.
5. **Make the memory visible.** Every insight on the dashboard links back to its exact source document — trust isn't assumed, it's inspectable.

---

## 4. Repository Structure — Top Level

```
Supermemory_SalesMemory/
├── dataset/          # 4 synthetic-but-realistic sales deals (276 files total)
├── ingest/           # Bulk ingestion script + a manual test script
├── backend/          # FastAPI wrapper: memory logic, ingestion core, staleness cache
├── frontend/         # React + Vite + TypeScript dashboard (the product itself)
├── web/              # Next.js marketing/landing site (separate from the dashboard)
├── mind.py            # THE core brief-synthesis engine (Supermemory + Claude)
├── test_profile.py    # One-off debug script, inspects the SDK's profile() signature
└── requirements.txt   # Python dependencies for the backend/ingestion side
```

---

## 5. The Dataset (`dataset/`)

Four synthetic sales deals, each with **69 files** across **12 interaction categories**, spanning the full deal lifecycle from cold outreach to closed-won or closed-lost. This is the raw material that gets ingested — designed to simulate what a real CRM + inbox + call-recorder + Slack workspace produces over months of a deal.

| Deal folder | Account | Champion | Role | Outcome |
|---|---|---|---|---|
| `padma_oracle` | Oracle Corporation, Cloud Applications | Padma Deepak | VP, Cloud Applications | Closed Won |
| `rayhan_nvidia` | NVIDIA, AI Infrastructure | Rayhan Sadat | Sr. AI Infrastructure Engineer | Closed Lost |
| `rithvik_intellibuddies` | IntelliBuddies | Rithvik RK | Founder | Closed Won |
| `suhani_nokia` | Nokia, Network Ops | Suhani Jain | Director, Network Ops | Closed Won |

**The 12 interaction categories present in every deal folder:**

| Category | What it contains | Retrieval weight |
|---|---|---|
| `calls` | Call transcripts (discovery, demo, security kickoff, negotiation, signature) | 1.0 (highest) |
| `meetings` | In-person/video meeting notes | 0.9 |
| `executive` | Executive sponsor escalation notes | 0.9 |
| `negotiation` | Pricing/terms negotiation threads | 0.9 |
| `emails` | Full email threads, cold outreach through close | 0.8 |
| `security` | Security review scope, questionnaires, findings | 0.8 |
| `proposals` | Formal proposal documents | 0.8 |
| `outcome` | Final deal outcome record (won/lost, why) | 0.7 |
| `procurement` | Procurement/legal process notes | 0.6 |
| `slack` | Internal Slack conversations about the deal | 0.6 |
| `crm` | CRM stage-change snapshots (discovery → close) | 0.5 |
| `sales_notes` | Internal-only rep notes, never customer-facing | 0.4 (lowest) |

**Filename convention:** every file is named `{sequence}_{ISO date}_{slug}.txt` — e.g. `010_2026-02-24_security_review_kickoff.txt`. This encodes chronological order and a human-readable title directly into the filename, which the ingestion script parses into structured metadata rather than re-deriving it from file content.

**Why the weight matters:** these numbers are written as metadata on every ingested document and used later by `mind.py` to rank retrieved sources — so when Claude is synthesizing a brief, a verbatim call transcript quote outranks an internal sales note paraphrasing the same thing.

---

## 6. Ingestion Layer (`ingest/`, `backend/ingest_core.py`)

This is the layer that turns raw files into Supermemory memory, scoped and tagged correctly.

### 6.1 `backend/ingest_core.py` — Single Source of Truth

The most architecturally important file in the ingestion path. Its own docstring states its purpose: *"Single source of truth for turning (deal, category, title, content, date) into a Supermemory document."* Used by **both** the bulk import script and the live "add interaction" API endpoint, so a document added on day one and a document added live during a demo are shaped identically and indistinguishable to the brief generator.

**What it owns:**

- **`container_tag_for(deal_folder)`** — derives the Supermemory `containerTag` from a folder name (e.g. `padma_oracle` → `deal-padma-oracle`). One container per deal; this is the boundary that guarantees Rayhan's NVIDIA data can never leak into Padma's Oracle brief.
- **`ACCOUNT_NAMES`** — human-readable account name per deal (e.g. `"NVIDIA, AI Infrastructure"`).
- **`ENTITY_CONTEXT`** — a short paragraph per deal (max ~1500 chars) that tells Supermemory what this container is actually about, steering what gets extracted as a "fact." Example (Oracle): *"Enterprise sales deal between MemoryIQ and Oracle Corporation (Cloud Applications). Champion: Padma Deepak, VP Cloud Applications. Focus on buying-committee roles, security/legal review milestones, competitive positioning against Gong, and commercial terms."*
- **`SOURCE_WEIGHT`** — the category → retrieval-priority map described above.
- **`CHAMPIONS`** — name + role per deal (added specifically for the dashboard's roster screen, since `ACCOUNT_NAMES` alone doesn't carry a person's name).
- **`TAG_TO_DEAL_FOLDER`** — reverse lookup, so an incoming API request carrying a `containerTag` can be resolved back to its dataset folder.
- **`build_document(...)`** — pure function (no network call) that shapes one Supermemory document payload: content, containerTag, customId, metadata, entityContext.
- **`add_document(doc)`** — the *one* place in the entire codebase that calls `client.add()`. Both the bulk-import retry loop and the live single-shot endpoint route through this one function.
- **`ingest_interaction(...)`** — the entry point used by the live "+ New Interaction" feature. Generates a UUID-suffixed `customId` (bulk files use a stable filename-derived ID; live adds need collision-safe uniqueness instead).

### 6.2 `ingest/ingest.py` — Bulk Import Script

Walks `dataset/<deal>/<category>/<file>.txt` and pushes every one of the 276 files into Supermemory.

**Design details:**
- Parses each filename with a regex (`FILENAME_RE`) into sequence, date, and title — turning file-path structure into queryable metadata instead of requiring content re-parsing later.
- **`customId` = `{deal}:{category}:{filename-without-extension}`** — this makes ingestion idempotent. Re-running the script after editing the dataset upserts existing documents instead of duplicating them.
- **Batched with retry:** documents are pushed in batches of 5, using a `ThreadPoolExecutor` for concurrency within a batch, with a 1.5s pause between batches (Supermemory's own guidance: 3–5 concurrent requests, 1–2s apart, to stay under rate limits during bulk import).
- **`ingest_with_retry`** wraps each add in up to 3 attempts with linear backoff before giving up on that document.
- After each deal's batch finishes, calls **`mark_ingested(container_tag)`** — this seeds the very first staleness-cache baseline (see §8) so the first `/api/brief` call has something to compare against, and correctly invalidates any previously cached brief if bulk ingest is re-run later.

### 6.3 `ingest/test_search.py` — Manual Debug Script

Not part of the product; a small standalone script that connects to Supermemory and runs one `search.documents()` call against `deal-padma-oracle` for the query "budget freeze," printing raw results. Used during development to verify search was actually returning results before wiring it into `mind.py`.

---

## 7. The Core Engine — `mind.py`

This is the single most important file in the repository — the actual "brain" of the product. Everything else exists to feed it or display its output.

### 7.1 What it does, in one sentence

**Supermemory does recall. Claude does synthesis. Everything downstream just renders.**

### 7.2 The two-call retrieval step

`generate_brief(deal_container_tag, meeting_context)` runs two independent Supermemory reads **concurrently** (via `ThreadPoolExecutor`, to cut latency rather than running them back-to-back):

1. **`client.profile(container_tag=..., q=meeting_context)`** — returns a synthesized profile with two parts:
   - **`static`** — durable facts unlikely to change call-to-call (who the champion is, what the founding pain point was).
   - **`dynamic`** — current-state facts expected to shift (current deal stage, current sentiment).
   - Plus a bundle of raw relevant memories.
2. **`client.search.documents(q=..., container_tags=[...], limit=15)`** — a second, document-level search that returns exact source text *with* metadata (category, date, title) — because `profile()`'s bundled memories don't carry that per-document attribution, and the brief's quotes need to cite exactly who said what and when.

### 7.3 The empty-data guard

Before spending a single Claude token, `generate_brief` checks whether Supermemory actually returned anything. If not — because a deal's background extraction hasn't finished yet — it raises `BriefGenerationError` rather than generating an empty-but-billed brief from nothing. This is a deliberate design decision, not an oversight: **the system refuses to guess when it doesn't have data.**

### 7.4 Source ranking

Retrieved search results are sorted by the `weight` metadata written at ingest time (§6), so higher-fidelity sources (calls, meetings) are presented to Claude ahead of lower-weight ones (internal sales notes) when context space is tight.

### 7.5 The synthesis call — Claude's system prompt

Claude is given the assembled context (meeting info, account profile, recent developments, bundled memories, ranked source documents) with an explicit, hardened rule set:

1. Every factual statement must be supported by retrieved context.
2. Never invent names, dates, numbers, quotes, stages, or recommendations.
3. If evidence is insufficient, return an empty list — never guess.
4. Quotes must be **exact substrings** of retrieved documents — no summarizing, no rewriting.
5. Every insight must cite its evidence via document title/metadata.
6. Facts (Remember, Risks, Timeline, Quotes) are kept separate from recommendations (only `youShouldSay` is allowed to recommend).
7. Buying Intent and Sentiment must **never be numeric** — only qualitative Level/Trend + Confidence + Reason + Evidence.
8. If sources disagree, the disagreement is reported rather than one side being silently picked.
9. Predicted buyer questions must be traceable to prior emails/meetings/calls, not invented.
10. Response must be valid JSON matching the schema exactly.

**A real engineering note preserved in the code comments:** the team first tried enforcing this schema via Claude's Structured Outputs (`output_config.format`), but it was rejected with *"the compiled grammar is too large"* — the 11-field, nested, enum-heavy schema exceeds what constrained decoding will handle in one request. The fallback is prompt-based JSON generation plus a **regex extraction** (`re.search(r"\{.*\}", text, re.DOTALL)`) that's robust to code fences and stray prose around the JSON — deliberately built to replace an earlier, more fragile naive string-replace approach.

### 7.6 The 11-field brief schema

```
remember            [{ text, importance, evidence }]
theyllAsk           [{ question, confidence, reason, evidence }]
youShouldSay         [{ text, supports }]
risks                [{ text, severity, evidence }]
buyingIntent          { level, confidence, reason, evidence }
sentiment              { trend, confidence, reason, evidence }
relationshipMemory   [{ text, importance, evidence }]
stage                 "..." (plain string)
nextSteps            [{ label, done, evidence }]
quotes               [{ speaker, role, sourceType, date, document, text }]
timeline             [{ date, title, detail, evidence }]
```

Note the qualitative-only enums: `Level = High | Medium | Low`; `buyingIntent.level` additionally allows `Unknown`; `sentiment.trend = Improving | Stable | Declining | Mixed | Unknown`. No numeric scores anywhere — a deliberate choice to keep every claim tied to a stated confidence and reason rather than an unexplainable number.

### 7.7 Failure handling

- **Truncated response** (`stop_reason == "max_tokens"`) → raises `BriefGenerationError` rather than silently returning a partial/broken JSON object.
- **Invalid JSON** → caught explicitly, re-raised as `BriefGenerationError` with the parse error, stop reason, and response length included for debugging.

---

## 8. Backend (`backend/`)

A thin FastAPI layer whose entire purpose is to make `mind.py` (a script) callable from a browser, plus own the staleness cache so the frontend never has to decide when to call Claude.

### 8.1 `backend/state.py` — The Dirty-Flag Cache

The mechanism that ensures Claude is called **only when a deal's memory has actually changed**, not on every dashboard click.

- **Storage:** a JSON file (`state.json`) on disk, one entry per `containerTag`: `{ last_ingested_at, cached_brief, brief_generated_at }`.
- **Concurrency:** a single process-wide `Lock()` serializes read-modify-write cycles (FastAPI runs sync handlers in a threadpool, so multiple requests against one process are genuinely concurrent). Explicitly documented as *not* safe against a second OS process writing concurrently — acceptable because bulk ingest always finishes before the backend starts.
- **Atomic writes:** every write goes to a `.tmp` file first, then an atomic `Path.replace()` — so a crash mid-write can never leave a half-written, corrupting `state.json`. A corrupted/missing file self-heals to `{}` on read rather than crashing the app.
- **`mark_ingested(container_tag)`** — bumps `last_ingested_at` to now. Called both by the bulk ingest script (once per deal) and by the live "add interaction" endpoint (every time).
- **`save_brief(container_tag, brief)`** — stores a freshly generated brief and stamps `brief_generated_at`.
- **`needs_regeneration(container_tag)`** — the actual dirty-flag logic: `True` if there's no cached brief yet, OR if `last_ingested_at` is more recent than `brief_generated_at`. Otherwise `False` — safe to serve the cached brief with zero Claude calls.
- All timestamps come from one shared `_now_iso()` function, because the staleness comparison uses plain string `>` — which is only chronologically valid if every timestamp shares the identical fixed-offset ISO-8601 format.

**Net effect:** switching between all four profiles in a demo costs at most four Claude calls total, ever — not four calls every time you click around.

### 8.2 `backend/app.py` — The API

```
GET  /api/deals
     -> [{ containerTag, dealFolder, champion, role, account, stage }]
     stage is null until that deal's brief has been generated at least once
     (stage is Claude's output, not raw static data)

GET  /api/brief?deal={containerTag}&context={text}&force={bool}
     -> the 11-field brief JSON
     -> if force=false and the cache is fresh: returned directly, no Claude call
     -> if regeneration is needed: calls mind.generate_brief(), saves it, returns it
     -> BriefGenerationError -> HTTP 503 { "error": "..." }
     -> unexpected exception -> HTTP 500 { "error": "ClassName: message" }

POST /api/deals/{containerTag}/interactions
     body: { category, title, content, date? }
     -> validates the containerTag resolves to a known deal
     -> validates category/title/content are present
     -> calls ingest_core.ingest_interaction(...)
     -> calls state.mark_ingested(containerTag) -- this is what invalidates
        the cache so the NEXT /api/brief call is forced to regenerate
     -> { documentId, status }
```

**A specific, real debugging note preserved in the code:** error responses are handled with explicit `try/except` inside each route rather than a global `@app.exception_handler`, because relying on Starlette's exception-handler dispatch was empirically found to drop CORS headers on error responses — a documented ASGI middleware-ordering issue. That surfaced in the browser as an opaque "CORS policy" failure instead of the real error message, so the fix was to always produce error responses from inside the route itself, going through the normal CORS-wrapped response path every time.

---

## 9. Frontend (`frontend/`)

A Vite + React 19 + TypeScript + Tailwind v4 dashboard — the actual product surface a sales rep would use.

### 9.1 `src/types/brief.ts`

A TypeScript mirror of `mind.py`'s schema, field-for-field, enum-for-enum — including the file's own top-of-file warning comment: *"Mirrors mind.py's BRIEF_SCHEMA exactly — 11 top-level fields, no more, no fewer. Do not add/remove fields here without changing mind.py's system prompt first."* Also defines `INTERACTION_CATEGORIES` (the exact 11-category vocabulary from `SOURCE_WEIGHT`, so the "+ New Interaction" form can never submit a free-typed category that would break the weighting system) and `CATEGORY_LABELS` for human-readable display.

### 9.2 `src/api/brief.ts`

The fetch layer, with a built-in **mock mode** (`VITE_USE_MOCK=true`) that returns canned data instead of hitting the backend — including a special `deal-mock-empty` fixture id specifically for exercising every card's empty state without needing a genuinely thin real deal. `meetingContextFor(deal)` auto-generates the meeting context string client-side: `"Upcoming meeting with {champion}, {role} at {account}"` — computed on deal selection, no manual text entry required.

### 9.3 Component Architecture

| Area | Files | Purpose |
|---|---|---|
| Shared | `Badge.tsx`, `EvidenceChips.tsx`, `EmptyState.tsx`, `SectionCard.tsx`, `Avatar.tsx` | Reusable primitives — badges parameterized by tone (not raw level string), explicit empty-evidence rendering, avatar with photo-fallback to colored initials |
| Roster | `RosterGrid.tsx`, `CustomerCard.tsx` | Customer selector — avatar, name/role/account, current stage |
| Header | `DashboardHeader.tsx`, `RefreshBriefButton.tsx` | Profile header + explicit "Refresh brief" (force regenerate) action |
| Interactions | `NewInteractionForm.tsx` | The post-meeting logging form — category dropdown, title, date, content |
| List insight cards | `ListInsightCard.tsx` (generic engine) + `RememberCard.tsx`, `RisksCard.tsx`, `RelationshipMemoryCard.tsx` | Three fields share an identical `{text, importance/severity, evidence}` shape — one generic engine, three thin wrappers |
| They'll Ask | `TheyllAskCard.tsx` | Deliberately **separate** template (question + reason + confidence) — not collapsed into the generic list engine, since its shape genuinely differs |
| You Should Say | `YouShouldSayCard.tsx` | Separate — text + supports chips, no severity badge (it's a recommendation, not a fact) |
| Intent/Sentiment | `BuyingIntentPanel.tsx`, `SentimentPanel.tsx` | Compact single-object panels, not list cards |
| Next Steps | `NextStepsChecklist.tsx` | Checklist rendering, `done:true` shown struck-through |
| Quotes | `QuotesGrid.tsx`, `QuoteCard.tsx` | Verbatim text in distinct styling, full source attribution visible |
| Timeline | `TimelineList.tsx`, `TimelineEntry.tsx` | Chronological, evidence chips per entry |
| Toasts | `LiveToastFeed.tsx`, `Toast.tsx`, `ToastContext.tsx` | Cycles cosmetic "live update" messages; also reused for the real "Interaction added" toast |
| States | `BriefLoadingState.tsx`, `BriefErrorState.tsx` | Real, designed empty/error states — error state renders the actual 503 message + retry, not a generic failure |
| Orchestration | `pages/DashboardPage.tsx` | Owns selected-deal state, drives loading/error/loaded branching, manages the sync-delay timer |

### 9.4 The Badge/Tone System (`lib/badgeTone.ts`)

One centralized mapping from schema values to visual tone — `High → terracotta`, `Medium → dusty blue`, `Low → muted navy`, `Unknown → neutral gray`. **A specific resolved design constraint:** `sentiment.trend` has 5 possible values (`Improving/Stable/Declining/Mixed/Unknown`) but the brand only has 3 usable tones — solved by pairing a tone (positive-leaning / needs-attention / neutral) with a directional icon (`↑ / → / ↓ / ↔ / ?`) rather than inventing a new color outside the brand palette.

### 9.5 The Post-Meeting Loop (`NewInteractionForm.tsx` + `DashboardPage.tsx`)

The end-to-end "the system actually learns" feature:
1. Rep fills the form (constrained category dropdown, title, date, content) and submits.
2. `POST /api/deals/{tag}/interactions` fires → backend ingests the new document and bumps `last_ingested_at`.
3. The header's "Memory synced" pill flips to a **"Syncing…"** state for a fixed delay (`SYNC_DELAY_MS = 18000`, i.e. 18 seconds) before re-enabling the Refresh button.
4. **Why the delay exists, verbatim from the code comment:** *"Supermemory's extraction is async — firing a regenerate immediately after adding an interaction would just resynthesize before the new content is actually indexed."* The dirty-flag guarantees a regeneration *will* happen; the delay guarantees it isn't wasted by firing before Supermemory has actually processed the new memory.
5. Rep hits Refresh → brief regenerates, now reflecting the just-logged interaction (new timeline entry, shifted sentiment, possibly a new quote).

### 9.6 Real Photos

`src/assets/customers/{padma-deepak, rayhan-sadat, rithvik-rk, suhani-jain}.jpg` — actual profile photos per champion, with `Avatar.tsx` falling back to colored initials (hashed from `containerTag`, rotating through the brand palette) if a photo is missing, so the roster never breaks on a missing asset.

---

## 10. Marketing Site (`web/`)

A **separate** Next.js 16 application (not the dashboard) — the public-facing landing page, built with Framer Motion and Lucide icons. Structured as a single scrollable page (`app/page.tsx`) assembled from sections:

```
Navbar → Hero → TrustLogos → TrustedMemorySection → LiveMetricsSection
       → BriefingPreviewSection → TimelineMemorySection → WhySaleSightsSection
       → FinalCTASection
```

Notable pieces: `DashboardMockup.tsx` (a stylized preview of the product embedded in the hero), `AnimatedCounter.tsx` + `useCountUp.ts` (for the live-metrics section's animated stat counters), `GlassCard.tsx` / `FloatingBubble.tsx` (visual motifs), and `public/logo/mark.png` — the actual brand mark asset referenced throughout both the marketing site and the dashboard's design system.

This is intentionally a **separate build pipeline** (Next.js + PostCSS Tailwind) from the dashboard (Vite + Tailwind v4 via its own plugin) — different tools, deliberately, since one is a marketing site and the other is the actual product surface.

---

## 11. Root-Level Files

| File | Purpose |
|---|---|
| `mind.py` | The core engine — see §7 |
| `requirements.txt` | `requests`, `python-dotenv`, `tqdm`, `supermemory`, `anthropic`, `fastapi`, `uvicorn`, `python-multipart` |
| `test_profile.py` | One-line debug script — prints the installed SDK's `Supermemory.profile` method source, used during development to confirm the exact call signature before wiring it into `mind.py` |
| `.gitignore` | Excludes `state.json`, `.env`, `node_modules`, build artifacts |

---

## 12. Why Supermemory (not just "pass the data to an AI")

At this dataset's scale (4 deals, ~69 files each), you genuinely could paste the whole deal history into a system prompt and get a comparable one-off result — worth conceding openly rather than overselling. The real justification is what naive prompting requires you to rebuild yourself the moment you go past a demo:

| Naive "paste it all in" | What Supermemory does instead |
|---|---|
| Re-reads and re-derives every fact, every single call | Extracts once at ingest; `profile()` returns already-synthesized static/dynamic facts |
| Context window caps how much history fits, ever | Persistent memory store, not bounded by one prompt's size |
| Isolation between customers depends on correct manual filtering | `containerTag` makes isolation structural, not a habit |
| "Has anything changed?" requires you to build tracking yourself | `profile()`/`search()` give a place to query current state directly |
| Single-purpose — only works for whatever script you wrote | Memory persists independent of `mind.py`; any future consumer (Slack bot, mobile app) can query the same container |

**The honest framing:** this isn't "not RAG" — it's RAG shaped around a persistent, incrementally-updated, entity-scoped memory rather than one-shot document Q&A against a static corpus. Concede the overlap; the differentiation is in the memory lifecycle and the structured, cited output contract, not in fundamentally different retrieval math.

---

## 13. End-to-End Flow Summary (for a single slide)

```
1. Raw interaction happens (call, email, Slack, meeting)
2. ingest_core.build_document() shapes it -> containerTag + metadata + entityContext
3. add_document() -> Supermemory (async extraction begins)
4. Rep opens a deal profile in the dashboard
5. Backend checks state.json: is the cached brief stale?
     No  -> return cached brief instantly, zero Claude calls
     Yes -> mind.py's generate_brief() runs:
              - profile() + search.documents() (concurrent, Supermemory recall)
              - Claude synthesizes the 11-field brief (evidence-grounded, qualitative)
6. Dashboard renders all 11 fields, every claim linked to its source
7. Meeting happens -> rep logs it via "+ New Interaction"
8. last_ingested_at bumped -> next brief request is forced to regenerate
9. Loop repeats, memory compounds over the life of the deal
```
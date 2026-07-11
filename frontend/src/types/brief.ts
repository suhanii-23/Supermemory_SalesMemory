// Mirrors mind.py's BRIEF_SCHEMA exactly -- 11 top-level fields, no more,
// no fewer. Do not add/remove fields here without changing mind.py's
// system prompt first; this file must always match generate_brief()'s
// real output shape.

export type Level = "High" | "Medium" | "Low";
export type BuyingIntentLevel = Level | "Unknown";
export type SentimentTrend = "Improving" | "Stable" | "Declining" | "Mixed" | "Unknown";

export interface RememberItem {
  text: string;
  importance: Level;
  evidence: string[];
}

export interface TheyllAskItem {
  question: string;
  confidence: Level;
  reason: string;
  evidence: string[];
}

export interface YouShouldSayItem {
  text: string;
  supports: string[];
}

export interface RiskItem {
  text: string;
  severity: Level;
  evidence: string[];
}

export interface BuyingIntent {
  level: BuyingIntentLevel;
  confidence: Level;
  reason: string;
  evidence: string[];
}

export interface Sentiment {
  trend: SentimentTrend;
  confidence: Level;
  reason: string;
  evidence: string[];
}

export interface RelationshipMemoryItem {
  text: string;
  importance: Level;
  evidence: string[];
}

export interface NextStepItem {
  label: string;
  done: boolean;
  evidence: string[];
}

export interface QuoteItem {
  speaker: string;
  role: string;
  sourceType: string;
  date: string;
  document: string;
  text: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  detail: string;
  evidence: string[];
}

export interface Brief {
  remember: RememberItem[];
  theyllAsk: TheyllAskItem[];
  youShouldSay: YouShouldSayItem[];
  risks: RiskItem[];
  buyingIntent: BuyingIntent;
  sentiment: Sentiment;
  relationshipMemory: RelationshipMemoryItem[];
  stage: string;
  nextSteps: NextStepItem[];
  quotes: QuoteItem[];
  timeline: TimelineItem[];
}

// GET /api/brief error body shape on 503 (BriefGenerationError) or 404
export interface ApiError {
  error: string;
}

// GET /api/deals item
export interface Deal {
  containerTag: string; // "deal-rayhan-nvidia"
  dealFolder: string; // "rayhan_nvidia" -- used in POST /interactions
  champion: string; // "Rayhan Sadat"
  role: string; // "Sr. AI Infrastructure Engineer"
  account: string; // "NVIDIA, AI Infrastructure"
  stage: string | null; // null until a brief has been generated at least once
}

// Category vocabulary for the "+ New Interaction" form -- must match
// backend/ingest_core.py's SOURCE_WEIGHT keys exactly. Never let a user
// free-type a category; it breaks the weighting system generate_brief()
// relies on.
export const INTERACTION_CATEGORIES = [
  "emails",
  "calls",
  "crm",
  "meetings",
  "slack",
  "negotiation",
  "security",
  "executive",
  "procurement",
  "sales_notes",
  "outcome",
] as const;

export type InteractionCategory = (typeof INTERACTION_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<InteractionCategory, string> = {
  emails: "Email",
  calls: "Call",
  crm: "CRM Update",
  meetings: "Meeting",
  slack: "Slack",
  negotiation: "Negotiation",
  security: "Security Review",
  executive: "Executive",
  procurement: "Procurement",
  sales_notes: "Sales Notes",
  outcome: "Outcome",
};

export interface AddInteractionRequest {
  category: InteractionCategory;
  title: string;
  content: string;
  date?: string;
}

export interface AddInteractionResponse {
  documentId: string;
  status: string;
}

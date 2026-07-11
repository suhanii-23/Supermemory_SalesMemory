import type { Brief } from "../types/brief";

// Realistic mock brief, all 11 fields non-empty -- used to build and
// visually verify every component before wiring the live backend.
export const mockBrief: Brief = {
  remember: [
    {
      text: "Rayhan flagged budget approval happened in the Q1 review — expansion is already pre-qualified on the finance side.",
      importance: "High",
      evidence: ["crm:budget-note", "email:q1-review-recap"],
    },
    {
      text: "He mentioned the team is currently evaluating build-vs-buy for internal tooling — this deal is competing against an internal build proposal, not just other vendors.",
      importance: "High",
      evidence: ["call:2026-06-10-discovery"],
    },
    {
      text: "Prefers async Slack updates over scheduled calls when possible.",
      importance: "Low",
      evidence: ["slack:thread-142"],
    },
  ],
  theyllAsk: [
    {
      question: "How does this integrate with our existing internal data pipeline?",
      confidence: "High",
      reason: "Raised this exact question on the last two calls, unresolved both times.",
      evidence: ["call:2026-06-10-discovery", "call:2026-06-24-followup"],
    },
    {
      question: "What's the migration timeline if we move forward this quarter?",
      confidence: "Medium",
      reason: "Implied urgency in his last email about Q3 planning.",
      evidence: ["email:q3-planning"],
    },
  ],
  youShouldSay: [
    {
      text: "Acknowledge the internal build comparison directly — don't avoid it, address total cost of ownership head-on.",
      supports: ["call:2026-06-10-discovery"],
    },
    {
      text: "Offer to loop in a solutions engineer for the pipeline integration question before the next call, rather than answering live.",
      supports: ["call:2026-06-24-followup"],
    },
  ],
  risks: [
    {
      text: "No technical champion beyond Rayhan has engaged yet — single-threaded relationship risk if he changes roles or loses interest.",
      severity: "High",
      evidence: ["crm:contact-list"],
    },
    {
      text: "Internal build proposal has an executive sponsor; we don't yet have one on our side of this deal.",
      severity: "Medium",
      evidence: ["call:2026-06-10-discovery"],
    },
  ],
  buyingIntent: {
    level: "Medium",
    confidence: "Medium",
    reason: "Budget is approved and he's actively comparing options, but the unresolved build-vs-buy question means this isn't a done deal yet.",
    evidence: ["crm:budget-note", "call:2026-06-10-discovery"],
  },
  sentiment: {
    trend: "Improving",
    confidence: "High",
    reason: "Tone has shifted from skeptical in the first call to actively asking implementation questions — a buying signal, not just diligence.",
    evidence: ["call:2026-06-10-discovery", "call:2026-06-24-followup"],
  },
  relationshipMemory: [
    {
      text: "Previously used a competitor's tool at a past company and had a bad implementation experience — sensitive to onboarding quality.",
      importance: "High",
      evidence: ["call:2026-06-10-discovery"],
    },
    {
      text: "Based in a different timezone than most of the team — best reached in the morning, US Pacific time.",
      importance: "Low",
      evidence: ["slack:thread-098"],
    },
  ],
  stage: "Technical Validation",
  nextSteps: [
    {
      label: "Loop in solutions engineer for pipeline integration deep-dive",
      done: false,
      evidence: ["call:2026-06-24-followup"],
    },
    {
      label: "Send total cost of ownership comparison doc",
      done: false,
      evidence: ["call:2026-06-10-discovery"],
    },
    {
      label: "Confirm budget approval status with finance contact",
      done: true,
      evidence: ["crm:budget-note"],
    },
  ],
  quotes: [
    {
      speaker: "Rayhan Sadat",
      role: "Sr. AI Infrastructure Engineer",
      sourceType: "Call transcript",
      date: "2026-06-24",
      document: "call:2026-06-24-followup",
      text: "I need to understand exactly how this talks to our existing pipeline before I can bring this to my team seriously.",
    },
    {
      speaker: "Rayhan Sadat",
      role: "Sr. AI Infrastructure Engineer",
      sourceType: "Call transcript",
      date: "2026-06-10",
      document: "call:2026-06-10-discovery",
      text: "We got burned on implementation once before, so forgive me if I'm asking a lot of questions upfront.",
    },
  ],
  timeline: [
    {
      date: "2026-05-02",
      title: "First outreach",
      detail: "Initial cold email response — Rayhan expressed interest in a discovery call.",
      evidence: ["email:first-outreach"],
    },
    {
      date: "2026-06-10",
      title: "Discovery call",
      detail: "45-minute call covering current tooling, pain points, and the internal build comparison.",
      evidence: ["call:2026-06-10-discovery"],
    },
    {
      date: "2026-06-24",
      title: "Technical follow-up",
      detail: "Deeper dive into integration requirements, budget confirmed as approved.",
      evidence: ["call:2026-06-24-followup"],
    },
  ],
};

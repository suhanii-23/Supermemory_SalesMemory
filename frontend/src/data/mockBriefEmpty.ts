import type { Brief } from "../types/brief";

// Exercises every card's empty state -- mind.py's system prompt
// explicitly instructs Claude to return [] rather than guess when
// evidence is insufficient, so this is a real, expected shape, not an
// error condition. Every component must render something sensible here,
// not disappear or crash.
export const mockBriefEmpty: Brief = {
  remember: [],
  theyllAsk: [],
  youShouldSay: [],
  risks: [],
  buyingIntent: {
    level: "Unknown",
    confidence: "Low",
    reason: "Not enough retrieved context to assess buying intent yet.",
    evidence: [],
  },
  sentiment: {
    trend: "Unknown",
    confidence: "Low",
    reason: "No prior interactions found to establish a sentiment trend.",
    evidence: [],
  },
  relationshipMemory: [],
  stage: "Discovery",
  nextSteps: [],
  quotes: [],
  timeline: [],
};

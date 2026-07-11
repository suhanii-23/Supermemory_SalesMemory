import type { BuyingIntentLevel, Level, SentimentTrend } from "../types/brief";

export type BadgeTone = "terracotta" | "dusty" | "navy" | "neutral";

// The one place level/severity/confidence strings map to a visual tone.
// High = terracotta (primary accent, most attention), Medium = dusty blue
// (secondary accent), Low = muted navy, Unknown = neutral gray.
const LEVEL_TONE: Record<Level | "Unknown", BadgeTone> = {
  High: "terracotta",
  Medium: "dusty",
  Low: "navy",
  Unknown: "neutral",
};

export function toneForLevel(level: Level | BuyingIntentLevel): BadgeTone {
  return LEVEL_TONE[level] ?? "neutral";
}

// Sentiment has 5 possible trend values but only 3 brand tones exist --
// resolved with tone + a directional icon (see SentimentPanel), not a new
// hue. Tone here just signals "positive-leaning / neutral / needs
// attention" at a glance; the icon carries the actual direction.
const TREND_TONE: Record<SentimentTrend, BadgeTone> = {
  Improving: "dusty",
  Stable: "dusty",
  Declining: "terracotta",
  Mixed: "terracotta",
  Unknown: "neutral",
};

export function toneForTrend(trend: SentimentTrend): BadgeTone {
  return TREND_TONE[trend] ?? "neutral";
}

const TREND_ICON: Record<SentimentTrend, string> = {
  Improving: "↑",
  Stable: "→",
  Declining: "↓",
  Mixed: "↔",
  Unknown: "?",
};

export function iconForTrend(trend: SentimentTrend): string {
  return TREND_ICON[trend] ?? "?";
}

export const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  terracotta: "bg-terracotta-soft text-terracotta border-terracotta/30",
  dusty: "bg-dusty-soft text-dusty border-dusty/30",
  navy: "bg-navy/10 text-navy border-navy/20",
  neutral: "bg-navy/5 text-navy-soft border-navy/10",
};

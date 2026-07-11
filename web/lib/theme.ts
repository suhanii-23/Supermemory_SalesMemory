// Mirrors the color tokens in app/globals.css. Use for inline styles that
// Tailwind utility classes can't express cleanly (e.g. a specific-alpha
// radial-gradient glow) -- everywhere else, prefer the Tailwind classes
// (bg-panel, text-accent, border-border-glass, etc.) over these.
export const theme = {
  background: "#FAFAF8",
  panel: "#303B07",
  accent: "#C6F36D",
  muted: "#9AA18C",
  cardGlass: "rgba(255,255,255,0.05)",
  borderGlass: "rgba(255,255,255,0.08)",
} as const;

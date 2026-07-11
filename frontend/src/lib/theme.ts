// Mirrors the color tokens in index.css's @theme block. Use for inline
// styles Tailwind classes can't express cleanly -- everywhere else prefer
// the Tailwind utility classes (bg-terracotta, text-navy, etc).
export const theme = {
  navy: "#2B313A",
  navySoft: "#4A5361",
  cream: "#F4EBE2",
  creamSoft: "#FAF6F1",
  terracotta: "#D9824E",
  terracottaSoft: "#F1D3BD",
  dusty: "#6E828D",
  dustySoft: "#DBE3E6",
} as const;

// Rotated palette for the Avatar initials fallback -- deliberately
// excludes cream (too close to most card backgrounds to read as a filled
// circle).
export const AVATAR_TONES = ["navy", "terracotta", "dusty"] as const;

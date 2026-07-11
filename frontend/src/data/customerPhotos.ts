// Maps dealFolder -> photo asset URL, built from whatever files actually
// exist in assets/customers/ at build time via import.meta.glob. This is
// deliberately NOT a hardcoded map of static imports -- a static import
// of a missing file is a hard Vite compile/dev-server error, which would
// violate "don't block on images existing." glob only picks up files
// that are actually present, so a missing photo simply means that key is
// absent from this map, and Avatar.tsx's onError + undefined-src fallback
// (colored initials) takes over cleanly.
const photoModules = import.meta.glob<{ default: string }>(
  "../assets/customers/*.{jpg,jpeg,png}",
  { eager: true },
);

// Filename convention: {slugified champion name}.jpg, e.g.
// "padma-deepak.jpg". Mapped here to dealFolder so components can look
// up by the same key /api/deals already returns.
const FILENAME_TO_DEAL_FOLDER: Record<string, string> = {
  "padma-deepak": "padma_oracle",
  "rayhan-sadat": "rayhan_nvidia",
  "rithvik-rk": "rithvik_intellibuddies",
  "suhani-jain": "suhani_nokia",
};

export const customerPhotos: Record<string, string> = Object.fromEntries(
  Object.entries(photoModules)
    .map(([path, mod]) => {
      const filename = path.split("/").pop()?.replace(/\.(jpg|jpeg|png)$/, "");
      const dealFolder = filename ? FILENAME_TO_DEAL_FOLDER[filename] : undefined;
      return dealFolder ? [dealFolder, mod.default] : null;
    })
    .filter((entry): entry is [string, string] => entry !== null),
);

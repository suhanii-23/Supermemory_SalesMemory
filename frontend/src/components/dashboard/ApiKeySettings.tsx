import { useState } from "react";
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey } from "../../api/brief";

function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 7)}••••${key.slice(-4)}`;
}

// Bring-your-own-key control: lets a visitor use their own Anthropic key
// instead of the team's, so a deployed demo doesn't run up one shared
// bill. Key lives only in this browser's localStorage.
export function ApiKeySettings() {
  const [savedKey, setSavedKey] = useState(getStoredApiKey());
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  function handleSave() {
    if (!draft.trim()) return;
    setStoredApiKey(draft.trim());
    setSavedKey(draft.trim());
    setDraft("");
    setEditing(false);
  }

  function handleClear() {
    clearStoredApiKey();
    setSavedKey(null);
    setEditing(false);
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-white/80 p-4 text-sm">
      <p className="font-medium text-navy">Claude API key</p>
      <p className="mt-1 text-xs leading-relaxed text-navy-soft">
        Optional — use your own key instead of the shared demo key. Stored only in
        your browser.
      </p>

      {savedKey && !editing ? (
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-dusty-soft px-2.5 py-1 text-xs font-medium text-dusty">
            {maskKey(savedKey)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-medium text-navy-soft hover:text-navy"
            >
              Change
            </button>
            <button
              onClick={handleClear}
              className="text-xs font-medium text-terracotta hover:text-terracotta/80"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <input
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full rounded-lg border border-navy/15 bg-cream-soft px-3 py-1.5 text-xs text-navy placeholder:text-navy-soft/50 focus:outline-none focus:ring-1 focus:ring-terracotta"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!draft.trim()}
              className="rounded-full bg-navy px-3 py-1 text-xs font-medium text-cream-soft disabled:opacity-40"
            >
              Save
            </button>
            {savedKey && (
              <button
                onClick={() => setEditing(false)}
                className="text-xs font-medium text-navy-soft hover:text-navy"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

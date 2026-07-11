import { useState } from "react";
import { INTERACTION_CATEGORIES, CATEGORY_LABELS, type InteractionCategory } from "../../types/brief";
import { addInteraction, BriefFetchError } from "../../api/brief";
import { useToast } from "../toast/ToastContext";

type NewInteractionFormProps = {
  containerTag: string;
  onClose: () => void;
  onSubmitted: () => void; // starts the syncing window on the parent
};

export function NewInteractionForm({
  containerTag,
  onClose,
  onSubmitted,
}: NewInteractionFormProps) {
  const { pushToast } = useToast();
  const [category, setCategory] = useState<InteractionCategory>("calls");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await addInteraction(containerTag, { category, title, content, date });
      pushToast("Interaction added — memory syncing");
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof BriefFetchError ? err.message : "Failed to add interaction.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-navy/30 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-navy/10 bg-white p-6 shadow-xl"
      >
        <h3 className="font-serif-caps mb-4 text-sm text-navy">New Interaction</h3>

        <label className="mb-3 block text-xs font-medium text-navy-soft">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as InteractionCategory)}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-cream-soft px-3 py-2 text-sm text-navy"
          >
            {INTERACTION_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>

        <label className="mb-3 block text-xs font-medium text-navy-soft">
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Pricing follow-up call"
            required
            className="mt-1 w-full rounded-lg border border-navy/15 bg-cream-soft px-3 py-2 text-sm text-navy placeholder:text-navy-soft/50"
          />
        </label>

        <label className="mb-3 block text-xs font-medium text-navy-soft">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 bg-cream-soft px-3 py-2 text-sm text-navy"
          />
        </label>

        <label className="mb-1 block text-xs font-medium text-navy-soft">
          Notes / transcript
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            required
            placeholder="What happened, what was discussed..."
            className="mt-1 w-full resize-none rounded-lg border border-navy/15 bg-cream-soft px-3 py-2 text-sm text-navy placeholder:text-navy-soft/50"
          />
        </label>

        {error && <p className="mt-2 text-xs text-terracotta">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-navy/15 px-4 py-2 text-sm text-navy hover:bg-cream-soft"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add Interaction"}
          </button>
        </div>
      </form>
    </div>
  );
}

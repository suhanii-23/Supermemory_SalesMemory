type BriefErrorStateProps = {
  message: string;
  onRetry: () => void;
};

// Renders the BriefGenerationError message from the backend's 503 body
// verbatim -- e.g. "no Supermemory data yet, extraction may still be
// processing" or "response truncated". No silent failure, no generic
// "something went wrong."
export function BriefErrorState({ message, onRetry }: BriefErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-terracotta/30 bg-terracotta-soft/30 py-24 text-center">
      <span className="text-2xl text-terracotta">⚠</span>
      <p className="font-serif-caps text-sm text-navy">Brief unavailable</p>
      <p className="max-w-md text-sm text-navy-soft">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-cream-soft"
      >
        Try again
      </button>
    </div>
  );
}

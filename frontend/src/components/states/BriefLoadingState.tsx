export function BriefLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-navy/10 bg-white/80 py-24 text-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-navy/15 border-t-terracotta" />
      <p className="font-serif-caps text-sm text-navy-soft">
        Synthesizing brief from Supermemory…
      </p>
      <p className="max-w-sm text-xs text-navy-soft/70">
        This calls Claude directly and can take several seconds on first
        load for this deal.
      </p>
    </div>
  );
}

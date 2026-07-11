import { cn } from "../../lib/utils";

type RefreshBriefButtonProps = {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
};

// This is a real, multi-second Claude call -- the loading state needs to
// be unmistakable, not just a disabled button.
export function RefreshBriefButton({ onClick, loading, disabled }: RefreshBriefButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-sm font-medium text-navy transition-colors",
        loading || disabled ? "cursor-not-allowed opacity-60" : "hover:bg-cream-soft",
      )}
    >
      {loading ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy/20 border-t-terracotta" />
          Regenerating brief…
        </>
      ) : (
        <>↻ Refresh brief</>
      )}
    </button>
  );
}

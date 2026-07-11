import { SectionCard } from "../common/SectionCard";
import { EvidenceChips } from "../common/EvidenceChips";
import { EmptyState } from "../common/EmptyState";
import { cn } from "../../lib/utils";
import type { NextStepItem } from "../../types/brief";

export function NextStepsChecklist({ items }: { items: NextStepItem[] }) {
  return (
    <SectionCard title="Next Steps" icon="✓">
      {items.length === 0 ? (
        <EmptyState message="No next steps identified yet." />
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[11px]",
                  item.done
                    ? "border-terracotta bg-terracotta text-white"
                    : "border-navy/25 text-transparent",
                )}
              >
                ✓
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    item.done ? "text-navy-soft/60 line-through" : "text-navy",
                  )}
                >
                  {item.label}
                </p>
                <EvidenceChips evidence={item.evidence} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

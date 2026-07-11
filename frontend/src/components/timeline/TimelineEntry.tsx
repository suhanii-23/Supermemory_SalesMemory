import { EvidenceChips } from "../common/EvidenceChips";
import type { TimelineItem } from "../../types/brief";

export function TimelineEntry({ item, isLast }: { item: TimelineItem; isLast: boolean }) {
  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span className="absolute left-[5px] top-4 h-full w-px bg-navy/10" />
      )}
      <span className="relative z-10 mt-1.5 h-3 w-3 flex-none rounded-full border-2 border-terracotta bg-cream" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy-soft/70">
          {item.date}
        </p>
        <p className="mt-0.5 text-sm font-medium text-navy">{item.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-navy-soft">{item.detail}</p>
        <EvidenceChips evidence={item.evidence} />
      </div>
    </div>
  );
}

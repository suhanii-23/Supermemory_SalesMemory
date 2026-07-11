import { SectionCard } from "../common/SectionCard";
import { Badge } from "../common/Badge";
import { EvidenceChips } from "../common/EvidenceChips";
import { EmptyState } from "../common/EmptyState";
import { toneForLevel } from "../../lib/badgeTone";
import type { TheyllAskItem } from "../../types/brief";

// Deliberately not routed through ListInsightCard -- shape is
// {question, confidence, reason, evidence}, not {text, importance,
// evidence}. Collapsing this into the shared template would either drop
// `reason` or force an awkward field-name mismatch.
export function TheyllAskCard({ items }: { items: TheyllAskItem[] }) {
  return (
    <SectionCard title="They'll Ask" icon="?">
      {items.length === 0 ? (
        <EmptyState message="No likely questions surfaced yet." />
      ) : (
        <ul className="space-y-4">
          {items.map((item, i) => (
            <li key={i} className="border-b border-navy/[0.06] pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-relaxed text-navy">
                  {item.question}
                </p>
                <Badge tone={toneForLevel(item.confidence)} size="sm" className="flex-none">
                  {item.confidence}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-soft">{item.reason}</p>
              <EvidenceChips evidence={item.evidence} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

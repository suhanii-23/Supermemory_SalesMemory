import { SectionCard } from "../common/SectionCard";
import { EvidenceChips } from "../common/EvidenceChips";
import { EmptyState } from "../common/EmptyState";
import type { YouShouldSayItem } from "../../types/brief";

// Recommendations, not facts -- no importance/severity badge by design
// (mind.py's system prompt keeps these separate: "Facts belong in
// Remember, Risks, Timeline and Quotes. Recommendations belong only in
// YouShouldSay.").
export function YouShouldSayCard({ items }: { items: YouShouldSayItem[] }) {
  return (
    <SectionCard title="You Should Say" icon="✎">
      {items.length === 0 ? (
        <EmptyState message="No talking points generated yet." />
      ) : (
        <ul className="space-y-4">
          {items.map((item, i) => (
            <li key={i} className="border-b border-navy/[0.06] pb-4 last:border-0 last:pb-0">
              <p className="text-sm leading-relaxed text-navy">{item.text}</p>
              <EvidenceChips evidence={item.supports} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

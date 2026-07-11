import { SectionCard } from "../common/SectionCard";
import { Badge } from "../common/Badge";
import { EvidenceChips } from "../common/EvidenceChips";
import { EmptyState } from "../common/EmptyState";
import { toneForLevel } from "../../lib/badgeTone";
import type { Level } from "../../types/brief";

type LevelKey = "importance" | "severity";

// Partial, not Record<LevelKey, ...> -- a RememberItem only ever has
// `importance`, a RiskItem only ever has `severity`. Record<LevelKey, ...>
// would require both keys to exist on every item, which none of the real
// schema types satisfy.
type ListInsightItem = {
  text: string;
  evidence: string[];
} & Partial<Record<LevelKey, Level>>;

type ListInsightCardProps<T extends ListInsightItem> = {
  title: string;
  icon?: string;
  items: T[];
  levelKey: LevelKey;
  emptyMessage: string;
};

// Shared engine for Remember / Risks / Relationship Memory -- these three
// have the identical {text, importance|severity, evidence} shape. They'll
// Ask and You Should Say are deliberately NOT routed through this (see
// TheyllAskCard / YouShouldSayCard) since their shapes genuinely differ.
export function ListInsightCard<T extends ListInsightItem>({
  title,
  icon,
  items,
  levelKey,
  emptyMessage,
}: ListInsightCardProps<T>) {
  return (
    <SectionCard title={title} icon={icon}>
      {items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <ul className="space-y-4">
          {items.map((item, i) => {
            const level = item[levelKey];
            return (
              <li key={i} className="border-b border-navy/[0.06] pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-relaxed text-navy">{item.text}</p>
                  {level && (
                    <Badge tone={toneForLevel(level)} size="sm" className="flex-none">
                      {level}
                    </Badge>
                  )}
                </div>
                <EvidenceChips evidence={item.evidence} />
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

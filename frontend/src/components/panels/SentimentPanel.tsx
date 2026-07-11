import { SectionCard } from "../common/SectionCard";
import { Badge } from "../common/Badge";
import { EvidenceChips } from "../common/EvidenceChips";
import { toneForTrend, iconForTrend } from "../../lib/badgeTone";
import type { Sentiment } from "../../types/brief";

// 5 possible trend values, only 3 brand tones -- disambiguated with a
// directional icon (↑/→/↓/↔/?) rather than inventing a new hue.
export function SentimentPanel({ data }: { data: Sentiment }) {
  return (
    <SectionCard title="Sentiment" icon="◇">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={toneForTrend(data.trend)}>
          <span aria-hidden>{iconForTrend(data.trend)}</span> {data.trend}
        </Badge>
        <Badge tone="neutral" size="sm">
          {data.confidence} confidence
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-navy-soft">{data.reason}</p>
      <EvidenceChips evidence={data.evidence} />
    </SectionCard>
  );
}

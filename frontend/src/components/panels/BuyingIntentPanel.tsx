import { SectionCard } from "../common/SectionCard";
import { Badge } from "../common/Badge";
import { EvidenceChips } from "../common/EvidenceChips";
import { toneForLevel } from "../../lib/badgeTone";
import type { BuyingIntent } from "../../types/brief";

export function BuyingIntentPanel({ data }: { data: BuyingIntent }) {
  return (
    <SectionCard title="Buying Intent" icon="◈">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={toneForLevel(data.level)}>{data.level}</Badge>
        <Badge tone="neutral" size="sm">
          {data.confidence} confidence
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-navy-soft">{data.reason}</p>
      <EvidenceChips evidence={data.evidence} />
    </SectionCard>
  );
}

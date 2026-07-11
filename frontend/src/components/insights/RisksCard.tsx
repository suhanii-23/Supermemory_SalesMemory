import { ListInsightCard } from "./ListInsightCard";
import type { RiskItem } from "../../types/brief";

export function RisksCard({ items }: { items: RiskItem[] }) {
  return (
    <ListInsightCard
      title="Risks"
      icon="▲"
      items={items}
      levelKey="severity"
      emptyMessage="No risks surfaced yet."
    />
  );
}

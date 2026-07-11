import { ListInsightCard } from "./ListInsightCard";
import type { RememberItem } from "../../types/brief";

export function RememberCard({ items }: { items: RememberItem[] }) {
  return (
    <ListInsightCard
      title="Remember"
      icon="◆"
      items={items}
      levelKey="importance"
      emptyMessage="Nothing surfaced yet for this deal."
    />
  );
}

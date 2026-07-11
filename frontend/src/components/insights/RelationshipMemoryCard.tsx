import { ListInsightCard } from "./ListInsightCard";
import type { RelationshipMemoryItem } from "../../types/brief";

export function RelationshipMemoryCard({ items }: { items: RelationshipMemoryItem[] }) {
  return (
    <ListInsightCard
      title="Relationship Memory"
      icon="●"
      items={items}
      levelKey="importance"
      emptyMessage="No relationship notes captured yet."
    />
  );
}

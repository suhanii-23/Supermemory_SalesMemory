import { SectionCard } from "../common/SectionCard";
import { EmptyState } from "../common/EmptyState";
import { TimelineEntry } from "./TimelineEntry";
import type { TimelineItem } from "../../types/brief";

export function TimelineList({ items }: { items: TimelineItem[] }) {
  return (
    <SectionCard title="Timeline" icon="↻">
      {items.length === 0 ? (
        <EmptyState message="No timeline history yet." />
      ) : (
        <div>
          {items.map((item, i) => (
            <TimelineEntry key={i} item={item} isLast={i === items.length - 1} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

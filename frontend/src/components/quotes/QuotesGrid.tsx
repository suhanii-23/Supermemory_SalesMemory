import { SectionCard } from "../common/SectionCard";
import { EmptyState } from "../common/EmptyState";
import { QuoteCard } from "./QuoteCard";
import type { QuoteItem } from "../../types/brief";

export function QuotesGrid({ items }: { items: QuoteItem[] }) {
  return (
    <SectionCard title="What They Said" icon="“">
      {items.length === 0 ? (
        <EmptyState message="No quotes retrieved for this context." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((quote, i) => (
            <QuoteCard key={i} quote={quote} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

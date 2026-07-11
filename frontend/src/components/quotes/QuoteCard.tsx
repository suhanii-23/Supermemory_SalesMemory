import type { QuoteItem } from "../../types/brief";

export function QuoteCard({ quote }: { quote: QuoteItem }) {
  return (
    <div className="flex flex-col rounded-xl border border-navy/10 bg-cream-soft p-4">
      <p className="font-serif text-base italic leading-relaxed text-navy">
        &ldquo;{quote.text}&rdquo;
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-navy/10 pt-2 text-[11px] text-navy-soft">
        <span className="font-medium text-navy">{quote.speaker}</span>
        <span>&middot;</span>
        <span>{quote.role}</span>
        <span>&middot;</span>
        <span>{quote.sourceType}</span>
        <span>&middot;</span>
        <span>{quote.date}</span>
        <span className="w-full truncate text-navy-soft/70" title={quote.document}>
          {quote.document}
        </span>
      </div>
    </div>
  );
}

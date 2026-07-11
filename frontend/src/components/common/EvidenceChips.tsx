type EvidenceChipsProps = {
  evidence: string[];
};

// The product's core promise is "every point links to a source" -- this
// renders even when evidence is [], with an explicit "no source cited"
// label, rather than silently omitting the row.
export function EvidenceChips({ evidence }: EvidenceChipsProps) {
  if (evidence.length === 0) {
    return (
      <p className="mt-2 text-[11px] italic text-navy-soft/60">No source cited</p>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {evidence.map((item, i) => (
        <span
          key={`${item}-${i}`}
          title={item}
          className="max-w-[220px] truncate rounded-full border border-navy/10 bg-cream-soft px-2 py-0.5 text-[11px] text-navy-soft"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

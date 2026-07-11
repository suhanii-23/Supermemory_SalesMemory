import { CustomerCard } from "./CustomerCard";
import type { Deal } from "../../types/brief";

type RosterGridProps = {
  deals: Deal[];
  selectedTag: string | null;
  onSelect: (deal: Deal) => void;
};

export function RosterGrid({ deals, selectedTag, onSelect }: RosterGridProps) {
  return (
    <div className="flex flex-col gap-2">
      {deals.map((deal) => (
        <CustomerCard
          key={deal.containerTag}
          deal={deal}
          active={deal.containerTag === selectedTag}
          onSelect={() => onSelect(deal)}
        />
      ))}
    </div>
  );
}

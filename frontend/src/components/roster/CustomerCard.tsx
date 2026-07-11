import { Avatar } from "../common/Avatar";
import { cn } from "../../lib/utils";
import type { Deal } from "../../types/brief";
import { customerPhotos } from "../../data/customerPhotos";

type CustomerCardProps = {
  deal: Deal;
  active: boolean;
  onSelect: () => void;
};

export function CustomerCard({ deal, active, onSelect }: CustomerCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
        active
          ? "border-terracotta bg-terracotta-soft/40"
          : "border-navy/10 bg-white/70 hover:bg-cream-soft",
      )}
    >
      <Avatar
        src={customerPhotos[deal.dealFolder]}
        name={deal.champion}
        seed={deal.containerTag}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-navy">{deal.champion}</p>
        <p className="truncate text-xs text-navy-soft">{deal.role}</p>
        <p className="truncate text-xs text-navy-soft/70">{deal.account}</p>
      </div>
      <span
        className={cn(
          "flex-none rounded-full px-2 py-0.5 text-[10px] font-medium",
          deal.stage
            ? "bg-dusty-soft text-dusty"
            : "bg-navy/5 text-navy-soft/50",
        )}
      >
        {deal.stage ?? "No brief yet"}
      </span>
    </button>
  );
}

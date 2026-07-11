import { Avatar } from "../common/Avatar";
import { RefreshBriefButton } from "./RefreshBriefButton";
import { customerPhotos } from "../../data/customerPhotos";
import type { Deal } from "../../types/brief";

type DashboardHeaderProps = {
  deal: Deal;
  stage: string | null;
  syncing: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onNewInteraction: () => void;
};

export function DashboardHeader({
  deal,
  stage,
  syncing,
  refreshing,
  onRefresh,
  onNewInteraction,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-white/80 p-5">
      <div className="flex items-center gap-4">
        <Avatar
          src={customerPhotos[deal.dealFolder]}
          name={deal.champion}
          seed={deal.containerTag}
          size="lg"
        />
        <div>
          <h2 className="font-serif text-2xl font-semibold text-navy">{deal.champion}</h2>
          <p className="text-sm text-navy-soft">{deal.role}</p>
          <p className="text-sm text-navy-soft/70">{deal.account}</p>
          <div className="mt-2 flex items-center gap-2">
            {stage && (
              <span className="rounded-full bg-dusty-soft px-2.5 py-0.5 text-xs font-medium text-dusty">
                {stage}
              </span>
            )}
            {syncing && (
              <span className="flex items-center gap-1.5 rounded-full bg-terracotta-soft px-2.5 py-0.5 text-xs font-medium text-terracotta">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-terracotta" />
                Syncing…
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewInteraction}
          className="rounded-full border border-navy/15 bg-cream-soft px-4 py-2 text-sm font-medium text-navy hover:bg-cream"
        >
          + New Interaction
        </button>
        <RefreshBriefButton onClick={onRefresh} loading={refreshing} disabled={syncing} />
      </div>
    </div>
  );
}

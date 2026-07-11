import { useCallback, useEffect, useRef, useState } from "react";
import { RosterGrid } from "../components/roster/RosterGrid";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { NewInteractionForm } from "../components/dashboard/NewInteractionForm";
import { RememberCard } from "../components/insights/RememberCard";
import { TheyllAskCard } from "../components/insights/TheyllAskCard";
import { YouShouldSayCard } from "../components/insights/YouShouldSayCard";
import { RisksCard } from "../components/insights/RisksCard";
import { RelationshipMemoryCard } from "../components/insights/RelationshipMemoryCard";
import { BuyingIntentPanel } from "../components/panels/BuyingIntentPanel";
import { SentimentPanel } from "../components/panels/SentimentPanel";
import { NextStepsChecklist } from "../components/nextsteps/NextStepsChecklist";
import { QuotesGrid } from "../components/quotes/QuotesGrid";
import { TimelineList } from "../components/timeline/TimelineList";
import { BriefLoadingState } from "../components/states/BriefLoadingState";
import { BriefErrorState } from "../components/states/BriefErrorState";
import { fetchDeals, fetchBrief, meetingContextFor, BriefFetchError } from "../api/brief";
import type { Brief, Deal } from "../types/brief";

// Supermemory's extraction is async -- firing a regenerate immediately
// after adding an interaction would just resynthesize before the new
// content is actually indexed. This delay gives it time to land before
// "Refresh brief" is re-enabled.
const SYNC_DELAY_MS = 18000;

export function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchDeals().then((d) => {
      setDeals(d);
      if (d.length > 0) setSelectedDeal(d[0]);
    });
  }, []);

  const loadBrief = useCallback(async (deal: Deal, force: boolean) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await fetchBrief(deal.containerTag, meetingContextFor(deal), force);
      setBrief(result);
      // Roster stage reflects the freshly-generated brief immediately,
      // without waiting on a full re-fetch of /api/deals.
      setDeals((prev) =>
        prev.map((d) => (d.containerTag === deal.containerTag ? { ...d, stage: result.stage } : d)),
      );
    } catch (err) {
      setBrief(null);
      setError(err instanceof BriefFetchError ? err.message : "Failed to load brief.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDeal) {
      void loadBrief(selectedDeal, false);
    }
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeal?.containerTag]);

  function handleSelectDeal(deal: Deal) {
    setSelectedDeal(deal);
  }

  function handleRefresh() {
    if (selectedDeal) void loadBrief(selectedDeal, true);
  }

  function handleInteractionSubmitted() {
    setSyncing(true);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => setSyncing(false), SYNC_DELAY_MS);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:px-6">
      <aside className="w-full flex-none md:w-72">
        <h1 className="font-serif-caps mb-4 text-lg text-navy">SaleSights Co.</h1>
        <RosterGrid
          deals={deals}
          selectedTag={selectedDeal?.containerTag ?? null}
          onSelect={handleSelectDeal}
        />
      </aside>

      <main className="min-w-0 flex-1 space-y-4">
        {!selectedDeal ? (
          <p className="text-sm text-navy-soft">Select a customer to view their brief.</p>
        ) : (
          <>
            <DashboardHeader
              deal={selectedDeal}
              stage={brief?.stage ?? selectedDeal.stage}
              syncing={syncing}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onNewInteraction={() => setShowForm(true)}
            />

            {loading && <BriefLoadingState />}
            {!loading && error && (
              <BriefErrorState message={error} onRetry={() => loadBrief(selectedDeal, false)} />
            )}
            {!loading && !error && brief && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <BuyingIntentPanel data={brief.buyingIntent} />
                  <SentimentPanel data={brief.sentiment} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <RememberCard items={brief.remember} />
                  <TheyllAskCard items={brief.theyllAsk} />
                  <YouShouldSayCard items={brief.youShouldSay} />
                  <RisksCard items={brief.risks} />
                  <RelationshipMemoryCard items={brief.relationshipMemory} />
                  <NextStepsChecklist items={brief.nextSteps} />
                </div>

                <QuotesGrid items={brief.quotes} />
                <TimelineList items={brief.timeline} />
              </>
            )}
          </>
        )}
      </main>

      {showForm && selectedDeal && (
        <NewInteractionForm
          containerTag={selectedDeal.containerTag}
          onClose={() => setShowForm(false)}
          onSubmitted={handleInteractionSubmitted}
        />
      )}
    </div>
  );
}

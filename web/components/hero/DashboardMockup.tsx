import { TrendingUp, Brain, CheckCircle2, Target } from "lucide-react";

// Mirrors mind.py's real brief schema (remember[], nextSteps[],
// youShouldSay[]) so the hero mockup previews the same categories the
// product actually generates, not a generic activity feed.
const BRIEF_PREVIEW = [
  {
    icon: Brain,
    label: "Remember",
    text: "Budget approved in Q1 review — expansion is pre-qualified.",
  },
  {
    icon: Target,
    label: "Next Best Action",
    text: "Send implementation timeline after this meeting.",
  },
  {
    icon: CheckCircle2,
    label: "You Should Say",
    text: "Follow up on the pricing question from last call.",
  },
];

export function DashboardMockup() {
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-card-lg border border-black/[0.06] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04),0_24px_60px_rgba(0,0,0,0.10)]">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-black/[0.06] bg-black/[0.015] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
        <div className="ml-3 flex-1 rounded-full bg-black/[0.03] px-3 py-1 text-[11px] text-muted">
          app.salesights.co/clients/sarah-johnson
        </div>
      </div>

      {/* body */}
      <div className="grid grid-cols-[56px_1fr]">
        {/* mini sidebar */}
        <div className="flex flex-col items-center gap-3 border-r border-black/[0.06] bg-black/[0.012] py-5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i === 1 ? "bg-accent" : "bg-black/10"}`}
            />
          ))}
        </div>

        {/* main content */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-panel font-display text-sm font-semibold text-accent">
                SJ
              </div>
              <div>
                <p className="text-sm font-semibold">Sarah Johnson</p>
                <p className="text-[11px] text-muted">VP Sales · Nimbus Cloud</p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-panel">
              <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
              92%
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { label: "Mood", value: "Positive" },
              { label: "Stage", value: "Expansion" },
              { label: "Last touch", value: "4d ago" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-card-sm border border-black/[0.06] bg-black/[0.015] px-3 py-2.5"
              >
                <p className="text-[10px] uppercase tracking-wide text-muted">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-xs font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            {BRIEF_PREVIEW.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-2.5 rounded-card-sm border border-black/[0.05] bg-black/[0.01] px-3 py-2.5"
              >
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent/15 text-panel">
                  <item.icon className="h-3 w-3" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {item.label}
                  </p>
                  <p className="mt-0.5 truncate text-xs">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

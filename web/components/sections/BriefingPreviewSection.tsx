"use client";

import { motion } from "framer-motion";
import { Star, CheckCircle2, XCircle, Clock, Smile, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { BRIEFING_MOCK } from "@/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 90, damping: 20 },
  },
};

export function BriefingPreviewSection() {
  const b = BRIEFING_MOCK;

  return (
    <Section id="briefing">
      <SectionHeading
        eyebrow="Before every meeting"
        title="Briefing Preview"
        description="SaleSights builds this automatically, minutes before you walk in."
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
      >
        <GlassCard className="mx-auto max-w-4xl overflow-hidden">
          {/* header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] bg-black/[0.015] px-6 py-5 md:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-panel font-display text-sm font-semibold text-accent">
                SJ
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Client Brief
                </p>
                <p className="font-display text-lg font-semibold">{b.clientName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-accent/15 px-3.5 py-1.5 text-sm font-semibold text-panel">
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              Relationship Health{" "}
              <AnimatedCounter target={b.relationshipHealth} suffix="%" />
            </div>
          </div>

          {/* stat row */}
          <div className="grid grid-cols-2 gap-3 border-b border-black/[0.06] p-6 md:grid-cols-3 md:px-8">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-muted" strokeWidth={1.75} />
              <div>
                <p className="text-[11px] text-muted">Last Meeting</p>
                <p className="text-sm font-semibold">{b.lastMeeting}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Smile className="h-4 w-4 text-muted" strokeWidth={1.75} />
              <div>
                <p className="text-[11px] text-muted">Current Mood</p>
                <p className="text-sm font-semibold">{b.mood}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Star className="h-4 w-4 text-muted" strokeWidth={1.75} />
              <div>
                <p className="text-[11px] text-muted">Buying Signals</p>
                <p className="flex gap-0.5 text-sm font-semibold text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-accent text-accent"
                      strokeWidth={0}
                    />
                  ))}
                </p>
              </div>
            </div>
          </div>

          {/* content grid */}
          <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Topics discussed
              </p>
              <ul className="space-y-2">
                {b.topics.map((topic) => (
                  <li key={topic} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                    {topic}
                  </li>
                ))}
              </ul>

              <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-muted">
                Recommended talking points
              </p>
              <ul className="space-y-2">
                {b.talkingPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 flex-none text-accent"
                      strokeWidth={2}
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Avoid
              </p>
              <ul className="space-y-2">
                {b.avoid.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted">
                    <XCircle className="mt-0.5 h-4 w-4 flex-none text-red-400" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-card-sm border border-accent/20 bg-accent/10 p-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-panel/70">
                  Next Best Action
                </p>
                <p className="text-sm font-medium text-panel">{b.nextBestAction}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </Section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { METRICS } from "@/lib/constants";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

export function LiveMetricsSection() {
  return (
    <Section className="bg-panel text-white">
      <SectionHeading
        eyebrow="By the numbers"
        title="Live Metrics"
        description="Every conversation SaleSights indexes makes the next briefing sharper."
        className="[&_span]:border-white/10 [&_span]:bg-white/5 [&_span]:text-muted [&_p]:text-muted"
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
        className="grid grid-cols-2 gap-4 md:grid-cols-5"
      >
        {METRICS.map((metric) => (
          <motion.div key={metric.label} variants={fadeUp}>
            <GlassCard dark className="p-6 text-center">
              <p className="font-display text-3xl font-semibold text-accent md:text-4xl">
                <AnimatedCounter target={metric.value} suffix={metric.suffix} />
              </p>
              <p className="mt-2 text-xs text-muted">{metric.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

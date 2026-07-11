"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  Laptop,
  Zap,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { WHY_FEATURES } from "@/lib/constants";

const ICONS: Record<string, LucideIcon> = {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  Laptop,
  Zap,
  Search,
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export function WhySaleSightsSection() {
  return (
    <Section id="why">
      <SectionHeading
        eyebrow="Why SaleSights"
        title="Built for How Sales Actually Works"
        description="Every feature exists to make sure you never walk into a meeting unprepared."
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={container}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {WHY_FEATURES.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={ICONS[feature.icon]}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </motion.div>
    </Section>
  );
}

"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProcessStep } from "@/components/timeline/ProcessStep";
import { PROCESS_STEPS } from "@/lib/constants";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export function TrustedMemorySection() {
  return (
    <Section>
      <SectionHeading
        eyebrow="How it works"
        title="Trusted Memory for Modern Sales"
        description="From every scattered touchpoint to one living picture of the relationship."
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
        className="flex flex-col items-stretch gap-4 md:flex-row md:items-stretch"
      >
        {PROCESS_STEPS.map((step, i) => (
          <div key={step.title} className="flex flex-1 items-stretch gap-4 md:contents">
            <ProcessStep index={i + 1} title={step.title} items={"items" in step ? step.items : undefined} />
            {i < PROCESS_STEPS.length - 1 && (
              <div className="flex items-center justify-center py-2 md:py-0">
                <ArrowRight className="h-5 w-5 rotate-90 text-muted md:rotate-0" strokeWidth={1.75} />
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </Section>
  );
}

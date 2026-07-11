"use client";

import { motion } from "framer-motion";

type ProcessStepProps = {
  index: number;
  title: string;
  items?: readonly string[];
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 90, damping: 18 },
  },
};

export function ProcessStep({ index, title, items }: ProcessStepProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex-1 rounded-card border border-black/[0.06] bg-white/70 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_28px_rgba(0,0,0,0.05)] backdrop-blur-md"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-panel font-display text-xs font-semibold text-accent">
        {index}
      </span>
      <h3 className="mt-4 font-display text-base font-semibold leading-snug">
        {title}
      </h3>
      {items && (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-black/[0.06] bg-black/[0.02] px-3 py-1 text-xs text-muted"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

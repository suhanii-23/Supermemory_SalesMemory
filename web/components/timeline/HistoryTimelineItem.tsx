"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type HistoryTimelineItemProps = {
  date: string;
  title: string;
  isLast?: boolean;
  emphasized?: boolean;
};

export function HistoryTimelineItem({
  date,
  title,
  isLast,
  emphasized,
}: HistoryTimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
      className="relative flex gap-6 pb-10 last:pb-0"
    >
      {!isLast && (
        <span className="absolute left-[7px] top-6 h-full w-px bg-black/[0.08]" />
      )}
      <span
        className={cn(
          "relative z-10 mt-1.5 h-4 w-4 flex-none rounded-full border-2",
          emphasized
            ? "border-accent bg-accent"
            : "border-black/[0.15] bg-background"
        )}
      />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {date}
        </p>
        <p
          className={cn(
            "mt-1 font-display text-lg font-medium",
            emphasized && "text-panel"
          )}
        >
          {title}
        </p>
      </div>
    </motion.div>
  );
}

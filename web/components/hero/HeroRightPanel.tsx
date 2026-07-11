"use client";

import { motion } from "framer-motion";
import { DashboardMockup } from "./DashboardMockup";
import { FloatingBubble } from "@/components/ui/FloatingBubble";
import { NOTIFICATION_TEXTS } from "@/lib/constants";

// Rotate the shared 8-item text pool so each bubble slot starts at a
// different offset -- they all cycle through the full set, just staggered,
// so two slots never show the same text at the same time.
function rotate<T>(arr: readonly T[], offset: number): T[] {
  const o = offset % arr.length;
  return [...arr.slice(o), ...arr.slice(0, o)];
}

// Positioned at the four corners, pushed outside the card's edges (not
// overlapping its readable content) -- matches the reference image, where
// badges sit beside/beyond the photo rather than over it.
const BUBBLE_SLOTS = [
  { position: "-top-6 -left-6 md:-left-16", offset: 0, cycleMs: 3200, floatDelay: 0, hideOnMobile: false },
  { position: "-top-4 -right-4 md:-right-16", offset: 1, cycleMs: 3600, floatDelay: 0.4, hideOnMobile: false },
  { position: "top-[42%] -right-8 md:-right-24", offset: 3, cycleMs: 3400, floatDelay: 0.8, hideOnMobile: true },
  { position: "-bottom-6 -left-4 md:-left-16", offset: 5, cycleMs: 3800, floatDelay: 1.2, hideOnMobile: true },
  { position: "-bottom-8 -right-2 md:right-4", offset: 6, cycleMs: 3000, floatDelay: 0.2, hideOnMobile: false },
];

export function HeroRightPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.3 }}
      className="relative flex h-full w-full items-center justify-center px-10 py-20 md:px-24"
    >
      <div className="relative w-full max-w-lg">
        <DashboardMockup />
        {BUBBLE_SLOTS.map((slot, i) => (
          <FloatingBubble
            key={i}
            texts={rotate(NOTIFICATION_TEXTS, slot.offset)}
            cycleMs={slot.cycleMs}
            floatDelay={slot.floatDelay}
            className={`${slot.position} ${slot.hideOnMobile ? "hidden sm:flex" : ""}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

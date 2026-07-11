"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type FloatingBubbleProps = {
  texts: string[];
  cycleMs?: number;
  floatDuration?: number;
  floatDelay?: number;
  className?: string;
};

export function FloatingBubble({
  texts,
  cycleMs = 3200,
  floatDuration = 3.4,
  floatDelay = 0,
  className,
}: FloatingBubbleProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (texts.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % texts.length);
    }, cycleMs);
    return () => clearInterval(id);
  }, [texts.length, cycleMs]);

  const current = texts[index]?.replace(/^✓\s*/, "");

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: floatDuration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: floatDelay,
      }}
      className={cn(
        "absolute flex items-center gap-2 whitespace-nowrap rounded-full border border-black/[0.06] bg-white/80 px-4 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md",
        className
      )}
    >
      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent">
        <Check className="h-3 w-3 text-panel" strokeWidth={3} />
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="text-xs font-medium text-panel md:text-sm"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}

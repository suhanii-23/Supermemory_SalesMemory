"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HistoryTimelineItem } from "@/components/timeline/HistoryTimelineItem";
import { HISTORY_TIMELINE } from "@/lib/constants";

export function TimelineMemorySection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section ref={ref} className="relative overflow-hidden py-24 md:py-32">
      <motion.div
        style={{ y: bgY }}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,#C6F36D22,transparent_55%)]"
      />

      <div className="mx-auto max-w-2xl px-6">
        <SectionHeading
          eyebrow="Timeline Memory"
          title="Remembers You Over Months, Not Meetings"
          description="Every touchpoint stays connected — SaleSights recalls it all, so you don't have to."
          align="left"
        />

        <div>
          {HISTORY_TIMELINE.map((item, i) => (
            <HistoryTimelineItem
              key={item.date}
              date={item.date}
              title={item.title}
              isLast={i === HISTORY_TIMELINE.length - 1}
              emphasized={i === HISTORY_TIMELINE.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { HERO_FEATURE_CARDS } from "@/lib/constants";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 90, damping: 20 },
  },
};

const FOOTER_LINKS = ["Contact", "Social", "Address", "Legal Terms"];

export function HeroLeftPanel() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={container}
      className="flex h-full flex-col justify-between px-6 py-10 text-white md:px-8 md:py-14 lg:px-12"
    >
      <div>
        {/* Sizing intentionally dips at md (the 42%-width column is
            narrowest there in absolute px) then grows again at lg+ once
            the column has more room -- prevents "Conversation." from
            overflowing its column at the md/lg breakpoints. A smooth
            ramp (2xl → 4xl → 5xl → 3.4rem) avoids any single jump being
            too large for that step's column width. break-words is a
            safety net for any width in between. */}
        <motion.h1
          variants={fadeUp}
          className="break-words font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-2xl lg:text-4xl xl:text-5xl 2xl:text-[3.4rem]"
        >
          Every Conversation.
          <br />
          Every Client.
          <br />
          <span className="text-accent">Remembered.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-md text-sm leading-relaxed text-muted md:text-base"
        >
          SaleSights automatically remembers every interaction with your
          clients—emails, meetings, Slack conversations, notes, follow-ups—and
          transforms them into an evolving relationship profile so you always
          know what to say next.
          <br />
          <br />
          Powered entirely by Supermemory. Runs completely on your machine.
          Nothing ever leaves your laptop.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
          <Button variant="primary">Try SaleSights</Button>
          <Button variant="secondary">View Demo</Button>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
            Our offerings
          </p>
          <motion.div
            variants={container}
            className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3"
          >
            {HERO_FEATURE_CARDS.map((card) => (
              <FeatureCard key={card.title} variant="compact" {...card} />
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        variants={fadeUp}
        className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted"
      >
        {FOOTER_LINKS.map((link) => (
          <span key={link} className="cursor-pointer transition-colors hover:text-white">
            {link}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

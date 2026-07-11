"use client";

import { motion } from "framer-motion";
import { TRUST_LOGOS } from "@/lib/constants";

export function TrustLogos() {
  return (
    <div className="border-t border-black/[0.06] bg-background py-20">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
        className="mx-auto max-w-xl px-6 text-center font-display text-xl font-medium leading-snug tracking-tight md:text-2xl"
      >
        Trusted by revenue teams who never want to forget a client again.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6"
      >
        {TRUST_LOGOS.map((name) => (
          <span
            key={name}
            className="font-display text-sm font-semibold tracking-tight text-muted/70"
          >
            {name}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

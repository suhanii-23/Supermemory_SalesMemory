"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden py-32 md:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,#C6F36D33,transparent_70%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
        className="mx-auto max-w-2xl px-6 text-center"
      >
        <Image
          src="/logo/mark-dark.png"
          alt=""
          width={40}
          height={40}
          style={{ width: 40, height: 40 }}
          className="mx-auto mb-8 opacity-80"
        />
        <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
          Never Walk Into a Meeting
          <br />
          Blind Again.
        </h2>
        <div className="mt-10 flex justify-center">
          <Button variant="primary" className="px-8 py-4 text-base">
            Start Using SaleSights
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

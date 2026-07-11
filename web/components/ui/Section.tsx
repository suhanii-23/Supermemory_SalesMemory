"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  containerClassName?: string;
};

export function Section({
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("relative py-24 md:py-32", className)} {...props}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className={cn("mx-auto max-w-6xl px-6", containerClassName)}
      >
        {children}
      </motion.div>
    </section>
  );
}

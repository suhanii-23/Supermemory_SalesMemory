"use client";

import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

type FeatureCardProps = {
  icon: LucideIcon | string;
  title: string;
  description: string;
  variant?: "compact" | "default";
  className?: string;
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  variant = "default",
  className,
}: FeatureCardProps) {
  const isCompact = variant === "compact";

  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={
        isCompact
          ? undefined
          : { y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }
      }
      className={cn(
        "rounded-card border backdrop-blur-md",
        isCompact
          ? "border-border-glass bg-card-glass p-5"
          : "border-black/[0.06] bg-white/70 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_28px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center justify-center rounded-full",
          isCompact
            ? "h-9 w-9 bg-accent/15 text-lg"
            : "h-12 w-12 bg-accent/15 text-accent"
        )}
      >
        {typeof Icon === "string" ? (
          <span>{Icon}</span>
        ) : (
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        )}
      </div>
      <h3
        className={cn(
          "font-display font-semibold",
          isCompact ? "text-sm text-white" : "text-lg"
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-1.5 leading-relaxed",
          isCompact ? "text-xs text-muted" : "text-sm text-muted"
        )}
      >
        {description}
      </p>
    </motion.div>
  );
}

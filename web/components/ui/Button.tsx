"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary";
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors",
        variant === "primary" &&
          "bg-accent text-panel hover:brightness-95",
        variant === "secondary" &&
          "border border-border-glass bg-transparent text-current hover:bg-card-glass",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

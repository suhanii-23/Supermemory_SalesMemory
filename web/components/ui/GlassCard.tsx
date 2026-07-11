import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

type GlassCardProps = ComponentPropsWithoutRef<"div"> & {
  dark?: boolean;
};

export function GlassCard({ dark, className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-card border backdrop-blur-md",
        dark
          ? "border-border-glass bg-card-glass"
          : "border-black/[0.06] bg-white/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

import { cn } from "../../lib/utils";
import { BADGE_TONE_CLASSES, type BadgeTone } from "../../lib/badgeTone";

type BadgeProps = {
  tone: BadgeTone;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
};

export function Badge({ tone, size = "md", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        BADGE_TONE_CLASSES[tone],
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      {children}
    </span>
  );
}

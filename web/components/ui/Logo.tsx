import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "dark" | "light";
  showWordmark?: boolean;
  className?: string;
  markSize?: number;
};

export function Logo({
  variant = "dark",
  showWordmark = true,
  className,
  markSize = 28,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo/mark.png"
        alt="SaleSights Co."
        width={markSize}
        height={markSize}
        className="flex-none"
        style={{ width: markSize, height: markSize }}
        priority
      />
      {showWordmark && (
        <span
          className={cn(
            "inline-flex items-baseline gap-1",
            variant === "light" ? "text-white" : "text-foreground"
          )}
        >
          <span className="font-display text-lg font-semibold tracking-tight">
            SaleSights
          </span>
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wide underline decoration-accent decoration-2 underline-offset-2",
              variant === "light" ? "text-white/70" : "text-muted"
            )}
          >
            Co
          </span>
        </span>
      )}
    </span>
  );
}

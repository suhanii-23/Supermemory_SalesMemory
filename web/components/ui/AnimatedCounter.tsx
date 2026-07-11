"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { formatNumber } from "@/lib/utils";

type AnimatedCounterProps = {
  target: number;
  suffix?: string;
  formatter?: (n: number) => string;
  className?: string;
};

export function AnimatedCounter({
  target,
  suffix = "",
  formatter = formatNumber,
  className,
}: AnimatedCounterProps) {
  const { ref, value } = useCountUp(target);

  return (
    <span ref={ref} className={className}>
      {formatter(value)}
      {suffix}
    </span>
  );
}

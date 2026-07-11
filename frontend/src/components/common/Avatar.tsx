import { useState } from "react";
import { cn, hashTone, initials } from "../../lib/utils";
import { AVATAR_TONES } from "../../lib/theme";

type AvatarProps = {
  src?: string;
  name: string;
  seed: string; // stable per-deal seed for the fallback tone (containerTag)
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-2xl",
};

const TONE_BG = {
  navy: "bg-navy text-cream",
  terracotta: "bg-terracotta text-white",
  dusty: "bg-dusty text-white",
};

export function Avatar({ src, name, seed, size = "md", className }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;
  const tone = hashTone(seed, AVATAR_TONES);

  if (showFallback) {
    return (
      <div
        className={cn(
          "flex flex-none items-center justify-center rounded-full font-serif-caps font-semibold",
          SIZE_CLASSES[size],
          TONE_BG[tone],
          className,
        )}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setErrored(true)}
      className={cn("flex-none rounded-full object-cover", SIZE_CLASSES[size], className)}
    />
  );
}

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CatSprite } from "@/components/cat-sprite";
import { type CatStep, nextCatStep } from "@/lib/cat-state";

const PIXEL_V = ["10001", "10001", "10001", "10001", "01010", "01010", "00100"];
const PIXEL_J = ["00111", "00010", "00010", "00010", "00010", "10010", "01100"];

function gridPath(rows: string[], offsetX: number) {
  return rows
    .flatMap((row, y) => [...row].map((cell, x) => (cell === "1" ? `M${x + offsetX} ${y}h1v1h-1z` : "")))
    .join("");
}

export function PixelVJ() {
  return (
    <svg aria-hidden viewBox="0 0 11 7" shapeRendering="crispEdges" className="h-6 w-auto">
      <path d={gridPath(PIXEL_V, 0) + gridPath(PIXEL_J, 6)} fill="currentColor" />
    </svg>
  );
}

/** Small "+" marker placed at line intersections, like a technical drawing grid. */
export function CrossMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute flex h-3 w-3 items-center justify-center text-muted-foreground/70",
        className,
      )}
    >
      <span className="absolute h-px w-full bg-current" />
      <span className="absolute h-full w-px bg-current" />
    </span>
  );
}

/**
 * Interactive pixel cat:
 * Taps keys gently when idle, types faster on hover or keyboard focus,
 * and bursts into rapid typing when clicked.
 */
export function PixelCat({ className }: { className?: string }) {
  const [step, setStep] = useState<CatStep>("left");
  const [isFast, setIsFast] = useState(false);
  const [isBurst, setIsBurst] = useState(false);

  // Burst typing animation on click
  useEffect(() => {
    if (!isBurst) return;
    const timer = window.setTimeout(() => setIsBurst(false), 900);
    return () => window.clearTimeout(timer);
  }, [isBurst]);

  // Alternates left and right paw keypresses
  useEffect(() => {
    const intervalMs = isBurst ? 100 : isFast ? 180 : 420;
    const interval = window.setInterval(() => {
      setStep((prev) => nextCatStep(prev));
    }, intervalMs);
    return () => window.clearInterval(interval);
  }, [isBurst, isFast]);

  return (
    <Button
      variant="ghost"
      aria-label="Click the cat to make it type faster!"
      title="Click the cat to make it type faster!"
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") setIsFast(true);
      }}
      onPointerLeave={() => setIsFast(false)}
      onFocus={() => setIsFast(true)}
      onBlur={() => setIsFast(false)}
      onClick={() => {
        setIsBurst(true);
        setStep((prev) => nextCatStep(prev));
      }}
      className={cn(
        "group relative h-20 w-20 shrink-0 p-0 hover:bg-transparent focus-visible:ring-1 focus-visible:ring-ring select-none cursor-pointer transition-transform duration-150 active:scale-95 [&_svg]:!size-20",
        className,
      )}
    >
      <CatSprite step={step} />
      <span role="status" className="sr-only">
        {isBurst ? "The cat is furiously typing on the keys!" : "The cat is typing"}
      </span>
    </Button>
  );
}

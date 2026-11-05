import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CatSprite } from "@/components/cat-sprite";
import { catPose } from "@/lib/cat-state";

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

/** Hover wakes the cat; clicking triggers a short playful swipe. */
export function PixelCat({ className }: { className?: string }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [attacks, setAttacks] = useState(0);
  const [attacking, setAttacking] = useState(false);
  useEffect(() => {
    if (!attacking) return;
    const timer = window.setTimeout(() => setAttacking(false), 700);
    return () => window.clearTimeout(timer);
  }, [attacking, attacks]);
  const pose = catPose(hovered || focused, attacking);
  return (
    <Button variant="ghost" aria-label="Play with the cat" title="Play with the cat" onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(true); }} onPointerLeave={() => setHovered(false)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onClick={() => { setAttacks((count) => count + 1); setAttacking(true); }} data-state={pose} className={cn("relative h-20 w-20 shrink-0 p-0 hover:bg-transparent [&_svg]:size-20", className)}>
      <CatSprite key={attacks} pose={pose} />
      <span role="status" className="sr-only">{attacking ? "The cat playfully swipes at you!" : ""}</span>
    </Button>
  );
}

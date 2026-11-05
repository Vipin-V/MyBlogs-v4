import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function PixelV() {
  return <svg aria-hidden viewBox="0 0 20 20" shapeRendering="crispEdges" className="size-6"><path d="M0 0h4v12h4v4h4v-4h4V0h4v12h-4v4h-4v4H8v-4H4v-4H0z" fill="currentColor" /></svg>;
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

const CAT_ROWS = [
  "..............##.",
  ".#..#.........#.#",
  ".####.........###",
  ".####.......#####",
  "..##############.",
  "..##############.",
  "..#############..",
  "..############...",
  "...##########....",
];

/** Crisp pixel cat with a short, repeatable petting reaction. */
export function PixelCat({ className }: { className?: string }) {
  const [pets, setPets] = useState(0);
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    if (!awake) return;
    const timer = window.setTimeout(() => setAwake(false), 1500);
    return () => window.clearTimeout(timer);
  }, [awake, pets]);
  const height = CAT_ROWS.length;
  const width = CAT_ROWS[0]?.length ?? 0;
  return (
    <Button variant="ghost" aria-label="Pet the cat" title="Pet the cat" onClick={() => { setPets((count) => count + 1); setAwake(true); }} data-state={awake ? "awake" : "sleeping"} className={cn("relative h-16 w-20 shrink-0 p-2 text-muted-foreground hover:bg-transparent hover:text-foreground [&_svg]:h-9 [&_svg]:w-full", className)}>
      <span role="status" className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel text-xs text-foreground">{awake ? (pets % 2 ? "meow!" : "purr ♥") : ""}</span>
    <svg
      key={pets}
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={awake ? "cat-pet" : ""}
    >
      {CAT_ROWS.flatMap((row, y) =>
        row
          .split("")
          .map((cell, x) =>
            cell === "#" ? (
              <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
            ) : null,
          ),
      )}
      <rect x="2" y="4" width="1" height={awake ? 1 : 0.5} className="fill-background" />
      <rect x="4" y="4" width="1" height={awake ? 1 : 0.5} className="fill-background" />
    </svg>
    </Button>
  );
}

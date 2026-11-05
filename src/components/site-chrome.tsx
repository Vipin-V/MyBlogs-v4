import { cn } from "@/lib/utils";

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

/** Tiny sleeping pixel cat, drawn with crisp SVG rects. */
export function PixelCat({ className }: { className?: string }) {
  const height = CAT_ROWS.length;
  const width = CAT_ROWS[0]?.length ?? 0;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={cn("h-9 w-auto text-muted-foreground", className)}
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
    </svg>
  );
}

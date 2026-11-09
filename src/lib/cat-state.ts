export type CatStep = "left" | "right";
export type CatMode = "idle" | "typing";

/** Alternates the paw step for the typing animation */
export function nextCatStep(current: CatStep): CatStep {
  return current === "left" ? "right" : "left";
}

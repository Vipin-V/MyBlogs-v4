import { describe, expect, it } from "vitest";
import { catPose } from "./cat-state";

describe("reference cat behavior", () => {
  it("sleeps when untouched", () => expect(catPose(false, false)).toBe("sleeping"));
  it("wakes on hover or keyboard focus", () => expect(catPose(true, false)).toBe("awake"));
  it("attacks on click even while hovered", () => expect(catPose(true, true)).toBe("attacking"));
  it("finishes an attack before returning to sleep", () => expect(catPose(false, true)).toBe("attacking"));
});
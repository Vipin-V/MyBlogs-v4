import { describe, expect, it } from "vitest";
import { nextCatStep } from "./cat-state";

describe("comnyang cat step behavior", () => {
  it("alternates from left to right", () => expect(nextCatStep("left")).toBe("right"));
  it("alternates from right to left", () => expect(nextCatStep("right")).toBe("left"));
});

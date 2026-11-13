import { describe, expect, it } from "vitest";
import { commentPayload, commentSchema, safeWebsite } from "./wisp-comments";

const values = { author: " Reader ", email: "reader@example.com", content: " A thoughtful post. ", url: "https://example.com", allowEmailUsage: true };
const config = { enabled: true, allowUrls: false, allowNested: true, signUpMessage: null };

describe("Wisp comment submission", () => {
  it("rejects blank comments", () => expect(commentSchema.safeParse({ ...values, content: "  " }).success).toBe(false));
  it("rejects invalid emails", () => expect(commentSchema.safeParse({ ...values, email: "not-an-email" }).success).toBe(false));
  it("never links executable website URLs", () => expect(safeWebsite("javascript:alert(1)")).toBeUndefined());
  it("omits websites when Wisp disables URLs", () => expect(commentPayload(values, "perfect-days", config).url).toBeUndefined());
  it("only consents to email usage when Wisp has an opt-in message", () => expect(commentPayload(values, "perfect-days", config).allowEmailUsage).toBe(false));
  it("does not submit replies when nesting is disabled", () => expect(commentPayload(values, "perfect-days", { ...config, allowNested: false }, "parent-1").parentId).toBeUndefined());
  it("keeps replies associated with their post and parent", () => expect(commentPayload(values, "perfect-days", config, "parent-1")).toMatchObject({ slug: "perfect-days", parentId: "parent-1", author: "Reader", content: "A thoughtful post." }));
  it("does not submit to disabled comments", () => expect(() => commentPayload(values, "perfect-days", { ...config, enabled: false })).toThrow());
});
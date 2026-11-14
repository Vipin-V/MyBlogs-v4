import { describe, expect, it } from "vitest";
import { imagePreview, mailDestination } from "./loading-utils";

describe("Mail destinations", () => {
  it("opens Gmail outside embedded desktop pages", () => {
    expect(mailDestination("Mozilla/5.0 Windows NT 10.0")).toEqual({ href: "https://mail.google.com/mail/u/0/#inbox", target: "_top" });
  });
  it("opens the email app on phones", () => {
    expect(mailDestination("Mozilla/5.0 iPhone Mobile").href).toBe("mailto:");
    expect(mailDestination("Mozilla/5.0 Android Mobile").href).toBe("mailto:");
  });
  it("recognizes iPads using a desktop user agent", () => {
    expect(mailDestination("Mozilla/5.0 Macintosh", 5).href).toBe("mailto:");
  });
});

describe("Wisp image previews", () => {
  it("requests a 64px version from Wisp's image optimizer", () => {
    const src = "https://imagedelivery.net/account/post/image/public";
    const url = new URL(imagePreview(src) ?? "https://invalid.test");
    expect(url.origin).toBe("https://www.wisp.blog");
    expect(url.searchParams.get("url")).toBe(src);
    expect(url.searchParams.get("w")).toBe("64");
  });
  it("does not send arbitrary sources to the optimizer", () => {
    expect(imagePreview("https://other.example/image.jpg")).toBeUndefined();
    expect(imagePreview("http://imagedelivery.net/image")).toBeUndefined();
  });
});
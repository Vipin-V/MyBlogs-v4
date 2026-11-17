import { describe, expect, it, vi } from "vitest";
import { buildSitemapXml, createSitemapHandler } from "./sitemap";

describe("sitemap", () => {
  it("includes Home, About and every article without invented modification dates", () => {
    const xml = buildSitemapXml([{ slug: "first-post" }, { slug: "second-post" }]);

    expect(xml).toContain("<loc>https://blog.vipinv.dev/</loc>");
    expect(xml).toContain("<loc>https://blog.vipinv.dev/about</loc>");
    expect(xml).toContain("<loc>https://blog.vipinv.dev/blog/first-post</loc>");
    expect(xml).toContain("<loc>https://blog.vipinv.dev/blog/second-post</loc>");
    expect(xml).not.toContain("<lastmod>");
  });

  it("includes every article returned across paginated CMS results", async () => {
    const posts = Array.from({ length: 105 }, (_, index) => ({ slug: `post-${index + 1}` }));
    const response = await createSitemapHandler(async () => posts)();
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(xml.match(/<url>/g)).toHaveLength(107);
    expect(xml).toContain("/blog/post-1</loc>");
    expect(xml).toContain("/blog/post-105</loc>");
  });

  it("escapes article URLs for valid XML", () => {
    const xml = buildSitemapXml([{ slug: "ideas&more" }]);
    expect(xml).toContain("/blog/ideas%26more</loc>");
  });

  it("returns a temporary error instead of partial XML when Wisp fails", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await createSitemapHandler(async () => { throw new Error("Wisp unavailable"); })();

    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBe("300");
    expect(await response.text()).not.toContain("<urlset>");
    error.mockRestore();
  });
});

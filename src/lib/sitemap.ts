const BASE_URL = "https://blog.vipinv.dev";

type SitemapPost = { slug: string };

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function buildSitemapXml(posts: SitemapPost[]): string {
  const entries: { loc: string; changefreq?: string; priority?: string }[] = [
    { loc: `${BASE_URL}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${BASE_URL}/about`, changefreq: "monthly", priority: "0.7" },
    ...posts.map((post) => ({ loc: `${BASE_URL}/blog/${encodeURIComponent(post.slug)}` })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(({ loc, changefreq, priority }) => `  <url><loc>${escapeXml(loc)}</loc>${changefreq ? `<changefreq>${changefreq}</changefreq>` : ""}${priority ? `<priority>${priority}</priority>` : ""}</url>`).join("\n")}
</urlset>`;
}

export function createSitemapHandler(loadPosts: () => Promise<SitemapPost[]>) {
  return async (): Promise<Response> => {
    try {
      const posts = await loadPosts();
      return new Response(buildSitemapXml(posts), {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=600",
        },
      });
    } catch (error) {
      console.error("Failed to generate sitemap", error);
      return new Response("Sitemap temporarily unavailable", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "300" },
      });
    }
  };
}

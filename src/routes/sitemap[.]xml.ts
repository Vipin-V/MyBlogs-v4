import { createFileRoute } from "@tanstack/react-router";
import { fetchMediumPosts } from "@/lib/medium.server";

const BASE_URL = "https://blog.vipinv.dev";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const posts = await fetchMediumPosts().catch(() => []);

        const urls = [
          `  <url><loc>${BASE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
          `  <url><loc>${BASE_URL}/about</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
          ...posts.map(
            (p) =>
              `  <url><loc>${p.link}</loc>${p.date ? `<lastmod>${p.date.slice(0, 10)}</lastmod>` : ""}<changefreq>monthly</changefreq><priority>0.8</priority></url>`,
          ),
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=600",
          },
        });
      },
    },
  },
});


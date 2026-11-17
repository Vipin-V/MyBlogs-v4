import { createFileRoute } from "@tanstack/react-router";
import { createSitemapHandler } from "@/lib/sitemap";
import { fetchPosts } from "@/lib/wisp.server";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: createSitemapHandler(fetchPosts),
    },
  },
});

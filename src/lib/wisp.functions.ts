import { createServerFn } from "@tanstack/react-start";
import { fetchPost, fetchPosts } from "./wisp.server";

export type { BlogPost, BlogPostDetail } from "./wisp.server";

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return { posts: await fetchPosts(), error: null as string | null };
  } catch (error) {
    console.error("Failed to load Wisp posts", error);
    return { posts: [], error: "Could not load posts right now. Please try again shortly." };
  }
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 200) }))
  .handler(async ({ data }) => fetchPost(data.slug));

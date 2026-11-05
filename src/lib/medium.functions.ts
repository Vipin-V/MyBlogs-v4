import { createServerFn } from "@tanstack/react-start";
import { fetchMediumPosts, type MediumPost } from "./medium.server";

// Re-export the plain DTO type for client code (type-only import, erased at build).
export type { MediumPost } from "./medium.server";

export type MediumPostsResult = {
  posts: MediumPost[];
  error: string | null;
};

/**
 * Fetches the author's public Medium feed on the server so the browser never
 * talks to medium.com directly (avoids CORS and keeps parsing off the client).
 */
export const getMediumPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<MediumPostsResult> => {
    try {
      const posts = await fetchMediumPosts();
      return { posts, error: null };
    } catch (error) {
      console.error("Failed to load Medium feed", error);
      return {
        posts: [],
        error: "Could not load posts from Medium right now. Please try again shortly.",
      };
    }
  },
);

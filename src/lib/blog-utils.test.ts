import { describe, expect, it } from "vitest";
import { estimateReadingMinutes, selectPosts } from "./blog-utils";

const posts = Array.from({ length: 14 }, (_, index) => ({ title: `Story ${index + 1}`, tags: [index % 2 ? "Movies" : "Memories"] }));

describe("post selection", () => {
  it("paginates without dropping or repeating posts", () => {
    const pages = [1, 2, 3].map((page) => selectPosts(posts, "", "All", page));
    expect(pages.map((result) => result.posts.length)).toEqual([6, 6, 2]);
    expect(pages.flatMap((result) => result.posts)).toEqual(posts);
  });
  it("searches titles and tags without case sensitivity", () => {
    expect(selectPosts(posts, "  story 14  ", "All", 1).posts).toEqual([posts[13]]);
    expect(selectPosts(posts, "MOVIES", "All", 1).total).toBe(7);
  });
  it("combines search with tag selection before pagination", () => {
    expect(selectPosts(posts, "story 1", "Movies", 1).posts.map((post) => post.title)).toEqual(["Story 10", "Story 12", "Story 14"]);
  });
  it("clamps invalid pages and handles no matches", () => {
    expect(selectPosts(posts, "", "All", 99).page).toBe(3);
    expect(selectPosts(posts, "", "All", -4).page).toBe(1);
    expect(selectPosts(posts, "missing", "All", 3)).toMatchObject({ posts: [], total: 0, page: 1 });
  });
});

describe("reading-time estimates", () => {
  it("uses article words rather than HTML markup", () => {
    // 265 wpm: 266 words = 2 min (Math.ceil(266 / 265) = 2)
    expect(estimateReadingMinutes(`<p>${"word ".repeat(266)}</p><script>ignored text</script>`)).toBe(2);
    // 265 words = 1 min
    expect(estimateReadingMinutes(`<p>${"word ".repeat(265)}</p>`)).toBe(1);
    // 531 words = 3 min (531 / 265 = 2.004 => 3)
    expect(estimateReadingMinutes(`<p>${"word ".repeat(531)}</p>`)).toBe(3);
  });
  it("never shows zero minutes for an empty article", () => {
    expect(estimateReadingMinutes("")).toBe(1);
  });
  it("adds time for images", () => {
    // 265 words = 1.0 min + first image 12s = 1.2 min => 2
    expect(estimateReadingMinutes(`<p>${"word ".repeat(265)}</p><img src="a.jpg">`)).toBe(2);
  });
});
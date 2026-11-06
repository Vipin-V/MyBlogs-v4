export const POSTS_PER_PAGE = 6;

/** Medium's approximate reading speed (words per minute). */
const WORDS_PER_MINUTE = 265;

/**
 * RSS includes article HTML, but not Medium's own reading-time metadata,
 * so this approximates Medium's formula: words at ~265 wpm plus a few
 * seconds per image (12s for the first, 11s for the second, down to 3s).
 */
export function estimateReadingMinutes(html: string): number {
  const images = (html.match(/<img\b/gi) ?? []).length;
  const text = html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, " ")
    .trim();
  const words = text ? text.split(/\s+/u).length : 0;

  let imageSeconds = 0;
  for (let i = 0; i < images; i++) imageSeconds += Math.max(3, 12 - i);

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE + imageSeconds / 60));
}

export function selectPosts<T extends { title: string; tags: string[] }>(
  posts: T[], query: string, tag: string, requestedPage: number,
) {
  const term = query.trim().toLocaleLowerCase();
  const filtered = posts.filter((post) =>
    (tag === "All" || post.tags.includes(tag)) &&
    (!term || [post.title, ...post.tags].join(" ").toLocaleLowerCase().includes(term)),
  );
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const page = Math.min(pageCount, Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1));
  const start = (page - 1) * POSTS_PER_PAGE;
  return { posts: filtered.slice(start, start + POSTS_PER_PAGE), total, page, pageCount, start };
}
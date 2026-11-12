/** Server-only Wisp CMS client. Wisp is the single source of truth for posts. */
import { estimateReadingMinutes } from "./blog-utils";

const BLOG_ID = "0ffdcdc7-68bd-448b-bdc8-c6b4f6533a0a";
const API = `https://www.wisp.blog/api/v1/${BLOG_ID}`;
const CACHE_MS = 5 * 60 * 1000;

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  image: string | null;
  readingMinutes: number;
};
export type BlogPostDetail = BlogPost & { content: string; author: string };

type WispPost = {
  slug: string; title: string; description: string | null; image: string | null;
  publishedAt: string | null; createdAt: string; content?: string;
  tags: { name: string }[]; author?: { name: string };
};

const cache = new Map<string, { at: number; value: unknown }>();
async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value as T;
  try {
    const value = await load();
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch (e) {
    if (hit) return hit.value as T; // serve last good copy
    throw e;
  }
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(API + path, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Wisp returned ${res.status}`);
  return (await res.json()) as T;
}

/** Remove third-party attribution and fix legacy Medium image hosts. */
function cleanContent(html: string): string {
  return html
    .replace(/<p[^>]*>\s*<small>\s*Powered by[\s\S]*?<\/small>\s*<\/p>/gi, "")
    .replace(/https?:\/\/cdn-images-1\.medium\.com\/(?:max|fit)\/\d+\//gi, "https://miro.medium.com/v2/resize:fit:1400/")
    .replace(/<img /gi, '<img loading="lazy" decoding="async" ');
}

function toPost(p: WispPost, content = ""): BlogPost {
  return {
    slug: p.slug,
    title: p.title.replace(/\u00a0/g, " ").trim(),
    description: p.description ?? "",
    date: p.publishedAt ?? p.createdAt,
    tags: p.tags.map((t) => t.name),
    image: p.image,
    readingMinutes: content ? estimateReadingMinutes(content) : Math.max(1, Math.round((p.description?.length ?? 0) / 200)),
  };
}

export function fetchPosts(): Promise<BlogPost[]> {
  return cached("list", async () => {
    const all: WispPost[] = [];
    for (let page = 1; page < 50; page++) {
      const data = await getJson<{ posts: WispPost[]; pagination: { nextPage: number | null } }>(`/posts?limit=100&page=${page}`);
      all.push(...data.posts);
      if (!data.pagination.nextPage) break;
    }
    // Reading time needs the article body; fetch details (cached) in parallel.
    const details = await Promise.all(all.map((p) => fetchPost(p.slug).catch(() => null)));
    return all.map((p, i) => details[i] ?? toPost(p))
      .map(({ content: _c, author: _a, ...rest }: BlogPost & Partial<BlogPostDetail>) => rest)
      .sort((a, b) => (b.date > a.date ? 1 : -1));
  });
}

export function fetchPost(slug: string): Promise<BlogPostDetail | null> {
  return cached(`post:${slug}`, async () => {
    const res = await fetch(`${API}/posts/${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(10_000) });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Wisp returned ${res.status}`);
    const { post } = (await res.json()) as { post: WispPost | null };
    if (!post) return null;
    let content = cleanContent(post.content ?? "");
    // The cover already shows above the article; drop its duplicate inside the body.
    if (post.image) content = content.replace(new RegExp(`<p>\\s*<img[^>]*src="${post.image.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>\\s*</p>`), "");
    return { ...toPost(post, content), content, author: post.author?.name ?? "Vipin V" };
  });
}

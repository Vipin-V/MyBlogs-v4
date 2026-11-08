/**
 * Server-only helper that fetches and parses the public Medium RSS feed.
 * Runs on the server (workerd) — never imported by browser code.
 */

import { estimateReadingMinutes } from "./blog-utils";

export const MEDIUM_USERNAME = "vipindas233";

/**
 * Manual cover overrides, keyed by a fragment of the post link.
 * Checked first, so they win over Microlink. Use for posts where the
 * Microlink lookup fails or returns the wrong image.
 */
export const POST_COVER_OVERRIDES: Record<string, string> = {
  "my-manali-tour-snow-friends-chaos": "https://cdn-images-1.medium.com/max/640/0*QVsUXeCLBIDHUEws",
};

export type MediumPost = {
  title: string;
  link: string;
  /** ISO date string */
  date: string;
  tags: string[];
  /** Cover image URL, or null when the post has no image */
  image: string | null;
  readingMinutes: number;
};

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Extract a tag's inner text from an XML block, handling CDATA and entities. */
function extractField(block: string, tag: string): string | null {
  const re = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`,
    "i",
  );
  const match = block.match(re);
  if (!match) return null;
  const value = match[1] ?? match[2] ?? "";
  return decodeXmlEntities(value).trim();
}

function upgradeImageSize(url: string): string {
  // cdn-images-1.medium.com links redirect unreliably; rewrite to Medium's
  // current image host, in the same size/format Medium itself serves.
  const legacy = url.match(
    /^https?:\/\/cdn-images-1\.medium\.com\/(?:max|fit)\/\d+\/(.+)$/i,
  );
  if (legacy?.[1]) return `https://miro.medium.com/v2/resize:fit:828/format:webp/${legacy[1]}`;
  return url.replace(/resize:fit:\d+/, "resize:fit:828");
}

function cleanLink(url: string): string {
  // Strip tracking query params (e.g. ?source=rss-...) from Medium links.
  const clean = url.split("?")[0] ?? "";
  return clean.length > 0 ? clean : url;
}

// Covers rarely change, so keep successful lookups to save the Microlink quota.
const coverCache = new Map<string, string>();

/** Medium's real preview image (og:image) via Microlink, or null on failure. */
async function fetchCover(link: string): Promise<string | null> {
  const hit = coverCache.get(link);
  if (hit) return hit;
  try {
    const res = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(link)}`,
      { signal: AbortSignal.timeout(8_000) },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { image?: { url?: string } } };
    const url = json.data?.image?.url;
    if (!url) return null;
    coverCache.set(link, url);
    return url;
  } catch {
    return null; // not cached, so it is retried on the next refresh
  }
}

// Per-server-instance cache so most visitors skip the round-trip to Medium.
const CACHE_MS = 5 * 60 * 1000;
let cached: { at: number; posts: MediumPost[] } | null = null;
let inflight: Promise<MediumPost[]> | null = null;

export async function fetchMediumPosts(
  username: string = MEDIUM_USERNAME,
): Promise<MediumPost[]> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.posts;
  if (inflight) return inflight;
  inflight = fetchFeed(username)
    .then((posts) => {
      cached = { at: Date.now(), posts };
      return posts;
    })
    .catch((error: unknown) => {
      if (cached) return cached.posts; // serve last good copy if Medium hiccups
      throw error;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

async function fetchFeed(username: string): Promise<MediumPost[]> {
  const response = await fetch(`https://medium.com/feed/@${username}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; personal-blog/1.0)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Medium feed returned ${response.status}`);
  }
  const xml = await response.text();

  const items = xml
    .split("<item>")
    .slice(1)
    .map((chunk) => chunk.split("</item>")[0])
    .filter((chunk): chunk is string => chunk !== undefined);

  const posts: MediumPost[] = [];
  // Image sources per post, resolved after parsing: override > Microlink > first <img>.
  const imageSources: { override: string | null; firstImg: string | null }[] = [];

  for (const item of items) {
    const title = extractField(item, "title");
    const link = extractField(item, "link");
    if (!title || !link) continue;

    const pubDate = extractField(item, "pubDate");
    const parsed = pubDate ? new Date(pubDate) : null;

    const tags: string[] = [];
    const categoryRe = /<category[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/category>/gi;
    let categoryMatch: RegExpExecArray | null;
    while ((categoryMatch = categoryRe.exec(item)) !== null) {
      const raw = categoryMatch[1] ?? categoryMatch[2] ?? "";
      const tag = decodeXmlEntities(raw).trim();
      if (tag && !tags.includes(tag)) tags.push(tag);
    }

    const postLink = cleanLink(link);
    const content = extractField(item, "content:encoded") ?? "";

    imageSources.push({
      override:
        Object.entries(POST_COVER_OVERRIDES).find(([key]) => postLink.includes(key))?.[1] ?? null,
      firstImg: content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null,
    });

    posts.push({
      title,
      link: postLink,
      date: parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : "",
      tags,
      image: null,
      readingMinutes: estimateReadingMinutes(content),
    });
  }

  await Promise.all(
    posts.map(async (post, i) => {
      const { override, firstImg } = imageSources[i]!;
      const src = override ?? (await fetchCover(post.link)) ?? firstImg;
      post.image = src ? upgradeImageSize(decodeXmlEntities(src)) : null;
    }),
  );

  posts.sort((a, b) => (b.date > a.date ? 1 : -1));
  return posts;
}
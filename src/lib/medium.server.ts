/**
 * Server-only helper that fetches and parses the public Medium RSS feed.
 * Runs on the server (workerd) — never imported by browser code.
 */

export const MEDIUM_USERNAME = "vipindas233";

export type MediumPost = {
  title: string;
  link: string;
  /** ISO date string */
  date: string;
  tags: string[];
  /** Cover image URL, or null when the post has no image */
  image: string | null;
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
  return decodeXmlEntities(match[1] ?? match[2] ?? "").trim();
}

function upgradeImageSize(url: string): string {
  // Medium serves images at /max/<width>/... — request a larger version.
  return url.replace(/\/(max|max-internal)\//, "/max/1400/");
}

function cleanLink(url: string): string {
  // Strip tracking query params (e.g. ?source=rss-...) from Medium links.
  const clean = url.split("?")[0];
  return clean.length > 0 ? clean : url;
}

export async function fetchMediumPosts(
  username: string = MEDIUM_USERNAME,
): Promise<MediumPost[]> {
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
    .map((chunk) => chunk.split("</item>")[0]);

  const posts: MediumPost[] = [];
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
      const tag = decodeXmlEntities(categoryMatch[1] ?? categoryMatch[2] ?? "").trim();
      if (tag && !tags.includes(tag)) tags.push(tag);
    }

    // Cover image: first <img> inside the post content.
    const content = extractField(item, "content:encoded") ?? "";
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    const image = imgMatch ? upgradeImageSize(decodeXmlEntities(imgMatch[1])) : null;

    posts.push({
      title,
      link: cleanLink(link),
      date: parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : "",
      tags,
      image,
    });
  }

  posts.sort((a, b) => (b.date > a.date ? 1 : -1));
  return posts;
}

export function mailDestination(userAgent: string, touchPoints = 0) {
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent) || (/Macintosh/i.test(userAgent) && touchPoints > 1);
  return { href: mobile ? "mailto:" : "https://mail.google.com/mail/u/0/#inbox", target: "_top" };
}

export function imagePreview(src: string) {
  try {
    const url = new URL(src);
    if (url.protocol === "https:" && url.hostname === "imagedelivery.net") {
      // This Wisp account disables Cloudflare flexible variants; use Wisp's
      // own managed image optimizer, which supports small public previews.
      return `https://www.wisp.blog/_next/image?url=${encodeURIComponent(src)}&w=64&q=75`;
    }
  } catch { /* Unsupported image URLs keep the neutral placeholder. */ }
  return undefined;
}
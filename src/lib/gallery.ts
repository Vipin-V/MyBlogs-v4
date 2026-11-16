/** Wrap runs of 2+ images with no text between them into a swipeable gallery. */
const IMG_BLOCK = String.raw`(?:<(?:p|figure|div)[^>]*>\s*)?<img[^>]*>(?:\s*<\/(?:p|figure|div)>)?`;
const RUN = new RegExp(String.raw`(?:${IMG_BLOCK}(?:\s|<br\s*\/?>|<p[^>]*>\s*<\/p>)*){2,}`, "gi");

export function groupImages(html: string): string {
  return html.replace(RUN, (run) => {
    const imgs = run.match(/<img[^>]*>/gi) ?? [];
    if (imgs.length < 2) return run;
    const slides = imgs.map((img) => `<div class="post-gallery-slide">${img}</div>`).join("");
    return `<div class="post-gallery" data-count="${imgs.length}"><div class="post-gallery-track">${slides}</div>` +
      `<button type="button" class="post-gallery-btn" data-dir="-1" aria-label="Previous image">‹</button>` +
      `<button type="button" class="post-gallery-btn" data-dir="1" aria-label="Next image">›</button>` +
      `<span class="post-gallery-count">1 / ${imgs.length}</span></div>`;
  });
}

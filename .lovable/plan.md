# Medium-powered Blog Website

A dark, terminal/pixel-style personal blog that mirrors the look of jdhruv.dev/blog, with only two pages (Blog + About) and posts pulled live from Medium (@vipindas233).

## What you'll get

- **Blog page (home, `/`)** — "Blogs" pixel heading, short description line, tag filter chips (All + every tag found on your Medium posts), and a 2-column card grid. Each card: dashed border, cover image from the Medium post, title, date (DD.MM.YYYY), and tag chips. Clicking a card opens the article on medium.com in a new tab.
- **About page (`/about`)** — same pixel aesthetic with your name and short bio. You said you'd type the bio — paste it in chat and it goes straight in; until then a small placeholder sits there.
- **Navbar** — pixel "VJ" logo on the left, only "Blog" and "About" links on the right, plus a light/dark toggle (dark is the default, matching the screenshots).
- **Footer** — copyright line ("Built with love, LLMs and Coffee"-style) and a pixel cat.

## How posts appear automatically

- A server function fetches your public Medium RSS feed (`https://medium.com/feed/@vipindas233`), parses it into plain post objects (title, link, date, tags, cover image taken from the first image inside the post).
- No database needed — the feed is the single source of truth. Publish on Medium, and the post appears here on the next visit (results cached for ~10 minutes so it stays fast).
- If the feed is temporarily unreachable, the page shows a friendly message instead of breaking.

## Design (matching your screenshots)

- Near-black background with full-page thin grid lines and small "+" cross markers at intersections.
- Monospace body font, pixel font for the "Blogs"/"About" headings and the VJ logo.
- Tag chips as small outlined pills; filter chips highlight the active one.
- Cards with dashed borders that lift slightly on hover; card grid collapses to one column on mobile.
- Colors defined as theme tokens in `src/styles.css` (no hardcoded colors), dark mode default.

## Technical notes

- Routes: `src/routes/index.tsx` (Blog) and `src/routes/about.tsx`, shared shell and fonts in `src/routes/__root.tsx`. Each route gets its own title/description/og metadata.
- Fonts loaded via `<link>` from Google Fonts (Geist Sans/Geist Mono equivalents + a pixel font like Silkscreen); referenced through Tailwind v4 theme tokens.
- Feed fetching + XML parsing runs server-side only (`createServerFn` in `src/lib/`), with TanStack Query caching and a loading skeleton while the first fetch runs.
- Tags are derived from the feed itself — no manual tag management needed.

## Build order

1. Theme tokens, fonts, grid-line background, dark default.
2. Navbar (VJ logo, Blog/About, theme toggle) + footer with pixel cat.
3. Medium feed server function + parsing + caching.
4. Blog page: heading, filter chips, card grid.
5. About page with your bio.
6. Verify in preview: posts load from your real Medium feed, filters work, cards link out to Medium, both pages look right on desktop and mobile.

# Search Console and indexing setup

## Current state
- `https://blog.vipinv.dev/` is live and already verified in the connected Google Search Console account.
- The live robots file allows public crawling and points to the correct sitemap address.
- The sitemap currently contains only Home and About, so article discovery is incomplete.
- Home, About and article pages already have page-specific titles, descriptions, canonical links and social metadata.

## Changes
1. Generate the sitemap from the existing Wisp post source so it includes Home, About and every published article, including future posts automatically.
2. Keep sitemap URLs on `https://blog.vipinv.dev`, escape URL values safely, and return an error instead of a partial sitemap if Wisp cannot be read. Omit `lastmod` because Wisp's current post data has no reliable content-updated timestamp.
3. Make About's canonical, Open Graph URL and structured-data URL absolute, matching the other pages.
4. Correct `llms.txt`: articles now render on this website from Wisp; remove the outdated Medium/RSS instructions and malformed links.

## Verification and Search Console
- Test sitemap generation with successful, paginated and failed Wisp responses; check the rendered XML and existing metadata in the preview.
- Confirm the updated sitemap is live on `blog.vipinv.dev` before submitting that exact sitemap to the existing verified Search Console property.
- Read Search Console's sitemap status and inspect the homepage's indexed state. Report anything Google has not processed yet rather than treating submission as indexing.

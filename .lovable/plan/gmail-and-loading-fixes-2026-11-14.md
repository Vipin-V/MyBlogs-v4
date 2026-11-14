# Gmail and loading fixes

## Changes
- Open Gmail as a full browser page on desktop, rather than inside an embedded preview where Google blocks it. Keep the default email-app link on phones.
- Replace homepage image shimmers with real small, blurred previews that fade into sharp covers. Start both image requests only when their card enters the viewport; keep centered landscape framing and stable sizes.
- Preserve the homepage skeleton and make article skeletons appear promptly on slow navigation. Check first visits as well as navigation, without adding artificial delays to fast loads.
- Keep the current pixel typography, dashed borders, colors and spacing; use only necessary code.

## Technical details
- Use a browser-safe helper for mail destinations and targets, with tests for desktop and mobile behavior.
- Use one focused image component with IntersectionObserver (zero margin), cleanup, cached-image handling, error fallbacks and reduced-motion support. Request small Wisp/Cloudflare image variants for previews; avoid changing article content or Wisp storage.
- Retain streaming homepage rendering. Verify article SSR separately; preserve article metadata and search discoverability when improving loading feedback.

## Verification
- Test desktop Gmail navigation from an embedded page and mobile mail-app destination; actual Gmail inbox access remains controlled by Google and the visitor's login.
- Delay real image requests to confirm blur-to-sharp transitions, and confirm offscreen cards request nothing until scrolling.
- Delay post responses to verify homepage and article skeletons, then confirm real Wisp posts replace them.
- Run relevant tests and check desktop/mobile screenshots and current page errors.
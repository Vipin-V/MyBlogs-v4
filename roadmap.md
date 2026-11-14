# Blog improvements

## Gmail and loading audit
- [x] Fix desktop Gmail opening and retain mobile email-app behavior
- [x] Add real blurred previews with viewport-only homepage image loading
- [x] Verify delayed homepage/article navigation skeletons; direct article visits return full server-rendered articles and metadata, without a skeleton during the initial server response wait
- [x] Fourteen tests pass; desktop/mobile previews and controlled embedded Gmail navigation verified (actual inbox/email verification remains untested)

- [x] Mobile hamburger menu and navigation search
- [x] Dates beneath titles and centered landscape thumbnails
- [x] Reading times from Medium content (estimates, not Medium metadata)
- [x] Search, tag filtering and pagination (six posts per page)
- [x] Six utility tests and desktop/mobile verification; current live feed has three posts, so multi-page logic is covered with test data

## Latest updates
- [x] Explain why estimated reading times differ from Medium
- [x] Remove the top tag filters without affecting search or pagination
- [x] Replace the About placeholder with the supplied biography
- [x] Verify blog and About on mobile and desktop; search works and all six utility tests pass

## Branding and interaction
- [x] Single pixel V branding and matching favicon
- [x] Click-reactive footer cat with hop, meow/purr and resting state; reference interaction could not be fetched for exact comparison
- [x] Polished mobile navigation and supplied blog subtitle
- [x] Explain reading-time calculation and verify interactions on mobile/desktop, keyboard cat interaction, favicon response and six passing tests

## Cat and discoverability
- [x] Replace cat with recognizable sleeping, awake and attack pixel poses
- [x] Improve public page metadata, structured data and crawlable pagination
- [x] Add the requested AI-readable /llms.txt guide
- [x] Verify cat states, crawlable content and metadata; all ten tests pass, SSR contains all three post links, no runtime errors
- [ ] Sitemap setup after a published public URL exists (blocked: not published)

## Wisp comments
- [x] Add per-post comments, paginated fetching and replies using Wisp's native public API
- [x] Match the blog style with loading, empty, error and email-verification states
- [x] Eight validation/settings tests pass; live Wisp fetching verified on desktop/mobile, reply and verification UI checked with controlled responses (real email verification requires a reader's inbox)
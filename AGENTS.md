<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture decisions

- Search and page selection live in validated blog URL parameters; legacy tag parameters normalize to All so removed filters cannot hide posts. Shared pure utilities filter before pagination and estimate reading time from RSS article HTML because Medium does not supply it in RSS.
- Brand marks and the interactive footer cat use crisp SVG pixels; cat reactions are local transient state with cleanup and reduced-motion support, requiring no external media or service.
- Public leaf routes own canonicals and JSON-LD; pagination uses crawlable links and search results are noindex. The static llms.txt lists only public content; sitemap creation waits for a published public URL.


- Blog posts come live from the Wisp CMS public API (server-side in `src/lib/wisp.server.ts`, exposed via `src/lib/wisp.functions.ts`, 5-minute cache); Wisp is the single source of truth and posts render on-site at `/blog/$slug`.
- Comments use Wisp's native public browser API independently of article loading; Wisp owns persistence, email verification and moderation, while its settings control replies, website links and email consent.

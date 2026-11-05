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

- Blog posts are not stored in a database: they are parsed live from the author's public Medium RSS feed (server-side in `src/lib/medium.server.ts`, called via `src/lib/medium.functions.ts` with a 10-minute query cache). Medium stays the single source of truth for posts.
- Medium cover images are rewritten from the legacy `cdn-images-1.medium.com` host to `miro.medium.com/v2/resize:fit:1400/` — the legacy host's redirects don't render in browsers.
- Search, tag and page selection live in validated blog URL parameters; shared pure utilities filter before pagination and estimate reading time from RSS article HTML because Medium does not supply it in RSS.


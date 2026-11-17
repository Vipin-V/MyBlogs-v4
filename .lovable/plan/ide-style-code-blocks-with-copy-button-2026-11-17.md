# IDE-style code blocks with copy button

## What you'll see
- Code in posts gets IDE-like colours (commands, strings, flags, keywords, comments) in a theme that matches dark and light mode.
- A small header bar on each block: a language label (e.g. "bash") on the left and a tiny copy icon on the right that flips to a check mark with "Copied" for ~1.5s.
- Inline code (like `git init` within a sentence) stays as it is now.

## Performance
- Colouring happens on the server when the post is prepared, so readers download no highlighting library and nothing shifts after load.
- Only the copy button is added in the browser, with a few lines of code.

## Technical details
- Add `highlight.js` (core + a small set of common languages: bash, javascript, typescript, json, python, css, html/xml, sql, yaml). Wisp code blocks have no language tag, so use `highlightAuto` limited to those languages; keep the cached result in `wisp.server.ts` `cleanContent` (posts already cached 5 min).
- Wrap each `<pre>` in `<div class="code-block">` with a header containing the language label and a `<button class="code-copy" aria-label="Copy code">`.
- New `src/hooks/use-code-copy.ts`: one delegated click listener on the article body using `navigator.clipboard.writeText`, with cleanup.
- Token colours as CSS variables (`--code-keyword`, `--code-string`, etc., oklch) in `styles.css` for `:root` and `.dark`; `.hljs-*` classes map to them.
- Small test for the wrapping/escaping helper; no change to galleries.

import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import sql from "highlight.js/lib/languages/sql";
import yaml from "highlight.js/lib/languages/yaml";

const langs = { bash, javascript, typescript, json, python, css, xml, sql, yaml };
for (const [name, lang] of Object.entries(langs)) hljs.registerLanguage(name, lang);
const LABELS: Record<string, string> = { xml: "html", javascript: "js", typescript: "ts" };

const SHELL = /^\s*(\$ |(git|npm|npx|bun|yarn|pnpm|cd|ls|mkdir|rm|cp|mv|curl|sudo|echo|brew|pip|docker|cat|touch)\b)/;

const decode = (s: string) =>
  s.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, "&");

const COPY_ICON = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

/** Colour code blocks at build/cache time and wrap them with a header + copy button. */
export function highlightCodeBlocks(html: string): string {
  return html.replace(/<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_, attrs: string, body: string) => {
    const code = decode(body);
    const hinted = /language-(\w+)/.exec(attrs)?.[1] ?? (SHELL.test(code) ? "bash" : undefined);
    const res = hinted && hljs.getLanguage(hinted) ? hljs.highlight(code, { language: hinted }) : hljs.highlightAuto(code, Object.keys(langs));
    const lang = res.language ?? "text";
    return `<div class="code-block"><div class="code-head"><span>${LABELS[lang] ?? lang}</span><button type="button" class="code-copy" aria-label="Copy code">${COPY_ICON}<span>Copy</span></button></div><pre><code class="hljs">${res.value}</code></pre></div>`;
  });
}

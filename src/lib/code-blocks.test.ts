import { describe, expect, it } from "vitest";
import { highlightCodeBlocks } from "./code-blocks";

describe("highlightCodeBlocks", () => {
  it("wraps code with a copy button and keeps text escaped", () => {
    const out = highlightCodeBlocks('<pre><code>echo "a &lt;b&gt;"</code></pre>');
    expect(out).toContain('class="code-copy"');
    expect(out).toContain("&lt;b&gt;");
    expect(out).not.toContain("<b>");
  });
  it("labels shell commands as bash", () => {
    expect(highlightCodeBlocks("<pre><code>git config --list</code></pre>")).toContain("<span>bash</span>");
  });
  it("leaves inline code alone", () => {
    expect(highlightCodeBlocks("<p><code>git init</code></p>")).toBe("<p><code>git init</code></p>");
  });
});

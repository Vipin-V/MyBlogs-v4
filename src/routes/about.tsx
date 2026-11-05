import { createFileRoute } from "@tanstack/react-router";
import { CrossMark } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  errorComponent: () => (
    <div className="mx-auto w-full max-w-3xl border-x border-border px-4 py-16">
      <p className="font-mono text-sm text-muted-foreground">
        Couldn't load this page. Please try again.
      </p>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "About · Vipin V" },
      {
        name: "description",
        content: "About Vipin V — writer and maker behind this blog, powered by Medium.",
      },
      { property: "og:title", content: "About · Vipin V" },
      {
        property: "og:description",
        content: "About Vipin V — writer and maker behind this blog, powered by Medium.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl border-x border-border">
      <section className="relative border-b border-border px-4 py-10">
        <h1 className="font-pixel text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          About
        </h1>
        <CrossMark className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
        <CrossMark className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      </section>

      <section className="relative px-4 py-8">
        <div className="max-w-prose space-y-4 font-mono text-sm leading-relaxed text-muted-foreground">
          <p className="font-sans text-lg font-semibold text-foreground">Hi, I'm Vipin V.</p>
          <p>
            I write stories and memories on Medium — from Navratri nights back in
            Gujarat to the little things that make everyday life worth it.
          </p>
          <p>
            Everything I publish on Medium shows up on the blog page here
            automatically, so this site is always up to date with my latest
            writing.
          </p>
          <p>
            <a
              href="https://medium.com/@vipindas233"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
            >
              Read my stories on Medium &rarr;
            </a>
          </p>
        </div>
        <CrossMark className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
        <CrossMark className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      </section>
    </div>
  );
}

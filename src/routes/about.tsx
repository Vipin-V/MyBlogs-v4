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
        content: "Meet Vipin — writing about travel, food, tech rabbit holes and life, with no niche or posting schedule.",
      },
      { property: "og:title", content: "About · Vipin V" },
      {
        property: "og:description",
        content: "Meet Vipin — writing about travel, food, tech rabbit holes and life, with no niche or posting schedule.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/about" },
      { name: "author", content: "Vipin V" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "AboutPage", url: "/about", name: "About Vipin V", mainEntity: { "@type": "Person", name: "Vipin V", sameAs: ["https://medium.com/@vipindas233"], description: "Writing about travel, food, technology and everyday life." } }) }],
  }),
});

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl border-x border-border">
      <section className="relative border-b border-border px-4 py-10">
        <h1 className="font-pixel text-3xl font-semibold text-foreground sm:text-4xl">
          About
        </h1>
        <CrossMark className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
        <CrossMark className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      </section>

      <section className="relative px-4 py-8">
        <div className="max-w-prose space-y-4 font-mono text-sm leading-relaxed text-muted-foreground">
          <p className="font-sans text-lg font-semibold text-foreground">hey, i'm Vipin.</p>
          <p>
            so this is my blog. no niche, no content strategy, no posting schedule, just me dumping my thoughts on the internet like it's 2009 and nobody's watching.
          </p>
          <p>
            i write about whatever's going on in my head at the time. sometimes it's places i visited. sometimes it's a meal that genuinely changed my life. sometimes it's a tech thing i went down a rabbit hole on at 2am. and sometimes it's just... life stuff. the weird, the good, the "why did i do that" moments.
          </p>
          <p>
            i'm not trying to be an influencer or a thought leader or whatever. i just like writing, and i figured someone out there might find it relatable or useful or at least mildly entertaining.
          </p>
          <p>
            if you're here, cool. stick around. or don't. no pressure.
          </p>
        </div>
        <CrossMark className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
        <CrossMark className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      </section>
    </div>
  );
}

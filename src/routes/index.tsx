import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { getMediumPosts } from "@/lib/medium.functions";
import type { MediumPost } from "@/lib/medium.functions";
import { CrossMark } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { selectPosts } from "@/lib/blog-utils";

const postsQueryOptions = queryOptions({
  queryKey: ["medium-posts"],
  queryFn: () => getMediumPosts(),
  staleTime: 10 * 60 * 1000,
});

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    tag: "All",
    page: typeof search["page"] === "number" && Number.isFinite(search["page"]) ? search["page"] : 1,
  }),
  loaderDeps: ({ search }) => ({ q: search.q, page: search.page }),
  loader: async ({ context, deps }) => ({ ...await context.queryClient.ensureQueryData(postsQueryOptions), search: deps }),
  notFoundComponent: () => <FeedMessage title="Page not found">This blog page doesn't exist.</FeedMessage>,
  component: BlogIndex,
  errorComponent: ({ error }) => (
    <FeedMessage title="Something broke">
      Couldn't load this page. {error instanceof Error ? error.message : ""}
    </FeedMessage>
  ),
  head: ({ loaderData }) => {
    const page = selectPosts(loaderData?.posts ?? [], loaderData?.search.q ?? "", "All", loaderData?.search.page ?? 1);
    const path = page.page > 1 ? `/?page=${page.page}` : "/";
    return {
    meta: [
      { title: "Blogs · Vipin V" },
      {
        name: "description",
        content:
          "Blogs by Vipin V on tech, ideas, memories, projects and travel.",
      },
      { property: "og:title", content: "Blogs · Vipin V" },
      {
        property: "og:description",
        content: "Blogs by Vipin V on tech, ideas, memories, projects and travel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: path },
      { name: "author", content: "Vipin V" },
      ...(loaderData?.search.q ? [{ name: "robots", content: "noindex, follow" }] : []),
    ],
    links: [{ rel: "canonical", href: path }, { rel: "alternate", type: "application/rss+xml", title: "Vipin V on Medium", href: "https://medium.com/feed/@vipindas233" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "Blog", name: "Vipin V's Blog", url: path,
      description: "Blogs by Vipin V on tech, ideas, memories, projects and travel.",
      author: { "@type": "Person", name: "Vipin V", url: "/about", sameAs: ["https://medium.com/@vipindas233"] },
      blogPost: page.posts.map((post) => ({ "@type": "BlogPosting", headline: post.title, url: post.link, ...(post.date ? { datePublished: post.date } : {}), ...(post.image ? { image: post.image } : {}), author: { "@type": "Person", name: "Vipin V", sameAs: "https://medium.com/@vipindas233" }, keywords: post.tags.join(", ") })),
    }).replace(/</g, "\\u003c") }],
  }; },
});

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getUTCFullYear()}`;
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
      {tag}
    </span>
  );
}

function PostCard({ post }: { post: MediumPost }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block min-w-0 rounded-lg border border-dashed border-border bg-background/50 p-2 transition-colors duration-300 hover:border-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {post.image ? (
        <img
          src={post.image}
          alt=""
          loading="lazy"
          className="aspect-video w-full rounded-md object-cover object-center"
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-md bg-muted">
          <span className="font-pixel text-2xl text-muted-foreground">V</span>
        </div>
      )}
      <div className="px-1 pt-3">
        <h2 className="break-words text-base font-semibold leading-snug text-foreground group-hover:underline">
          {post.title}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
          {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
          <span className="inline-flex items-center gap-1.5" title="Estimated from article text"><Clock aria-hidden className="size-3" />~{post.readingMinutes} min read</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 px-1 pb-1 pt-2">
        {post.tags.map((tag) => (
          <TagPill key={tag} tag={tag} />
        ))}
      </div>
    </a>
  );
}

function FeedMessage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl border-x border-border px-4">
      <section className="relative py-16">
        <h2 className="font-pixel text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-3 max-w-md font-mono text-sm text-muted-foreground">{children}</p>
        <CrossMark className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
        <CrossMark className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      </section>
    </div>
  );
}

function BlogIndex() {
  const { data } = useSuspenseQuery(postsQueryOptions);
  const posts = data.posts;
  const { q, page } = Route.useSearch();
  const navigate = Route.useNavigate();

  const results = selectPosts(posts, q, "All", page);

  if (data.error && posts.length === 0) {
    return <FeedMessage title="Couldn't load posts">{data.error}</FeedMessage>;
  }

  if (posts.length === 0) {
    return (
      <FeedMessage title="No posts yet">
        Nothing published on Medium so far — new posts will appear here automatically.
      </FeedMessage>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl border-x border-border">
      <section className="relative border-b border-border px-4 py-10">
        <h1 className="font-pixel text-3xl font-semibold text-foreground sm:text-4xl">
          Blogs
        </h1>
        <CrossMark className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
        <CrossMark className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      </section>

      <section className="relative border-b border-border px-4 py-5">
        <p className="font-mono text-sm text-muted-foreground">
          Blogs by Vipin V on tech, ideas, memories, projects and travel.
        </p>
        <CrossMark className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
        <CrossMark className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      </section>

      <section id="post-list" className="scroll-mt-4 px-4 py-6">
        {q && (
          <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-4">
            <p className="min-w-0 break-words font-mono text-sm text-muted-foreground" role="status">{results.total} {results.total === 1 ? "post" : "posts"} for <span className="text-foreground">“{q}”</span></p>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="outline" size="sm" className="font-mono text-xs" onClick={() => void navigate({ search: (prev) => ({ ...prev, q: "", page: 1 }), resetScroll: false })}>Show all posts</Button>
              <Button variant="ghost" size="icon" aria-label="Clear search" title="Clear search" onClick={() => void navigate({ search: (prev) => ({ ...prev, q: "", page: 1 }), resetScroll: false })}><X /></Button>
            </div>
          </div>
        )}
        {results.total === 0 ? (
          <p className="py-8 font-mono text-sm text-muted-foreground">
            No matching posts.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {results.posts.map((post) => (
              <PostCard key={post.link} post={post} />
            ))}
          </div>
        )}
        {results.pageCount > 1 && (
          <nav aria-label="Post pagination" className="mt-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-5">
            {results.page === 1 ? <Button variant="outline" size="icon" disabled aria-label="Previous page"><ChevronLeft /></Button> : <Button asChild variant="outline" size="icon"><Link to="/" search={{ q, tag: "All", page: results.page - 1 }} aria-label="Previous page" title="Previous page"><ChevronLeft /></Link></Button>}
            <p className="min-w-0 text-center font-mono text-xs text-muted-foreground" aria-live="polite">Page {results.page} of {results.pageCount}<span className="mt-1 block">{results.start + 1}–{results.start + results.posts.length} of {results.total} posts</span></p>
            {results.page === results.pageCount ? <Button variant="outline" size="icon" disabled aria-label="Next page"><ChevronRight /></Button> : <Button asChild variant="outline" size="icon"><Link to="/" search={{ q, tag: "All", page: results.page + 1 }} aria-label="Next page" title="Next page"><ChevronRight /></Link></Button>}
          </nav>
        )}
      </section>
    </div>
  );
}

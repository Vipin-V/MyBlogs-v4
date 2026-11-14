import { getRequestOrigin } from "@/lib/origin.functions";
import { Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { getPosts } from "@/lib/wisp.functions";
import type { BlogPost } from "@/lib/wisp.functions";
import { CrossMark } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { selectPosts } from "@/lib/blog-utils";
import { BlurImage } from "@/components/blur-image";

const postsQueryOptions = queryOptions({
  queryKey: ["posts"],
  queryFn: () => getPosts(),
  staleTime: 10 * 60 * 1000,
});

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    tag: "All",
    page: typeof search["page"] === "number" && Number.isFinite(search["page"]) ? search["page"] : 1,
  }),
  loaderDeps: ({ search }) => ({ q: search.q, page: search.page }),
  // Start fetching without blocking, so the page shell + skeleton paint immediately.
  loader: async ({ context, deps }) => {
    void context.queryClient.prefetchQuery(postsQueryOptions);
    return { search: deps, origin: await getRequestOrigin() };
  },
  notFoundComponent: () => <FeedMessage title="Page not found">This blog page doesn't exist.</FeedMessage>,
  component: BlogIndex,
  errorComponent: ({ error }) => (
    <FeedMessage title="Something broke">
      Couldn't load this page. {error instanceof Error ? error.message : ""}
    </FeedMessage>
  ),
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "https://blog.vipinv.dev";
    const pageNum = loaderData?.search.page ?? 1;
    const canonicalPath = pageNum > 1 ? `/?page=${pageNum}` : "/";
    const canonicalUrl = origin + canonicalPath;
    const ogImage = `${origin}/og-image.jpg`;
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
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: ogImage },
        { name: "author", content: "Vipin V" },
        ...(loaderData?.search.q ? [{ name: "robots", content: "noindex, follow" }] : []),
      ],
      links: [{ rel: "preconnect", href: "https://imagedelivery.net", crossOrigin: "anonymous" }, { rel: "canonical", href: canonicalUrl }],
      scripts: [{
        type: "application/ld+json", children: JSON.stringify({
          "@context": "https://schema.org", "@type": "Blog", name: "Vipin V's Blog", url: canonicalUrl,
          description: "Blogs by Vipin V on tech, ideas, memories, projects and travel.",
          author: { "@type": "Person", name: "Vipin V", url: `${origin}/about`, sameAs: ["https://medium.com/@vipindas233"] },
        }).replace(/</g, "\\u003c")
      }],
    };
  },
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

function BlogSkeleton() {
  return (
    <section className="px-4 py-6" aria-busy="true" aria-label="Loading posts">
      <p className="mb-4 font-mono text-xs text-muted-foreground">
        fetching posts<span className="animate-pulse">_</span>
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-lg border border-dashed border-border p-2">
            <div className="skeleton aspect-video w-full rounded-md" />
            <div className="space-y-2 px-1 pt-3">
              <div className="skeleton h-4 w-4/5 rounded-sm" />
              <div className="skeleton h-4 w-1/2 rounded-sm" />
              <div className="skeleton mt-3 h-3 w-1/3 rounded-sm" />
            </div>
            <div className="flex gap-1.5 px-1 pb-1 pt-3">
              <div className="skeleton h-5 w-14 rounded-md" />
              <div className="skeleton h-5 w-10 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}



function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group block min-w-0 rounded-lg border border-dashed border-border bg-background/50 p-2 transition-colors duration-300 hover:border-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {post.image ? (
        <BlurImage key={post.image} src={post.image} />
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
    </Link>
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

      <Suspense fallback={<BlogSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  );
}

function PostList() {
  const { data } = useSuspenseQuery(postsQueryOptions);
  const posts = data.posts;
  const { q, page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const showAll = () => void navigate({ search: (prev) => ({ ...prev, q: "", page: 1 }), resetScroll: false });

  const results = selectPosts(posts, q, "All", page);

  if (data.error && posts.length === 0) {
    return <Notice title="Couldn't load posts">{data.error}</Notice>;
  }

  if (posts.length === 0) {
    return <Notice title="No posts yet">Nothing published so far — new posts will appear here automatically.</Notice>;
  }

  return (
    <section id="post-list" className="scroll-mt-4 px-4 py-6">
      {q && (
        <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-4">
          <p className="min-w-0 break-words font-mono text-sm text-muted-foreground" role="status">{results.total} {results.total === 1 ? "post" : "posts"} for <span className="text-foreground">“{q}”</span></p>
          <Button variant="ghost" size="icon" aria-label="Clear search" title="Clear search" onClick={showAll}><X /></Button>
        </div>
      )}
      {results.total === 0 ? (
        <p className="py-8 font-mono text-sm text-muted-foreground">
          No matching posts.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {results.posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
      {q && (
        <div className="mt-6 flex justify-center border-t border-border pt-5">
          <Button variant="outline" size="sm" className="font-mono text-xs" onClick={showAll}>Show all posts</Button>
        </div>
      )}
      {results.pageCount > 1 && (
        <nav aria-label="Post pagination" className="mt-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-5">
          {results.page === 1 ? (
            <Button variant="outline" size="icon" className="w-20 shadow-[0_2px_0_0_var(--color-border)]" disabled aria-label="Previous page">
              <ChevronLeft />
            </Button>
          ) : (
            <Button asChild variant="outline" size="icon" className="w-20 shadow-[0_2px_0_0_var(--color-border)] transition-all hover:translate-y-[-1px] hover:shadow-[0_3px_0_0_var(--color-border)] active:translate-y-[1px] active:shadow-none">
              <Link to="/" search={{ q, tag: "All", page: results.page - 1 }} aria-label="Previous page" title="Previous page">
                <ChevronLeft />
              </Link>
            </Button>
          )}
          <p className="min-w-0 text-center font-mono text-xs text-muted-foreground" aria-live="polite">Page {results.page} of {results.pageCount}<span className="mt-1 block">{results.start + 1}–{results.start + results.posts.length} of {results.total} posts</span></p>
          {results.page === results.pageCount ? (
            <Button variant="outline" size="icon" className="w-20 shadow-[0_2px_0_0_var(--color-border)]" disabled aria-label="Next page">
              <ChevronRight />
            </Button>
          ) : (
            <Button asChild variant="outline" size="icon" className="w-20 shadow-[0_2px_0_0_var(--color-border)] transition-all hover:translate-y-[-1px] hover:shadow-[0_3px_0_0_var(--color-border)] active:translate-y-[1px] active:shadow-none">
              <Link to="/" search={{ q, tag: "All", page: results.page + 1 }} aria-label="Next page" title="Next page">
                <ChevronRight />
              </Link>
            </Button>
          )}
        </nav>
      )}
    </section>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-4 py-16">
      <h2 className="font-pixel text-2xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 max-w-md font-mono text-sm text-muted-foreground">{children}</p>
    </section>
  );
}

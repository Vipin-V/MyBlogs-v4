import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
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
    q: typeof search.q === "string" ? search.q : "",
    tag: typeof search.tag === "string" ? search.tag : "All",
    page: typeof search.page === "number" && Number.isFinite(search.page) ? search.page : 1,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQueryOptions),
  notFoundComponent: () => <FeedMessage title="Page not found">This blog page doesn't exist.</FeedMessage>,
  component: BlogIndex,
  errorComponent: ({ error }) => (
    <FeedMessage title="Something broke">
      Couldn't load this page. {error instanceof Error ? error.message : ""}
    </FeedMessage>
  ),
  head: () => ({
    meta: [
      { title: "Blogs · Vipin V" },
      {
        name: "description",
        content:
          "Articles by Vipin V on memories, movies and ideas — published on Medium, shown here automatically.",
      },
      { property: "og:title", content: "Blogs · Vipin V" },
      {
        property: "og:description",
        content: "Articles by Vipin V on memories, movies and ideas — published on Medium.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getUTCFullYear()}`;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      aria-pressed={active}
      onClick={onClick}
      className={
        active
          ? "rounded-md bg-foreground px-2.5 py-1 font-mono text-xs text-background transition-colors"
          : "rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
      }
    >
      {label}
    </Button>
  );
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
          <span className="font-pixel text-2xl text-muted-foreground">VJ</span>
        </div>
      )}
      <div className="px-1 pt-3">
        <h3 className="break-words text-base font-semibold leading-snug text-foreground group-hover:underline">
          {post.title}
        </h3>
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
  const { q, tag: filter, page } = Route.useSearch();
  const navigate = Route.useNavigate();

  const tags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).sort(),
    [posts],
  );
  const results = selectPosts(posts, q, filter, page);
  const setFilter = (tag: string) => { void navigate({ search: (prev) => ({ ...prev, tag, page: 1 }), resetScroll: false }); };
  const changePage = (next: number) => {
    void navigate({ search: (prev) => ({ ...prev, page: next }), resetScroll: false });
    document.getElementById("post-list")?.scrollIntoView({ block: "start" });
  };

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
          Articles by Vipin V on memories, movies and ideas — published on Medium.
        </p>
        <CrossMark className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
        <CrossMark className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      </section>

      <section className="relative border-b border-border px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">Filter:</span>
          <Chip label="All" active={filter === "All"} onClick={() => setFilter("All")} />
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              active={filter === tag}
              onClick={() => setFilter(tag)}
            />
          ))}
        </div>
        <CrossMark className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
        <CrossMark className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      </section>

      <section id="post-list" className="scroll-mt-4 px-4 py-6">
        {q && (
          <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-4">
            <p className="min-w-0 break-words font-mono text-sm text-muted-foreground" role="status">{results.total} {results.total === 1 ? "post" : "posts"} for <span className="text-foreground">“{q}”</span></p>
            <Button variant="ghost" size="icon" aria-label="Clear search" title="Clear search" onClick={() => void navigate({ search: (prev) => ({ ...prev, q: "", page: 1 }), resetScroll: false })}><X /></Button>
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
            <Button variant="outline" size="icon" disabled={results.page === 1} aria-label="Previous page" title="Previous page" onClick={() => changePage(results.page - 1)}><ChevronLeft /></Button>
            <p className="min-w-0 text-center font-mono text-xs text-muted-foreground" aria-live="polite">Page {results.page} of {results.pageCount}<span className="mt-1 block">{results.start + 1}–{results.start + results.posts.length} of {results.total} posts</span></p>
            <Button variant="outline" size="icon" disabled={results.page === results.pageCount} aria-label="Next page" title="Next page" onClick={() => changePage(results.page + 1)}><ChevronRight /></Button>
          </nav>
        )}
      </section>
    </div>
  );
}

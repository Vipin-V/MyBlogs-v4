import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getMediumPosts } from "@/lib/medium.functions";
import type { MediumPost } from "@/lib/medium.functions";
import { CrossMark } from "@/components/site-chrome";

const postsQueryOptions = queryOptions({
  queryKey: ["medium-posts"],
  queryFn: () => getMediumPosts(),
  staleTime: 10 * 60 * 1000,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQueryOptions),
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
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-md bg-foreground px-2.5 py-1 font-mono text-xs text-background transition-colors"
          : "rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
      }
    >
      {label}
    </button>
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
      className="group block rounded-xl border border-dashed border-border bg-background/50 p-2 transition-colors duration-300 hover:border-foreground/50"
    >
      {post.image ? (
        <img
          src={post.image}
          alt=""
          loading="lazy"
          className="h-52 w-full rounded-lg object-cover object-top"
        />
      ) : (
        <div className="flex h-52 w-full items-center justify-center rounded-lg bg-muted">
          <span className="font-pixel text-2xl text-muted-foreground">VJ</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 px-1 pt-2">
        <h3 className="text-base font-semibold leading-snug text-foreground group-hover:underline">
          {post.title}
        </h3>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {formatDate(post.date)}
        </span>
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

  const tags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).sort(),
    [posts],
  );
  const [filter, setFilter] = useState("All");
  const filtered =
    filter === "All" ? posts : posts.filter((post) => post.tags.includes(filter));

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
        <h1 className="font-pixel text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
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

      <section className="px-4 py-6">
        {filtered.length === 0 ? (
          <p className="py-8 font-mono text-sm text-muted-foreground">
            No posts tagged &quot;{filter}&quot; yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((post) => (
              <PostCard key={post.link} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

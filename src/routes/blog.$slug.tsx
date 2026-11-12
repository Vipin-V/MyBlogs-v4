import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock } from "lucide-react";
import { getPost } from "@/lib/wisp.functions";
import { getRequestOrigin } from "@/lib/origin.functions";
import { CrossMark } from "@/components/site-chrome";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    queryFn: async () => {
      const post = await getPost({ data: { slug } });
      if (!post) throw notFound();
      return post;
    },
    staleTime: 10 * 60 * 1000,
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const [post, origin] = await Promise.all([
      context.queryClient.ensureQueryData(postQuery(params.slug)),
      getRequestOrigin(),
    ]);
    return { post, origin };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Post unavailable · Vipin V" }, { name: "robots", content: "noindex" }] };
    const { post, origin } = loaderData;
    const url = `${origin}/blog/${params.slug}`;
    const title = `${post.title} · Vipin V`;
    const image = post.image ? [{ property: "og:image", content: post.image }, { name: "twitter:image", content: post.image }] : [];
    return {
      meta: [
        { title },
        { name: "description", content: post.description },
        { property: "og:title", content: title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: post.date },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "author", content: post.author },
        ...image,
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title,
          description: post.description, image: post.image ?? undefined, datePublished: post.date,
          keywords: post.tags.join(", "), url, author: { "@type": "Person", name: post.author, url: `${origin}/about` },
        }),
      }],
    };
  },
  component: PostPage,
  pendingComponent: PostSkeleton,
  notFoundComponent: () => (
    <Shell>
      <h1 className="font-pixel text-2xl font-semibold text-foreground">Post not found</h1>
      <p className="mt-3 font-mono text-sm text-muted-foreground">This post doesn't exist or was removed.</p>
      <BackLink />
    </Shell>
  ),
  errorComponent: () => (
    <Shell>
      <h1 className="font-pixel text-2xl font-semibold text-foreground">Couldn't load post</h1>
      <p className="mt-3 font-mono text-sm text-muted-foreground">Please try again shortly.</p>
      <BackLink />
    </Shell>
  ),
});

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl border-x border-border px-4 py-16">{children}</div>;
}

function BackLink() {
  return (
    <Link to="/" search={{ q: "", tag: "All", page: 1 }} className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeft className="size-3.5" /> back to blogs
    </Link>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

function PostSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl border-x border-border px-4 py-10" aria-busy="true">
      <div className="skeleton h-3 w-24 rounded-sm" />
      <div className="skeleton mt-6 h-8 w-4/5 rounded-sm" />
      <div className="skeleton mt-3 h-3 w-40 rounded-sm" />
      <div className="skeleton mt-8 aspect-video w-full rounded-lg" />
      {Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton mt-4 h-3 w-full rounded-sm" />)}
    </div>
  );
}

function PostPage() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(slug));
  return (
    <article className="mx-auto w-full max-w-3xl border-x border-border">
      <header className="relative border-b border-border px-4 py-10">
        <Link to="/" search={{ q: "", tag: "All", page: 1 }} className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-3.5" /> back to blogs
        </Link>
        <h1 className="mt-6 text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
          <span>{post.author}</span><span aria-hidden>·</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time><span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-3" />{post.readingMinutes} min read</span>
        </div>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((t) => <span key={t} className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{t}</span>)}
          </div>
        )}
        <CrossMark className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
        <CrossMark className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
      </header>
      {post.image && (
        <div className="relative border-b border-border p-2 sm:p-4">
          <img src={post.image} alt="" fetchPriority="high" className="aspect-video w-full rounded-lg border border-dashed border-border object-cover" />
        </div>
      )}
      <div className="relative px-4 py-10">
        <div className="article-body mx-auto max-w-2xl" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="mx-auto mt-12 max-w-2xl border-t border-dashed border-border pt-6"><BackLink /></div>
      </div>
    </article>
  );
}

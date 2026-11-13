import { Suspense, useState, useTransition } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ChevronLeft, ChevronRight, Inbox, LoaderCircle, MailCheck, MessageSquare, Reply, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { commentSchema, fetchComments, safeWebsite, submitComment } from "@/lib/wisp-comments";
import type { CommentValues, CommentsData, WispComment } from "@/lib/wisp-comments";

const commentsQuery = (slug: string, page: number) => queryOptions({
  queryKey: ["comments", slug, page],
  queryFn: async ({ signal }) => {
    try { return { data: await fetchComments(slug, page, signal), error: null }; }
    catch { return { data: null, error: "Couldn't load comments. Please try again." }; }
  },
  staleTime: 30_000,
  refetchInterval: 60_000,
});

// Mobile opens the default mail app; desktop opens Gmail in a new tab.
function mailHref() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? "mailto:" : "https://mail.google.com/mail/u/0/#inbox";
}

function CommentsSkeleton() {
  return <div aria-label="Loading comments" aria-busy="true" className="space-y-4 py-6">
    <div className="skeleton h-5 w-32 rounded-sm" />
    <div className="skeleton h-28 w-full rounded-md" />
    <div className="grid grid-cols-2 gap-4"><div className="skeleton h-10 rounded-md" /><div className="skeleton h-10 rounded-md" /></div>
  </div>;
}

export function PostComments({ slug }: { slug: string }) {
  return <section aria-label="Post comments" className="border-t border-dashed border-border px-4 py-10 sm:py-12">
    <div className="mx-auto max-w-2xl">
      <ClientOnly fallback={<CommentsSkeleton />}>
        <Suspense fallback={<CommentsSkeleton />}><Discussion key={slug} slug={slug} /></Suspense>
      </ClientOnly>
    </div>
  </section>;
}

function Discussion({ slug }: { slug: string }) {
  const [page, setPage] = useState(1);
  const [reply, setReply] = useState<WispComment | null>(null);
  const [pending, startTransition] = useTransition();
  const { data: result, refetch } = useSuspenseQuery(commentsQuery(slug, page));
  const { data, error } = result;
  if (!data) return <div role="status" className="flex flex-wrap items-center justify-between gap-3 font-mono text-sm text-muted-foreground">
    <p>{error}</p><Button variant="outline" onClick={() => void refetch()}>Try again</Button>
  </div>;
  if (!data.config.enabled) return null;
  return <>
    <div className="mb-7 flex items-center justify-between gap-3">
      <h2 className="font-pixel text-xl font-semibold text-foreground">Comments</h2>
      <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground"><MessageSquare className="size-3.5" />{data.pagination.totalComments}</span>
    </div>
    <CommentForm key={reply?.id ?? "new"} slug={slug} config={data.config} reply={reply} onCancel={() => setReply(null)} />
    <div className="mt-10" aria-busy={pending}>
      {data.comments.length === 0 ? <p className="border-y border-dashed border-border py-8 text-center font-mono text-sm text-muted-foreground">No comments yet. Be the first to leave a thought.</p> :
        <ol className="divide-y divide-dashed divide-border">
          {data.comments.map(comment => <li key={comment.id} className="py-6 first:pt-0">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted font-pixel text-sm text-foreground">{comment.author.slice(0, 1).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {safeWebsite(comment.url) ? <a href={safeWebsite(comment.url)} target="_blank" rel="noopener noreferrer nofollow ugc" className="break-words text-sm font-semibold text-foreground underline-offset-4 hover:underline">{comment.author}</a> : <span className="break-words text-sm font-semibold text-foreground">{comment.author}</span>}
                  <time dateTime={comment.createdAt} className="font-mono text-[11px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</time>
                </div>
                {comment.parent && <blockquote className="mt-3 border-l-2 border-border pl-3 text-xs text-muted-foreground"><span className="font-mono">↳ {comment.parent.author}</span><p className="mt-1 line-clamp-2 break-words">{comment.parent.content}</p></blockquote>}
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-foreground">{comment.content}</p>
                {data.config.allowNested && <Button variant="ghost" size="sm" className="mt-2 -ml-3 font-mono text-muted-foreground" onClick={() => {
                  setReply(comment);
                  document.getElementById("comment-form")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
                }}><Reply />Reply</Button>}
              </div>
            </div>
          </li>)}
        </ol>}
      {data.pagination.totalPages > 1 && <nav aria-label="Comment pages" className="mt-5 flex items-center justify-between border-t border-dashed border-border pt-5">
        <Button variant="outline" size="icon" aria-label="Previous comments" disabled={!data.pagination.prevPage || pending} onClick={() => startTransition(() => setPage(page - 1))}><ChevronLeft /></Button>
        <span className="font-mono text-xs text-muted-foreground">{page} / {data.pagination.totalPages}</span>
        <Button variant="outline" size="icon" aria-label="Next comments" disabled={!data.pagination.nextPage || pending} onClick={() => startTransition(() => setPage(page + 1))}><ChevronRight /></Button>
      </nav>}
    </div>
  </>;
}

function CommentForm({ slug, config, reply, onCancel }: { slug: string; config: CommentsData["config"]; reply: WispComment | null; onCancel: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<CommentValues>({ resolver: zodResolver(commentSchema), defaultValues: { author: "", email: "", content: "", url: "", allowEmailUsage: false } });
  const mutation = useMutation({
    mutationFn: (values: CommentValues) => submitComment(values, slug, config, reply?.id),
    onSuccess: () => { form.reset(); void queryClient.invalidateQueries({ queryKey: ["comments", slug] }); },
    retry: false,
  });
  const fieldClass = "h-11 bg-background text-base md:text-base";
  const errors = form.formState.errors;
  return <div id="comment-form" className="scroll-mt-24">
    {mutation.isSuccess ? <div role="status" className="border-y border-dashed border-border py-7">
      <div className="flex items-center gap-3"><MailCheck className="size-5 text-muted-foreground" /><h3 className="text-sm font-semibold text-foreground">Check your inbox</h3></div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">Your comment has been sent. Verify it using the link in Wisp’s email before it can appear here. Check your spam folder too; approval follows this blog’s comment settings.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" className="font-mono">
          <a href={mailHref()} target="_blank" rel="noopener noreferrer"><Inbox />Open your mail</a>
        </Button>
        <Button variant="outline" size="sm" className="font-mono" onClick={() => { mutation.reset(); onCancel(); }}>Write another comment<ArrowRight /></Button>
      </div>
    </div> : <form onSubmit={form.handleSubmit(values => mutation.mutate(values))} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="comment-content" className="text-sm font-medium text-foreground">{reply ? `Reply to ${reply.author}` : "Leave a thought"}</label>
        {reply && <Button type="button" variant="ghost" size="icon" aria-label="Cancel reply" onClick={onCancel}><X /></Button>}
      </div>
      <Textarea id="comment-content" placeholder="What’s on your mind?" maxLength={5000} className="min-h-32 resize-y bg-background text-base md:text-base" aria-invalid={Boolean(errors.content)} aria-describedby={errors.content ? "comment-content-error" : undefined} {...form.register("content")} />
      {errors.content && <p id="comment-content-error" role="alert" className="text-xs text-destructive">{errors.content.message}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><label htmlFor="comment-author" className="font-mono text-xs text-muted-foreground">Name</label><Input id="comment-author" autoComplete="name" placeholder="Your name" maxLength={100} className={fieldClass} aria-invalid={Boolean(errors.author)} aria-describedby={errors.author ? "comment-author-error" : undefined} {...form.register("author")} />{errors.author && <p id="comment-author-error" role="alert" className="text-xs text-destructive">{errors.author.message}</p>}</div>
        <div className="space-y-2"><label htmlFor="comment-email" className="font-mono text-xs text-muted-foreground">Email</label><Input id="comment-email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} className={fieldClass} aria-invalid={Boolean(errors.email)} aria-describedby="comment-email-note" {...form.register("email")} />{errors.email && <p role="alert" className="text-xs text-destructive">{errors.email.message}</p>}</div>
      </div>
      {config.allowUrls && <div className="space-y-2"><label htmlFor="comment-url" className="font-mono text-xs text-muted-foreground">Website <span>(optional)</span></label><Input id="comment-url" type="url" placeholder="https://" maxLength={500} className={fieldClass} {...form.register("url")} />{errors.url && <p role="alert" className="text-xs text-destructive">{errors.url.message}</p>}</div>}
      <p id="comment-email-note" className="font-mono text-[11px] leading-5 text-muted-foreground">Your email stays private and is used to verify your comment.</p>
      {config.signUpMessage && <label className="flex items-start gap-2 text-sm text-muted-foreground"><input type="checkbox" className="mt-1 size-4 accent-primary" {...form.register("allowEmailUsage")} />{config.signUpMessage}</label>}
      {mutation.isError && <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p>}
      <Button type="submit" disabled={mutation.isPending} className="font-mono">{mutation.isPending ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <ArrowRight />}{mutation.isPending ? "Sending…" : reply ? "Send reply" : "Post comment"}</Button>
    </form>}
  </div>;
}
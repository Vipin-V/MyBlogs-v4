import { z } from "zod";

// Wisp's public comment API handles storage, verification and spam protection.
const API = "https://www.wisp.blog/api/v1/0ffdcdc7-68bd-448b-bdc8-c6b4f6533a0a";
const publicComment = z.object({
  id: z.string(), author: z.string(), content: z.string(), createdAt: z.string(),
  url: z.string().nullish(),
});
const commentsResponse = z.object({
  comments: z.array(publicComment.extend({ parent: publicComment.nullish() })),
  config: z.object({ enabled: z.boolean(), allowUrls: z.boolean(), allowNested: z.boolean(), signUpMessage: z.string().nullable() }),
  pagination: z.object({ page: z.number(), totalPages: z.number(), totalComments: z.number(), nextPage: z.number().nullable(), prevPage: z.number().nullable() }),
});
const website = z.string().trim().max(500).refine((value) => {
  if (!value) return true;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}, "Enter a website starting with https:// or http://.");
export const commentSchema = z.object({
  author: z.string().trim().min(1, "Enter your name.").max(100, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  content: z.string().trim().min(1, "Write a comment first.").max(5000, "Keep your comment under 5,000 characters."),
  url: website,
  allowEmailUsage: z.boolean(),
});
export type CommentValues = z.infer<typeof commentSchema>;
export type CommentsData = z.infer<typeof commentsResponse>;
export type WispComment = CommentsData["comments"][number];

export function commentPayload(values: CommentValues, slug: string, config: CommentsData["config"], parentId?: string) {
  if (!config.enabled) throw new Error("Comments are closed for this post.");
  const parsed = commentSchema.parse(values);
  return {
    ...parsed, slug,
    url: config.allowUrls && parsed.url ? parsed.url : undefined,
    allowEmailUsage: Boolean(config.signUpMessage) && parsed.allowEmailUsage,
    parentId: config.allowNested ? parentId : undefined,
  };
}

export async function fetchComments(slug: string, page: number, signal?: AbortSignal): Promise<CommentsData> {
  const response = await fetch(`${API}/posts/${encodeURIComponent(slug)}/comments?page=${page}&limit=10`, { signal: signal ?? AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error("Couldn't load comments. Please try again.");
  return commentsResponse.parse(await response.json());
}

export async function submitComment(values: CommentValues, slug: string, config: CommentsData["config"], parentId?: string) {
  const response = await fetch(`${API}/comments`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(commentPayload(values, slug, config, parentId)),
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 429) throw new Error("Too many attempts. Please wait a little before trying again.");
  if (!response.ok) throw new Error("Couldn't send your comment. Please try again shortly.");
  const result = z.object({ success: z.boolean() }).parse(await response.json());
  if (!result.success) throw new Error("Couldn't send your comment. Please try again shortly.");
  return result;
}

export function safeWebsite(url?: string | null) {
  if (!url || !website.safeParse(url).success) return undefined;
  return url;
}
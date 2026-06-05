import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useActorContext } from "../contexts/ActorContext";
import type { BlogComment } from "../types/local";
import { useActor } from "./useActor";

const BLOG_COMMENT_QUERY_KEY = "blogComments";

// ============================================================
// PUBLIC QUERIES
// ============================================================

export function useGetApprovedCommentsByPostId(postId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<BlogComment[]>({
    queryKey: [BLOG_COMMENT_QUERY_KEY, "approved", postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getApprovedCommentsByPostId(postId);
      return (result as Record<string, unknown>[]).map((raw) => ({
        id: BigInt(raw.id as bigint),
        postId: BigInt(raw.postId as bigint),
        parentId:
          Array.isArray(raw.parentId) && (raw.parentId as unknown[]).length > 0
            ? BigInt((raw.parentId as unknown[])[0] as bigint)
            : null,
        name: raw.name as string,
        email: raw.email as string,
        content: raw.content as string,
        approved: raw.approved as boolean,
        createdAt: BigInt(raw.createdAt as bigint),
        replies: [],
      }));
    },
    enabled: !!actor && !isFetching && postId !== null,
    staleTime: 30_000,
    retry: 2,
  });
}

export interface AddBlogCommentInput {
  postId: bigint;
  parentId: bigint | null;
  name: string;
  email: string;
  content: string;
}

export function useAddBlogComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddBlogCommentInput) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).addBlogComment(
        params.postId,
        params.parentId !== null ? [params.parentId] : [],
        params.name,
        params.email,
        params.content,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BLOG_COMMENT_QUERY_KEY] });
    },
  });
}

// ============================================================
// ADMIN QUERIES
// ============================================================

export function useGetAllBlogComments() {
  const { actor, actorFetching, isBootstrapped } = useActorContext();

  return useQuery<BlogComment[]>({
    queryKey: [BLOG_COMMENT_QUERY_KEY, "all"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (await (actor as any).getAllBlogComments()) as BlogComment[];
    },
    enabled: !!actor && !actorFetching && isBootstrapped,
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 30_000,
  });
}

// ============================================================
// ADMIN MUTATIONS
// ============================================================

export function useApproveBlogComment() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).approveBlogComment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BLOG_COMMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
    },
  });
}

export function useDeleteBlogComment() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).deleteBlogComment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BLOG_COMMENT_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
    },
  });
}

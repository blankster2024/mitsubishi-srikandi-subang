import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useActorContext } from "../contexts/ActorContext";
import type { BlogPost } from "../types/local";
import { useActor } from "./useActor";

const BLOG_QUERY_KEY = "blogPosts";

// ============================================================
// PUBLIC QUERIES
// ============================================================

export function useGetPublishedBlogPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost[]>({
    queryKey: [BLOG_QUERY_KEY, "published"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getPublishedBlogPosts();
      return result as BlogPost[];
    },
    enabled: !!actor && !isFetching,
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 60_000,
  });
}

export function useGetBlogPostBySlug(slug: string) {
  const { actor } = useActor();
  const cleanSlug = slug?.trim() ?? "";

  return useQuery<BlogPost | null>({
    queryKey: [BLOG_QUERY_KEY, "slug", cleanSlug],
    queryFn: async () => {
      if (!actor || !cleanSlug) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getBlogPostBySlug(cleanSlug);
      return Array.isArray(result) && result.length > 0
        ? (result[0] as BlogPost)
        : null;
    },
    enabled: !!actor && !!cleanSlug,
    initialData: undefined,
    retry: 2,
    staleTime: 60_000,
  });
}

export function useGetBlogPostsByCategory(category: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost[]>({
    queryKey: [BLOG_QUERY_KEY, "category", category],
    queryFn: async () => {
      if (!actor || !category) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getBlogPostsByCategory(category);
      return result as BlogPost[];
    },
    enabled: !!actor && !isFetching && !!category,
    retry: 2,
    staleTime: 60_000,
  });
}
// ============================================================
// ADMIN QUERIES
// ============================================================

export function useGetAllBlogPosts() {
  const { actor, actorFetching, isBootstrapped } = useActorContext();

  return useQuery<BlogPost[]>({
    queryKey: [BLOG_QUERY_KEY, "all"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (await (actor as any).getAllBlogPosts()) as BlogPost[];
    },
    enabled: !!actor && !actorFetching && isBootstrapped,
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 30_000,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export interface AddBlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageId: string;
  category: string;
  tags: string[];
  author: string;
  authorTitle: string;
  authorAvatarId: string;
  published: boolean;
}

export function useAddBlogPost() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddBlogPostInput) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).addBlogPost(
        params.title,
        params.slug,
        params.excerpt,
        params.content,
        params.coverImageId,
        params.category,
        params.tags,
        params.author,
        params.authorTitle,
        params.authorAvatarId,
        params.published,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BLOG_QUERY_KEY] });
    },
  });
}

export interface UpdateBlogPostInput extends AddBlogPostInput {
  id: bigint;
}

export function useUpdateBlogPost() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateBlogPostInput) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).updateBlogPost(
        params.id,
        params.title,
        params.slug,
        params.excerpt,
        params.content,
        params.coverImageId,
        params.category,
        params.tags,
        params.author,
        params.authorTitle,
        params.authorAvatarId,
        params.published,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BLOG_QUERY_KEY] });
    },
  });
}

export function useDeleteBlogPost() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).deleteBlogPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BLOG_QUERY_KEY] });
    },
  });
}

export function useLikeBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).likeBlogPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BLOG_QUERY_KEY] });
    },
  });
}

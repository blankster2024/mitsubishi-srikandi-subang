import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useActorContext } from "../contexts/ActorContext";
import type { Promotion } from "../types/local";
import { useActor } from "./useActor";

const PROMO_QUERY_KEY = "promos";

// ============================================================
// PUBLIC QUERIES
// ============================================================

export function useGetPublishedPromos() {
  const { actor, isFetching } = useActor();

  return useQuery<Promotion[]>({
    queryKey: [PROMO_QUERY_KEY, "published"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getPublishedPromos();
      return result as Promotion[];
    },
    enabled: !!actor && !isFetching,
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 60_000,
  });
}

export function useGetPromoBySlug(slug: string) {
  const { actor } = useActor();

  return useQuery<Promotion | null>({
    queryKey: [PROMO_QUERY_KEY, "slug", slug],
    queryFn: async () => {
      if (!actor || !slug) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getPromoBySlug(slug);
      return Array.isArray(result) && result.length > 0
        ? (result[0] as Promotion)
        : null;
    },
    enabled: !!actor && !!slug,
    retry: 2,
    staleTime: 60_000,
  });
}

export function useGetPromoById(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Promotion | null>({
    queryKey: [PROMO_QUERY_KEY, "id", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getPromoById(id);
      return Array.isArray(result) && result.length > 0
        ? (result[0] as Promotion)
        : null;
    },
    enabled: !!actor && !isFetching && id !== null,
    retry: 2,
    staleTime: 60_000,
  });
}

// ============================================================
// ADMIN QUERIES
// ============================================================

export function useGetAllPromos() {
  const { actor, actorFetching, isBootstrapped } = useActorContext();

  return useQuery<Promotion[]>({
    queryKey: [PROMO_QUERY_KEY, "all"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (await (actor as any).getAllPromos()) as Promotion[];
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

export interface AddPromoInput {
  title: string;
  slug: string;
  description: string;
  imageId: string | null;
  vehicleRef: string | null;
  vehicleRefType: string | null;
  startDate: bigint;
  endDate: bigint;
  termsAndConditions: string;
  tags: string[];
  active: boolean;
}

export function useAddPromo() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddPromoInput) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).addPromo(
        params.title,
        params.slug,
        params.description,
        params.imageId && params.imageId !== "" ? [params.imageId] : [],
        params.vehicleRef && params.vehicleRef !== ""
          ? [params.vehicleRef]
          : [],
        params.vehicleRefType && params.vehicleRefType !== ""
          ? [params.vehicleRefType]
          : [],
        params.startDate,
        params.endDate,
        params.termsAndConditions,
        params.tags,
        params.active,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMO_QUERY_KEY] });
    },
    onError: (err) => {
      console.error("[useAddPromo] mutation error:", err);
    },
  });
}

export interface UpdatePromoInput extends AddPromoInput {
  id: bigint;
}

export function useUpdatePromo() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdatePromoInput) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).updatePromo(
        params.id,
        params.title,
        params.slug,
        params.description,
        params.imageId && params.imageId !== "" ? [params.imageId] : [],
        params.vehicleRef && params.vehicleRef !== ""
          ? [params.vehicleRef]
          : [],
        params.vehicleRefType && params.vehicleRefType !== ""
          ? [params.vehicleRefType]
          : [],
        params.startDate,
        params.endDate,
        params.termsAndConditions,
        params.tags,
        params.active,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMO_QUERY_KEY] });
    },
    onError: (err) => {
      console.error("[useUpdatePromo] mutation error:", err);
    },
  });
}

export function useDeletePromo() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).deletePromo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMO_QUERY_KEY] });
    },
  });
}

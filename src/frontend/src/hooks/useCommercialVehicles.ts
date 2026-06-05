import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useActorContext } from "../contexts/ActorContext";
import type { CommercialSpecItem, CommercialVehicle } from "../types/local";
import { useActor } from "./useActor";

// ============================================================
// HELPER — map raw backend result to CommercialVehicle
// ============================================================

function mapToCommercialVehicle(
  raw: Record<string, unknown>,
): CommercialVehicle {
  const rawSpecs = raw.specifications as Array<{ key: string; value: string }>;
  const rawImages = raw.mainImages as unknown[];
  return {
    id: raw.id as string,
    name: raw.name as string,
    slug: raw.slug as string,
    category: raw.category as string,
    subCategory: raw.subCategory as string,
    description: raw.description as string,
    chassisPrice: Number(raw.chassisPrice),
    heroImage: raw.heroImage as string,
    heroTitle: raw.heroTitle as string,
    heroSubtext: raw.heroSubtext as string,
    mainImages: Array.from(rawImages as string[]),
    chassisImage: raw.chassisImage as string,
    cabinImage: raw.cabinImage as string,
    brochureUrl: raw.brochureUrl as string,
    footnote: raw.footnote as string,
    specifications: rawSpecs.map((s) => ({ key: s.key, value: s.value })),
    displayOrder: Number(raw.displayOrder),
    isPublished: raw.isPublished as boolean,
    createdAt: Number(raw.createdAt),
    updatedAt: Number(raw.updatedAt),
  };
}

// ============================================================
// INPUT TYPES
// ============================================================

export interface AddCommercialVehicleInput {
  name: string;
  slug: string;
  category: string;
  subCategory: string;
  description: string;
  chassisPrice: number;
  heroImage: string;
  heroTitle: string;
  heroSubtext: string;
  mainImages: string[];
  chassisImage: string;
  cabinImage: string;
  brochureUrl: string;
  footnote: string;
  specifications: CommercialSpecItem[];
  isPublished: boolean;
}

export interface UpdateCommercialVehicleInput
  extends AddCommercialVehicleInput {
  id: string;
}

// ============================================================
// PUBLIC QUERIES — use useActor directly (no admin bootstrap needed)
// ============================================================

/** Public: returns all published commercial vehicles */
export function useGetPublishedCommercialVehicles() {
  const { actor, isFetching } = useActor();

  return useQuery<CommercialVehicle[]>({
    queryKey: ["publishedCommercialVehicles"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getPublishedCommercialVehicles();
      return (result as Record<string, unknown>[]).map(mapToCommercialVehicle);
    },
    enabled: !!actor && !isFetching,
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 60_000,
  });
}

/** Public: returns published commercial vehicles filtered by category */
export function useGetCommercialVehiclesByCategory(category: string) {
  const { actor, isFetching } = useActor();

  return useQuery<CommercialVehicle[]>({
    queryKey: ["commercialVehiclesByCategory", category],
    queryFn: async () => {
      if (!actor || !category) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getCommercialVehiclesByCategory(
        category,
      );
      return (result as Record<string, unknown>[]).map(mapToCommercialVehicle);
    },
    enabled: !!actor && !isFetching && !!category,
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 60_000,
  });
}

/** Public: returns a single commercial vehicle by category slug + vehicle slug */
export function useGetCommercialVehicleBySlug(
  categorySlug: string,
  vehicleSlug: string,
) {
  const { actor, isFetching } = useActor();

  return useQuery<CommercialVehicle | null>({
    queryKey: ["commercialVehicleBySlug", categorySlug, vehicleSlug],
    queryFn: async () => {
      if (!actor || !categorySlug || !vehicleSlug) return null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (actor as any).getCommercialVehicleBySlug(
          categorySlug,
          vehicleSlug,
        );
        return Array.isArray(result) && result.length > 0
          ? mapToCommercialVehicle(result[0] as Record<string, unknown>)
          : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!categorySlug && !!vehicleSlug,
    retry: 2,
    staleTime: 60_000,
  });
}

/** Public: returns the count of published commercial vehicles in a category */
export function useGetCommercialVehicleCountByCategory(category: string) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ["commercialVehicleCount", category],
    queryFn: async () => {
      if (!actor || !category) return 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getCommercialVehicleCountByCategory(
        category,
      );
      return Number(result);
    },
    enabled: !!actor && !isFetching && !!category,
    retry: 2,
    staleTime: 60_000,
  });
}

// ============================================================
// ADMIN QUERIES — use useActorContext (requires admin bootstrap)
// ============================================================

/** Admin-only: returns all commercial vehicles including unpublished */
export function useGetAllCommercialVehicles() {
  const { actor, actorFetching, isBootstrapped } = useActorContext();

  return useQuery<CommercialVehicle[]>({
    queryKey: ["commercialVehicles"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getAllCommercialVehicles();
      return (result as Record<string, unknown>[]).map(mapToCommercialVehicle);
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

/** Admin: add a new commercial vehicle */
export function useAddCommercialVehicle() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddCommercialVehicleInput) => {
      if (!actor) throw new Error("Actor belum siap");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).addCommercialVehicle(
        input.name,
        input.slug,
        input.category,
        input.subCategory,
        input.description,
        BigInt(input.chassisPrice),
        input.heroImage,
        input.heroTitle,
        input.heroSubtext,
        input.mainImages,
        input.chassisImage,
        input.cabinImage,
        input.brochureUrl,
        input.footnote,
        input.specifications,
        input.isPublished,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["commercialVehicles"] });
      queryClient.invalidateQueries({
        queryKey: ["publishedCommercialVehicles"],
      });
    },
  });
}

/** Admin: update an existing commercial vehicle */
export function useUpdateCommercialVehicle() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCommercialVehicleInput) => {
      if (!actor) throw new Error("Actor belum siap");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).updateCommercialVehicle(
        input.id,
        input.name,
        input.slug,
        input.category,
        input.subCategory,
        input.description,
        BigInt(input.chassisPrice),
        input.heroImage,
        input.heroTitle,
        input.heroSubtext,
        input.mainImages,
        input.chassisImage,
        input.cabinImage,
        input.brochureUrl,
        input.footnote,
        input.specifications,
        input.isPublished,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["commercialVehicles"] });
      queryClient.invalidateQueries({
        queryKey: ["publishedCommercialVehicles"],
      });
      queryClient.invalidateQueries({
        queryKey: ["commercialVehiclesByCategory"],
      });
    },
  });
}

/** Admin: delete a commercial vehicle by id */
export function useDeleteCommercialVehicle() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor belum siap");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).deleteCommercialVehicle(id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["commercialVehicles"] });
      queryClient.invalidateQueries({
        queryKey: ["publishedCommercialVehicles"],
      });
    },
  });
}

/** Admin: reorder commercial vehicles by providing ordered array of Text IDs */
export function useReorderCommercialVehicles() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!actor) throw new Error("Actor belum siap");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).reorderCommercialVehicles(ids);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["commercialVehicles"] });
    },
  });
}

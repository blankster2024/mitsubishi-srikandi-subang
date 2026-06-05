import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useActorContext } from "../contexts/ActorContext";
import type { PassengerVehicle, SpecTab, VehicleVariant } from "../types/local";
import { useActor } from "./useActor";

// ============================================================
// PUBLIC QUERIES — use useActor directly (no admin bootstrap needed)
// ============================================================

/** Public: returns only published passenger vehicles */
export function useGetPublishedVehicles() {
  const { actor, isFetching } = useActor();

  return useQuery<PassengerVehicle[]>({
    queryKey: ["publishedPassengerVehicles"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getPublishedPassengerVehicles();
      return result as unknown as PassengerVehicle[];
    },
    enabled: !!actor && !isFetching,
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 60_000,
  });
}

/** Public: returns a single passenger vehicle by id */
export function useGetPassengerVehicleById(id: bigint | null | undefined) {
  const { actor, isFetching } = useActor();
  const normalizedId = id === undefined ? null : id;

  return useQuery<PassengerVehicle | null>({
    queryKey: ["passengerVehicle", normalizedId?.toString()],
    queryFn: async () => {
      if (!actor || normalizedId === null) return null;
      try {
        const result = await actor.getPassengerVehicleById(normalizedId);
        return Array.isArray(result) && result.length > 0
          ? (result[0] as PassengerVehicle)
          : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && normalizedId !== null,
    retry: 2,
    staleTime: 60_000,
  });
}

// ============================================================
// ADMIN QUERIES — use useActorContext (requires admin bootstrap)
// ============================================================

/** Admin-only: returns all passenger vehicles including unpublished */
export function useGetAllVehicles() {
  const { actor, actorFetching, isBootstrapped } = useActorContext();

  return useQuery<PassengerVehicle[]>({
    queryKey: ["passengerVehicles"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return (await actor.getAllPassengerVehicles()) as unknown as PassengerVehicle[];
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

export interface AddVehicleInput {
  vehicleName: string;
  description: string;
  slug: string;
  heroImageUrl: string;
  brochureUrl: string;
  variants: VehicleVariant[];
  specTabs: SpecTab[];
  footnotes: string[];
  aftersaleImages: string[];
  ctaText: string;
  ctaSubtext: string;
  ctaButtonLabel: string;
  ctaButtonUrl: string;
  vehicleType: string;
  publishStatus: boolean;
  titleImageUrl?: string | null;
  heroBannerVideoId?: string | null;
}

/** Admin: add a new passenger vehicle */
export function useAddVehicle() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddVehicleInput) => {
      if (!actor) throw new Error("Actor belum siap");

      const variantPayload = input.variants.map((v) => ({
        variantName: v.variantName,
        hasPremiumOption: v.hasPremiumOption,
        thumbnailUrl: v.thumbnailUrl,
        price: BigInt(v.price ?? 0),
        colors: v.colors.map((c) => ({
          colorName: c.colorName,
          colorImage: c.colorImage,
          vehicleImage: c.vehicleImage,
          price: BigInt(c.price ?? 0),
        })),
      }));

      const specTabsPayload = input.specTabs.map((t) => ({
        title: t.title,
        columns: t.columns ?? [],
        rows: t.rows.map((r) => ({
          cells: r.cells.map((c) => ({
            value: c.value,
            colSpan: BigInt(c.colSpan ?? 1),
          })),
        })),
      }));

      return await actor.addPassengerVehicle(
        input.vehicleName,
        input.description,
        input.heroImageUrl,
        input.brochureUrl,
        variantPayload,
        specTabsPayload,
        input.publishStatus,
        input.slug,
        input.footnotes,
        input.aftersaleImages,
        input.ctaText,
        input.ctaSubtext,
        input.ctaButtonLabel,
        input.ctaButtonUrl,
        input.vehicleType,
        input.titleImageUrl || null,
        input.heroBannerVideoId || null,
      );
    },
    onError: (error) => {
      console.error(
        "[PassengerVehicle] Full error:",
        JSON.stringify(error, null, 2),
      );
      console.error("[PassengerVehicle] Message:", (error as Error)?.message);
      console.error("[PassengerVehicle] Stack:", (error as Error)?.stack);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["passengerVehicles"] });
    },
  });
}

export interface UpdateVehicleInput extends AddVehicleInput {
  id: bigint;
}

/** Admin: update an existing passenger vehicle */
export function useUpdateVehicle() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateVehicleInput) => {
      if (!actor) throw new Error("Actor belum siap");

      const variantPayload = input.variants.map((v) => ({
        variantName: v.variantName,
        hasPremiumOption: v.hasPremiumOption,
        thumbnailUrl: v.thumbnailUrl,
        price: BigInt(v.price ?? 0),
        colors: v.colors.map((c) => ({
          colorName: c.colorName,
          colorImage: c.colorImage,
          vehicleImage: c.vehicleImage,
          price: BigInt(c.price ?? 0),
        })),
      }));

      const specTabsPayload = input.specTabs.map((t) => ({
        title: t.title,
        columns: t.columns ?? [],
        rows: t.rows.map((r) => ({
          cells: r.cells.map((c) => ({
            value: c.value,
            colSpan: BigInt(c.colSpan ?? 1),
          })),
        })),
      }));

      return await actor.updatePassengerVehicle(
        BigInt(input.id),
        input.vehicleName,
        input.description,
        input.heroImageUrl,
        input.brochureUrl,
        variantPayload,
        specTabsPayload,
        input.publishStatus,
        input.slug,
        input.footnotes,
        input.aftersaleImages,
        input.ctaText,
        input.ctaSubtext,
        input.ctaButtonLabel,
        input.ctaButtonUrl,
        input.vehicleType,
        input.titleImageUrl || null,
        input.heroBannerVideoId || null,
      );
    },
    onError: (error) => {
      console.error(
        "[PassengerVehicle] Full error:",
        JSON.stringify(error, null, 2),
      );
      console.error("[PassengerVehicle] Message:", (error as Error)?.message);
      console.error("[PassengerVehicle] Stack:", (error as Error)?.stack);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["passengerVehicles"] });
      queryClient.invalidateQueries({ queryKey: ["passengerVehicle"] });
    },
  });
}

/** Admin: delete a passenger vehicle by id */
export function useDeleteVehicle() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor belum siap");
      return await actor.deletePassengerVehicle(id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["passengerVehicles"] });
    },
  });
}

/** Admin: toggle publishStatus of a passenger vehicle */
export function useToggleVehiclePublishStatus() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor belum siap");
      return await actor.togglePassengerVehiclePublishStatus(id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["passengerVehicles"] });
      queryClient.invalidateQueries({
        queryKey: ["publishedPassengerVehicles"],
      });
    },
  });
}

/** Admin: reorder passenger vehicles by providing ordered array of IDs */
export function useReorderVehicles() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: bigint[]) => {
      if (!actor) throw new Error("Actor belum siap");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).reorderPassengerVehicles(ids);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["passengerVehicles"] });
      queryClient.invalidateQueries({
        queryKey: ["publishedPassengerVehicles"],
      });
    },
  });
}

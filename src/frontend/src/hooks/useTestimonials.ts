import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useActorContext } from "../contexts/ActorContext";
import type { Testimonial } from "../types/local";
import { useActor } from "./useActor";

const TESTIMONIAL_QUERY_KEY = "testimonials";

// ============================================================
// PUBLIC QUERIES
// ============================================================

export function useGetPublishedTestimonials() {
  const { actor, isFetching } = useActor();

  return useQuery<Testimonial[]>({
    queryKey: [TESTIMONIAL_QUERY_KEY, "published"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).getPublishedTestimonials();
      return result as Testimonial[];
    },
    enabled: !!actor && !isFetching,
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 60_000,
  });
}

// ============================================================
// ADMIN QUERIES
// ============================================================

export function useGetAllTestimonials() {
  const { actor, actorFetching, isBootstrapped } = useActorContext();

  return useQuery<Testimonial[]>({
    queryKey: [TESTIMONIAL_QUERY_KEY, "all"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (await (actor as any).getAllTestimonials()) as Testimonial[];
      } catch (err) {
        console.warn("[useGetAllTestimonials] Failed:", err);
        return [];
      }
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

export interface AddTestimonialInput {
  customerName: string;
  customerPhotoId: string;
  customerCity: string;
  rating: number;
  message: string;
  vehicleRef: string;
  vehicleRefType: string;
  vehicleName: string;
  vehicleUrl: string;
  active: boolean;
}

export function useAddTestimonial() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddTestimonialInput) => {
      if (!actor) throw new Error("Actor not ready");
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (actor as any).addTestimonial(
          params.customerName,
          params.customerPhotoId,
          params.customerCity,
          BigInt(params.rating),
          params.message,
          params.vehicleRef,
          params.vehicleRefType,
          params.vehicleName,
          params.vehicleUrl,
          params.active,
        );
      } catch (err) {
        console.error("[useAddTestimonial] mutationFn error:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TESTIMONIAL_QUERY_KEY] });
    },
    onError: (err) => {
      console.error("[useAddTestimonial] mutation error:", err);
    },
  });
}

export interface UpdateTestimonialInput extends AddTestimonialInput {
  id: bigint;
}

export function useUpdateTestimonial() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateTestimonialInput) => {
      if (!actor) throw new Error("Actor not ready");
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (actor as any).updateTestimonial(
          params.id,
          params.customerName,
          params.customerPhotoId,
          params.customerCity,
          BigInt(params.rating),
          params.message,
          params.vehicleRef,
          params.vehicleRefType,
          params.vehicleName,
          params.vehicleUrl,
          params.active,
        );
      } catch (err) {
        console.error("[useUpdateTestimonial] mutationFn error:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TESTIMONIAL_QUERY_KEY] });
    },
    onError: (err) => {
      console.error("[useUpdateTestimonial] mutation error:", err);
    },
  });
}

export function useDeleteTestimonial() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).deleteTestimonial(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TESTIMONIAL_QUERY_KEY] });
    },
  });
}

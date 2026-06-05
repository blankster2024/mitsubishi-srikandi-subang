import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetProductLikeCount(vehicleId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["productLikeCount", vehicleId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      // Backend method missing - return 0
      return BigInt(0);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductShareCount(vehicleId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["productShareCount", vehicleId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      // Backend method missing - return 0
      return BigInt(0);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLikeProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_vehicleId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      // Backend method missing - stub
      console.warn("likeProduct not implemented in backend");
    },
    onSuccess: (_, vehicleId) => {
      queryClient.invalidateQueries({
        queryKey: ["productLikeCount", vehicleId.toString()],
      });
    },
  });
}

export function useShareProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_vehicleId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      // Backend method missing - stub
      console.warn("shareProduct not implemented in backend");
    },
    onSuccess: (_, vehicleId) => {
      queryClient.invalidateQueries({
        queryKey: ["productShareCount", vehicleId.toString()],
      });
    },
  });
}

// Combined hook for backward compatibility
export function useProductInteractions(vehicleId: bigint) {
  const { data: likeCount } = useGetProductLikeCount(vehicleId);
  const { data: shareCount } = useGetProductShareCount(vehicleId);
  const likeMutation = useLikeProduct();
  const shareMutation = useShareProduct();

  return {
    likeCount: likeCount || BigInt(0),
    shareCount: shareCount || BigInt(0),
    likeProduct: () => likeMutation.mutate(vehicleId),
    shareProduct: () => shareMutation.mutate(vehicleId),
  };
}

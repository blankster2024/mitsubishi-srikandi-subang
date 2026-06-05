import { useQuery } from "@tanstack/react-query";
import type { VehicleCatalog } from "../types/local";
import { useActor } from "./useActor";

export function useGetAllVehicleCatalogs() {
  const { actor, isFetching } = useActor();

  return useQuery<VehicleCatalog[]>({
    queryKey: ["vehicleCatalogs"],
    queryFn: async () => {
      if (!actor) return [] as VehicleCatalog[];
      try {
        // Backend method missing - return empty array
        return [] as VehicleCatalog[];
      } catch (err) {
        console.warn("[useGetAllVehicleCatalogs] Failed:", err);
        return [] as VehicleCatalog[];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVehicleWithCatalog(vehicleId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<VehicleCatalog | null>({
    queryKey: ["vehicleWithCatalog", vehicleId?.toString()],
    queryFn: async () => {
      if (!actor || !vehicleId) return null;
      // Backend method missing - return null
      return null;
    },
    enabled: !!actor && !isFetching && vehicleId !== null,
  });
}

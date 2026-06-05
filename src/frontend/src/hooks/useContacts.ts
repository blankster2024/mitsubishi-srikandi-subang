import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ContactSubmission } from "../types/local";
import { protectedCall } from "../utils/apiClient";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetAllContacts() {
  const { actor, isFetching } = useActor();

  return useQuery<ContactSubmission[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!actor) return [];
      // Stubbed: backend doesn't have getAllContacts yet
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

// Backward compatibility alias
export const useGetAllContactSubmissions = useGetAllContacts;

export function useDeleteContact() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_id: number) => {
      if (!actor) throw new Error("Actor not initialized");
      const principalId = identity?.getPrincipal().toString();
      return protectedCall(principalId, async () => {
        throw new Error("deleteContact not yet implemented in backend");
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

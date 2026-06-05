import { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminRecord, UserRole } from "../backend";
import { protectedCall } from "../utils/apiClient";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetAllAdminUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminRecord[]>({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAdmins();
      } catch (err) {
        console.warn("[useGetAllAdminUsers] Failed to fetch:", err);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAdminUser() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      principal,
      role,
    }: {
      principal: Principal;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      const callerPrincipalId = identity?.getPrincipal().toString();
      // Use updateAdminRole to set the role for a principal.
      // Note: addAdmin does not exist on the backend; this relies on
      // the backend's bootstrap/recovery logic to register the principal
      // and then sets their role via updateAdminRole.
      return protectedCall(callerPrincipalId, () =>
        actor.updateAdminRole(principal, role),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
}

export function useUpdateAdminUser() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      principal,
      role,
    }: {
      principal: Principal;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      const callerPrincipalId = identity?.getPrincipal().toString();
      return protectedCall(callerPrincipalId, () =>
        actor.updateAdminRole(principal, role),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
}

export function useDeleteAdminUser() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalId: string) => {
      if (!actor) throw new Error("Actor not initialized");
      const callerPrincipalId = identity?.getPrincipal().toString();
      const targetPrincipal = Principal.fromText(principalId);
      return protectedCall(callerPrincipalId, () =>
        actor.deleteAdmin(targetPrincipal),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
}

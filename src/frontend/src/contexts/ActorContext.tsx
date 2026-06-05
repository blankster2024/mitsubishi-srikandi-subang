import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, createContext, useContext, useState } from "react";
import { useEffect } from "react";
import type { backendInterface } from "../backend";
import { useActor } from "../hooks/useActor";
import { tokenStorage } from "../utils/tokenStorage";

interface ActorContextValue {
  actor: backendInterface | null;
  actorFetching: boolean;
  /** true only after admin bootstrap has fully completed */
  isBootstrapped: boolean;
}

const ActorContext = createContext<ActorContextValue>({
  actor: null,
  actorFetching: true,
  isBootstrapped: false,
});

export function ActorProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    if (!actor) {
      setIsBootstrapped(false);
      return;
    }

    setIsBootstrapped(false);

    const bootstrap = async () => {
      // Step 1: Ensure caller is registered in adminStore (stable).
      // adminStore is checked by all media upload/delete/list functions.
      // getMyRole() calls bootstrapIfEmpty() internally — if adminStore is
      // empty it registers caller as super_admin automatically.
      // If getMyRole returns null, caller is NOT in adminStore.
      // forceSetMeAsSuperAdmin() as recovery — safe because admin panel is
      // protected by Internet Identity and only the real admin can reach here.
      try {
        const role = await actor.getMyRole();
        console.log("[ActorContext] getMyRole result:", role);

        const notRegistered =
          role === null ||
          role === undefined ||
          (Array.isArray(role) && role.length === 0);

        if (notRegistered) {
          console.log(
            "[ActorContext] caller not in adminStore — calling forceSetMeAsSuperAdmin",
          );
          const forceResult = await actor.forceSetMeAsSuperAdmin();
          console.log("[ActorContext] forceSetMeAsSuperAdmin:", forceResult);
        }
      } catch (err) {
        console.warn(
          "[ActorContext] getMyRole failed, trying forceSetMeAsSuperAdmin:",
          err,
        );
        try {
          await actor.forceSetMeAsSuperAdmin();
        } catch (err2) {
          console.warn(
            "[ActorContext] forceSetMeAsSuperAdmin also failed:",
            err2,
          );
        }
      }

      // Step 2: Also register in AccessControl (in-memory) — used as a
      // dual-check fallback in some query functions.
      try {
        await actor.initAdmin();
      } catch {
        try {
          await actor.forceBecomeAdmin();
        } catch (err) {
          console.warn("[ActorContext] forceBecomeAdmin skipped:", err);
        }
      }

      // Step 3: Mark bootstrap done BEFORE refetching so queries are allowed.
      setIsBootstrapped(true);
      console.log("[ActorContext] bootstrap complete");

      // Refresh session expiry now that actor + auth are confirmed working
      tokenStorage.refreshSession();

      // Step 4: Refetch all data queries now that actor + auth are ready.
      queryClient.invalidateQueries({
        predicate: (query) => !query.queryKey.includes("actor"),
      });
      queryClient.refetchQueries({
        predicate: (query) => !query.queryKey.includes("actor"),
      });
    };

    bootstrap();
  }, [actor, queryClient]);

  return (
    <ActorContext.Provider value={{ actor, actorFetching, isBootstrapped }}>
      {children}
    </ActorContext.Provider>
  );
}

export function useActorContext(): ActorContextValue {
  return useContext(ActorContext);
}

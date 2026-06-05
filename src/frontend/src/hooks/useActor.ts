import { useActor as useActorBase } from "@caffeineai/core-infrastructure";
import { type backendInterface, createActor } from "../backend";

/**
 * Re-exports useActor pre-wired with the project's createActor function.
 * All hooks and components can call useActor() without arguments.
 */
export function useActor() {
  return useActorBase<backendInterface>(createActor);
}

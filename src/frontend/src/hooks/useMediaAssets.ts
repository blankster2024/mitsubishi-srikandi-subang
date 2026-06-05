import { loadConfig } from "@caffeineai/core-infrastructure";
import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { MediaAsset } from "../backend";
import { useActorContext } from "../contexts/ActorContext";

export function useGetAllMediaAssets() {
  const { actor, actorFetching, isBootstrapped } = useActorContext();

  return useQuery<MediaAsset[]>({
    queryKey: ["mediaAssets"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return await actor.getAllMediaAssets();
    },
    // Only run after bootstrap — prevents Unauthorized race condition
    enabled: !!actor && !actorFetching && isBootstrapped,
    placeholderData: keepPreviousData,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useGetMediaAssetById(id: bigint | null | undefined) {
  const { actor, actorFetching, isBootstrapped } = useActorContext();
  const normalizedId = id === undefined ? null : id;

  return useQuery<MediaAsset | null>({
    queryKey: ["mediaAsset", normalizedId?.toString()],
    queryFn: async () => {
      if (!actor || normalizedId === null) return null;
      try {
        return await actor.getMediaAssetById(normalizedId);
      } catch {
        return null;
      }
    },
    enabled:
      !!actor && !actorFetching && isBootstrapped && normalizedId !== null,
  });
}

export function useUploadMediaAsset() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      filename,
      mimeType,
      data,
      fileSize,
      onProgress,
    }: {
      filename: string;
      mimeType: string;
      data: Uint8Array;
      fileSize: bigint;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Actor belum siap");
      onProgress?.(10);
      // Step 1: Upload file bytes to Caffeine CDN and get back the storage URL
      const config = await loadConfig();
      const agent = HttpAgent.createSync({ host: config.backend_host });
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const { hash } = await storageClient.putFile(data, (pct) => {
        onProgress?.(10 + Math.floor(pct * 0.8));
      });
      const storageUrl = await storageClient.getDirectURL(hash);
      onProgress?.(90);
      // Step 2: Store only the URL reference in the backend
      await actor.uploadMediaAsset(filename, mimeType, storageUrl, fileSize);
      onProgress?.(100);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaAssets"] });
    },
  });
}

export function useDeleteMediaAsset() {
  const { actor } = useActorContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor belum siap");
      return actor.deleteMediaAsset(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaAssets"] });
    },
  });
}

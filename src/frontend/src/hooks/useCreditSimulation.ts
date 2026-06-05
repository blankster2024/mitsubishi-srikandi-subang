import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreditRequirementTab,
  CreditSettings,
  Lead,
} from "../types/local";
import { useActor } from "./useActor";

// ============================================================
// HELPERS
// ============================================================

function mapCreditSettings(raw: Record<string, unknown>): CreditSettings {
  return {
    adminFee: Number(raw.adminFee),
    interestRatePerYear: Number(raw.interestRatePerYear),
    insurancePercent: Number(raw.insurancePercent),
    provisionPercent: Number(raw.provisionPercent),
    footnote: raw.footnote as string,
    updatedAt: Number(raw.updatedAt),
  };
}

function mapCreditRequirementTab(
  raw: Record<string, unknown>,
): CreditRequirementTab {
  const reqs = raw.requirements as Array<{ item: string }>;
  return {
    id: raw.id as string,
    tabName: raw.tabName as string,
    requirements: reqs.map((r) => ({ item: r.item })),
    order: Number(raw.order),
  };
}

function mapLead(raw: Record<string, unknown>): Lead {
  return {
    id: raw.id as string,
    name: raw.name as string,
    address: raw.address as string,
    email: raw.email as string,
    phone: raw.phone as string,
    vehicleType: raw.vehicleType as string,
    otr: Number(raw.otr),
    dp: Number(raw.dp),
    tenor: Number(raw.tenor),
    monthlyInstallment: Number(raw.monthlyInstallment),
    source: raw.source as string,
    createdAt: Number(raw.createdAt),
  };
}

function unwrapResult<T>(result: unknown): T {
  const r = result as { ok?: T; err?: string };
  if ("err" in (r as object) && r.err !== undefined) {
    throw new Error(String(r.err));
  }
  return (r as { ok: T }).ok;
}

// ============================================================
// PUBLIC QUERIES
// ============================================================

export function useGetCreditSettings() {
  const { actor } = useActor();
  return useQuery<CreditSettings>({
    queryKey: ["creditSettings"],
    queryFn: async () => {
      if (!actor) throw new Error("actor not ready");
      const result = await (actor as any).getCreditSettings();
      return mapCreditSettings(result as Record<string, unknown>);
    },
    enabled: !!actor,
    staleTime: 60_000,
  });
}

export function useGetAllCreditRequirementTabs() {
  const { actor } = useActor();
  return useQuery<CreditRequirementTab[]>({
    queryKey: ["creditRequirementTabs"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getAllCreditRequirementTabs();
      return (result as Record<string, unknown>[]).map(mapCreditRequirementTab);
    },
    enabled: !!actor,
    staleTime: 60_000,
  });
}

export function useGetAllLeads() {
  const { actor } = useActor();
  return useQuery<Lead[]>({
    queryKey: ["allLeads"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getAllLeads();
      const leads = unwrapResult<Record<string, unknown>[]>(result);
      return leads.map(mapLead);
    },
    enabled: !!actor,
    staleTime: 30_000,
  });
}

// ============================================================
// ADMIN MUTATIONS
// ============================================================

export function useUpdateCreditSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminFee: number;
      interestRatePerYear: number;
      insurancePercent: number;
      provisionPercent: number;
      footnote: string;
    }) => {
      if (!actor) throw new Error("actor not ready");
      const result = await (actor as any).updateCreditSettings(
        BigInt(params.adminFee),
        params.interestRatePerYear,
        params.insurancePercent,
        params.provisionPercent,
        params.footnote,
      );
      return unwrapResult<CreditSettings>(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditSettings"] });
    },
  });
}

export function useAddCreditRequirementTab() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      tabName: string;
      requirements: { item: string }[];
      order: number;
    }) => {
      if (!actor) throw new Error("actor not ready");
      const result = await (actor as any).addCreditRequirementTab(
        params.tabName,
        params.requirements,
        BigInt(params.order),
      );
      return unwrapResult<CreditRequirementTab>(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditRequirementTabs"] });
    },
  });
}

export function useUpdateCreditRequirementTab() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      tabName: string;
      requirements: { item: string }[];
      order: number;
    }) => {
      if (!actor) throw new Error("actor not ready");
      const result = await (actor as any).updateCreditRequirementTab(
        params.id,
        params.tabName,
        params.requirements,
        BigInt(params.order),
      );
      return unwrapResult<CreditRequirementTab>(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditRequirementTabs"] });
    },
  });
}

export function useDeleteCreditRequirementTab() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("actor not ready");
      const result = await (actor as any).deleteCreditRequirementTab(id);
      return unwrapResult<boolean>(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditRequirementTabs"] });
    },
  });
}

// ============================================================
// PUBLIC MUTATIONS
// ============================================================

export function useAddLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      address: string;
      email: string;
      phone: string;
      vehicleType: string;
      otr: number;
      dp: number;
      tenor: number;
      monthlyInstallment: number;
      source: string;
      createdAt: number;
    }) => {
      if (!actor) throw new Error("actor not ready");
      const result = await (actor as any).addLead(
        params.name,
        params.address,
        params.email,
        params.phone,
        params.vehicleType,
        BigInt(params.otr),
        BigInt(params.dp),
        BigInt(params.tenor),
        BigInt(params.monthlyInstallment),
        params.source,
        BigInt(params.createdAt),
      );
      return unwrapResult<Lead>(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allLeads"] });
    },
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("actor not ready");
      const result = await (actor as any).deleteLead(id);
      return unwrapResult<boolean>(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allLeads"] });
    },
  });
}

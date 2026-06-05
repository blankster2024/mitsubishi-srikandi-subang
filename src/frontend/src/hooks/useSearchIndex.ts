import type {
  BlogPost,
  CommercialVehicle,
  PassengerVehicle,
  Promotion,
} from "@/types/local";
import { useCallback, useMemo } from "react";

export interface SearchIndexEntry {
  id: number;
  entryType: "vehicle" | "promo" | "article";
  title: string;
  keywords: string;
  summary: string;
  url: string;
  image: string;
  category: string;
  updatedAt: number;
}

export interface SearchResults {
  vehicles: SearchIndexEntry[];
  promos: SearchIndexEntry[];
  articles: SearchIndexEntry[];
}

let _idCounter = 0;
function nextId() {
  return ++_idCounter;
}

export function buildSearchIndex(
  vehicles: PassengerVehicle[] = [],
  commercialVehicles: CommercialVehicle[] = [],
  promos: Promotion[] = [],
  articles: BlogPost[] = [],
): SearchIndexEntry[] {
  _idCounter = 0;
  const entries: SearchIndexEntry[] = [];

  // Passenger vehicles
  for (const v of vehicles) {
    entries.push({
      id: nextId(),
      entryType: "vehicle",
      title: v.vehicleName,
      keywords:
        `${v.vehicleName} ${v.vehicleType ?? ""} ${v.description ?? ""}`.toLowerCase(),
      summary: v.description ?? "",
      url: `/mobil-keluarga/${v.slug}`,
      image: v.heroImageUrl ?? "",
      category: "Mobil Keluarga",
      updatedAt: Number(v.updatedAt ?? 0),
    });
  }

  // Commercial vehicles
  for (const v of commercialVehicles) {
    entries.push({
      id: nextId(),
      entryType: "vehicle",
      title: v.name,
      keywords:
        `${v.name} ${v.category} ${v.subCategory ?? ""} ${v.description ?? ""}`.toLowerCase(),
      summary: v.description ?? "",
      url: `/mobil-niaga/${v.category}/${v.slug}`,
      image: v.mainImages?.[0] ?? v.heroImage ?? "",
      category: `Mobil Niaga - ${v.category}`,
      updatedAt: v.updatedAt ?? 0,
    });
  }

  // Promos
  for (const p of promos) {
    entries.push({
      id: nextId(),
      entryType: "promo",
      title: p.title,
      keywords:
        `${p.title} promo diskon dp ${p.description ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase(),
      summary: p.description ?? "",
      url: `/promo/${p.slug}`,
      image: "",
      category: "Promo",
      updatedAt: Number(p.updatedAt ?? 0),
    });
  }

  // Articles
  for (const a of articles) {
    entries.push({
      id: nextId(),
      entryType: "article",
      title: a.title,
      keywords:
        `${a.title} ${a.excerpt ?? ""} ${a.category ?? ""} ${(a.tags ?? []).join(" ")}`.toLowerCase(),
      summary: a.excerpt ?? "",
      url: `/blog/${a.slug}`,
      image: "",
      category: "Artikel",
      updatedAt: Number(a.updatedAt ?? 0),
    });
  }

  return entries;
}

function scoreEntry(
  entry: SearchIndexEntry,
  query: string,
  intentBoostVehicle: boolean,
  intentBoostPromo: boolean,
  intentBoostArticle: boolean,
): number {
  const q = query.toLowerCase();
  const title = entry.title.toLowerCase();
  const keywords = entry.keywords.toLowerCase();
  const summary = entry.summary.toLowerCase();
  const category = entry.category.toLowerCase();

  let score = 0;

  if (title === q) score += 100;
  else if (title.startsWith(q)) score += 50;
  else if (title.includes(q)) score += 30;

  if (keywords.includes(q)) score += 20;
  if (category.includes(q)) score += 10;
  if (summary.includes(q)) score += 5;

  if (intentBoostVehicle && entry.entryType === "vehicle") score *= 2;
  if (intentBoostPromo && entry.entryType === "promo") score *= 2;
  if (intentBoostArticle && entry.entryType === "article") score *= 2;

  return score;
}

export function useSearchIndex(
  vehicles: PassengerVehicle[] = [],
  commercialVehicles: CommercialVehicle[] = [],
  promos: Promotion[] = [],
  articles: BlogPost[] = [],
) {
  const index = useMemo(
    () => buildSearchIndex(vehicles, commercialVehicles, promos, articles),
    [vehicles, commercialVehicles, promos, articles],
  );

  const search = useCallback(
    (query: string): SearchResults => {
      const empty: SearchResults = { vehicles: [], promos: [], articles: [] };
      if (!query || query.trim().length < 2) return empty;

      const q = query.trim().toLowerCase();

      const promoKeywords = ["promo", "diskon", "dp"];
      const articleKeywords = ["review", "tips", "cara"];
      const vehicleKeywords = [
        "xpander",
        "pajero",
        "outlander",
        "eclipse",
        "l300",
        "canter",
        "fuso",
        "colt",
        "triton",
        "destinator",
        "xforce",
      ];

      const intentBoostPromo = promoKeywords.some((k) => q.includes(k));
      const intentBoostArticle = articleKeywords.some((k) => q.includes(k));
      const intentBoostVehicle =
        vehicleKeywords.some((k) => q.includes(k)) &&
        !intentBoostPromo &&
        !intentBoostArticle;

      type Scored = { entry: SearchIndexEntry; score: number };

      const scored: Scored[] = index
        .map((entry) => ({
          entry,
          score: scoreEntry(
            entry,
            q,
            intentBoostVehicle,
            intentBoostPromo,
            intentBoostArticle,
          ),
        }))
        .filter((s) => s.score > 0);

      const resultVehicles = scored
        .filter((s) => s.entry.entryType === "vehicle")
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((s) => s.entry);

      const resultPromos = scored
        .filter((s) => s.entry.entryType === "promo")
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((s) => s.entry);

      const resultArticles = scored
        .filter((s) => s.entry.entryType === "article")
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((s) => s.entry);

      return {
        vehicles: resultVehicles,
        promos: resultPromos,
        articles: resultArticles,
      };
    },
    [index],
  );

  const getAutosuggestions = useCallback(
    (query: string): SearchIndexEntry[] => {
      if (!query || query.trim().length < 2) return [];
      const q = query.trim().toLowerCase();

      const resultVehicles = index
        .filter(
          (e) => e.entryType === "vehicle" && e.title.toLowerCase().includes(q),
        )
        .slice(0, 5);
      const resultPromos = index
        .filter(
          (e) => e.entryType === "promo" && e.title.toLowerCase().includes(q),
        )
        .slice(0, 5);
      const resultArticles = index
        .filter(
          (e) => e.entryType === "article" && e.title.toLowerCase().includes(q),
        )
        .slice(0, 5);

      return [...resultVehicles, ...resultPromos, ...resultArticles];
    },
    [index],
  );

  return { index, search, getAutosuggestions };
}

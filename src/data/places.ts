import type { GovernorateKey } from "@/data/governorate-water";

export const GEONAMES_SOURCE = {
  title: "GeoNames Lebanon gazetteer extract",
  publisher: "GeoNames",
  url: "https://www.geonames.org/",
  downloadUrl: "https://download.geonames.org/export/dump/LB.zip",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  note: "Community-maintained point gazetteer; coordinates and names may be incomplete, approximate, or outdated.",
} as const;

export type PlaceRecord = {
  id: number;
  name: string;
  asciiName: string;
  names: string[];
  lat: number;
  lng: number;
  featureCode: string;
  governorate: string;
  district: string;
  governorateKey: GovernorateKey | null;
  population: number;
};

export type PlaceDataset = {
  source: string;
  license: string;
  generatedAt: string;
  places: PlaceRecord[];
};

export function normalizePlaceText(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, "").toLocaleLowerCase().replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

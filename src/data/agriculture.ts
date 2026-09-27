import type { GovernorateKey } from "@/data/governorate-water";
import { EXPLORER_SOURCES } from "@/data/data-sources";

export const LAND_COVER_SERVICE_URL = "https://ic.imagery1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer";

export const LAND_COVER_SOURCE = {
  title: "Sentinel-2 10m Land Use/Land Cover Time Series",
  publisher: "Impact Observatory, Microsoft, and Esri",
  observationYear: 2023,
  resolution: "10 m",
  url: "https://www.arcgis.com/home/item.html?id=785c6233e32843f3b7b1ed43427d3387",
  serviceUrl: LAND_COVER_SERVICE_URL,
  rasterId: 7,
  queryMethod: "ArcGIS ImageServer identify request locked to the 2023 catalog raster (OBJECTID 7)",
  license: "CC BY 4.0",
} as const;

export const LAND_COVER_CLASSES: Record<number, { label: string; agricultural: boolean }> = {
  1: { label: "Water", agricultural: false },
  2: { label: "Trees", agricultural: false },
  4: { label: "Flooded vegetation", agricultural: false },
  5: { label: "Crops", agricultural: true },
  7: { label: "Built area", agricultural: false },
  8: { label: "Bare ground", agricultural: false },
  9: { label: "Snow / ice", agricultural: false },
  10: { label: "Clouds", agricultural: false },
  11: { label: "Rangeland", agricultural: false },
};

export type LandCoverResult = {
  code: number;
  label: string;
  agricultural: boolean;
};

export type AgricultureCensusRecord = {
  utilizedAgriculturalAreaHa: number;
  irrigatedAreaHa: number;
};

export const AGRICULTURE_CENSUS_SOURCE = EXPLORER_SOURCES.agriculture;

export const AGRICULTURE_BY_GOVERNORATE: Partial<Record<GovernorateKey, AgricultureCensusRecord>> = {
  mount_lebanon: { utilizedAgriculturalAreaHa: 20_588, irrigatedAreaHa: 9_396 },
  north_lebanon: { utilizedAgriculturalAreaHa: 24_065, irrigatedAreaHa: 9_200 },
  akkar: { utilizedAgriculturalAreaHa: 35_352, irrigatedAreaHa: 15_649 },
  bekaa: { utilizedAgriculturalAreaHa: 41_649, irrigatedAreaHa: 29_866 },
  baalbek_hermel: { utilizedAgriculturalAreaHa: 57_625, irrigatedAreaHa: 31_703 },
  south_lebanon: { utilizedAgriculturalAreaHa: 25_621, irrigatedAreaHa: 12_203 },
  nabatieh: { utilizedAgriculturalAreaHa: 26_095, irrigatedAreaHa: 4_939 },
};

export const AGRICULTURE_NATIONAL_TOTALS = {
  utilizedAgriculturalAreaHa: 230_995,
  irrigatedAreaHa: 112_956,
  censusGovernorateGroupings: 7,
  referencePeriod: "2010/11",
} as const;

export type AgricultureMetric = "uaa" | "irrigated";

export function agricultureValue(key: GovernorateKey, metric: AgricultureMetric) {
  const record = AGRICULTURE_BY_GOVERNORATE[key];
  if (!record) return null;
  return metric === "uaa" ? record.utilizedAgriculturalAreaHa : record.irrigatedAreaHa;
}

const AGRICULTURE_SCALES: Record<AgricultureMetric, { max: number; color: string }[]> = {
  uaa: [
    { max: 25_000, color: "#d9ead8" },
    { max: 35_000, color: "#a9cfaa" },
    { max: 45_000, color: "#69a978" },
    { max: Number.POSITIVE_INFINITY, color: "#2f7853" },
  ],
  irrigated: [
    { max: 7_500, color: "#e0ecda" },
    { max: 15_000, color: "#afd2a8" },
    { max: 25_000, color: "#70ad78" },
    { max: Number.POSITIVE_INFINITY, color: "#327b50" },
  ],
};

export const AGRICULTURE_NO_DATA_COLOR = "#d9ddd7";

export function agricultureColor(value: number | null, metric: AgricultureMetric) {
  if (value === null) return AGRICULTURE_NO_DATA_COLOR;
  return AGRICULTURE_SCALES[metric].find((stop) => value <= stop.max)?.color ?? AGRICULTURE_NO_DATA_COLOR;
}

export function agricultureLegend(metric: AgricultureMetric) {
  return AGRICULTURE_SCALES[metric];
}

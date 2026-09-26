import type { GovernorateKey } from "@/data/governorate-water";

export const RAINFALL_SOURCE = {
  title: "Traboulsi & Traboulsi — Rooftop Level Rainwater Harvesting System, Applied Water Science.",
  publication: "Applied Water Science 7 (2017), 769–775",
  unit: "mm/year",
  url: "https://link.springer.com/article/10.1007/s13201-015-0289-8",
  note: "Values represent average annual rainfall used in the Lebanon rainwater-harvesting study and are intended for estimation purposes. Local rainfall varies with elevation and location.",
} as const;

export const RAINFALL_SCALE = [
  { annualMm: 600, category: "Lower rainfall", color: "#d9edf8" },
  { annualMm: 750, category: "Moderate rainfall", color: "#9ccfe8" },
  { annualMm: 1000, category: "High rainfall", color: "#4199ca" },
  { annualMm: 1200, category: "Very high rainfall", color: "#0b568f" },
] as const;

export const RAINFALL_UNAVAILABLE_COLOR = "#d8dde0";

type RainfallRecord = {
  annualMm: number | null;
  category: string;
  studyGeography: string;
};

const RAINFALL_RECORDS: Record<GovernorateKey, RainfallRecord> = {
  mount_lebanon: { annualMm: 1200, category: "Very high rainfall", studyGeography: "Mount Lebanon" },
  north_lebanon: { annualMm: 1000, category: "High rainfall", studyGeography: "North Lebanon" },
  south_lebanon: { annualMm: 750, category: "Moderate rainfall", studyGeography: "South Lebanon & Nabatieh" },
  nabatieh: { annualMm: 750, category: "Moderate rainfall", studyGeography: "South Lebanon & Nabatieh" },
  bekaa: { annualMm: 600, category: "Lower rainfall", studyGeography: "Beqaa" },
  beirut: { annualMm: 600, category: "Lower rainfall", studyGeography: "Beirut" },
  akkar: { annualMm: null, category: "Unavailable from this study dataset", studyGeography: "Not listed separately" },
  baalbek_hermel: { annualMm: null, category: "Unavailable from this study dataset", studyGeography: "Not listed separately" },
};

export const RAINFALL_BY_GOVERNORATE_KEY = RAINFALL_RECORDS;

export const GOVERNORATE_RAINFALL = {
  Akkar: RAINFALL_RECORDS.akkar,
  "Baalbek-Hermel": RAINFALL_RECORDS.baalbek_hermel,
  Bekaa: RAINFALL_RECORDS.bekaa,
  Beirut: RAINFALL_RECORDS.beirut,
  "Mount Lebanon": RAINFALL_RECORDS.mount_lebanon,
  Nabatieh: RAINFALL_RECORDS.nabatieh,
  "North Lebanon": RAINFALL_RECORDS.north_lebanon,
  "South Lebanon": RAINFALL_RECORDS.south_lebanon,
} as const;

export type RainfallGovernorate = keyof typeof GOVERNORATE_RAINFALL;
export const LEBANESE_GOVERNORATES = Object.keys(GOVERNORATE_RAINFALL) as RainfallGovernorate[];

export function rainfallColor(annualMm: number | null) {
  return RAINFALL_SCALE.find((item) => item.annualMm === annualMm)?.color ?? RAINFALL_UNAVAILABLE_COLOR;
}

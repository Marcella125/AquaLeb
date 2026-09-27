import {
  RAINFALL_GRID_BAND_CHARS,
  RAINFALL_GRID_BOUNDS,
  RAINFALL_GRID_ROWS,
  RAINFALL_GRID_STEP,
} from "@/data/rainfall-grid.generated";

export const RAINFALL_SOURCE = {
  title: "Carte de la pluviométrie moyenne annuelle au Liban — Figure 3",
  authors: "Georges Karam & Jocelyne Adjizian Gérard",
  publication: "VertigO, volume 23, number 2 (2023)",
  underlyingData: "Atlas climatique du Liban (1977)",
  unit: "mm/year",
  url: "https://journals.openedition.org/vertigo/41649?lang=pt",
  figureUrl: "https://journals.openedition.org/vertigo/docannexe/image/41649/img-3.png",
  note: "AQUALEB digitizes the published 100 mm rainfall bands at the selected coordinate. Closed bands use their midpoint for calculations; the open >1,400 mm band uses 1,400 mm as a conservative lower bound.",
} as const;

export const RAINFALL_SCALE = [
  { minMm: 200, maxMm: 300, calculationMm: 250, label: "200–300", category: "200–300 mm/year", color: "#b6edf0" },
  { minMm: 300, maxMm: 400, calculationMm: 350, label: "300–400", category: "300–400 mm/year", color: "#a1daed" },
  { minMm: 400, maxMm: 500, calculationMm: 450, label: "400–500", category: "400–500 mm/year", color: "#8ac6eb" },
  { minMm: 500, maxMm: 600, calculationMm: 550, label: "500–600", category: "500–600 mm/year", color: "#75b4e9" },
  { minMm: 600, maxMm: 700, calculationMm: 650, label: "600–700", category: "600–700 mm/year", color: "#5ca3e5" },
  { minMm: 700, maxMm: 800, calculationMm: 750, label: "700–800", category: "700–800 mm/year", color: "#4192e3" },
  { minMm: 800, maxMm: 900, calculationMm: 850, label: "800–900", category: "800–900 mm/year", color: "#1f84e0" },
  { minMm: 900, maxMm: 1000, calculationMm: 950, label: "900–1,000", category: "900–1,000 mm/year", color: "#216fd3" },
  { minMm: 1000, maxMm: 1100, calculationMm: 1050, label: "1,000–1,100", category: "1,000–1,100 mm/year", color: "#2359c6" },
  { minMm: 1100, maxMm: 1200, calculationMm: 1150, label: "1,100–1,200", category: "1,100–1,200 mm/year", color: "#1d44b9" },
  { minMm: 1200, maxMm: 1300, calculationMm: 1250, label: "1,200–1,300", category: "1,200–1,300 mm/year", color: "#1a32ac" },
  { minMm: 1300, maxMm: 1400, calculationMm: 1350, label: "1,300–1,400", category: "1,300–1,400 mm/year", color: "#141f9f" },
  { minMm: 1400, maxMm: null, calculationMm: 1400, label: ">1,400", category: ">1,400 mm/year", color: "#0a0a90" },
] as const;

export type RainfallBand = (typeof RAINFALL_SCALE)[number];
export type LocationRainfall = RainfallBand & {
  annualMm: number;
  calculationBasis: "band midpoint" | "band lower bound";
  spatialResolution: "Published map band at selected coordinate";
};

export const RAINFALL_MAP_OVERLAY = "/data/lebanon-rainfall-zones.png?v=vertigo-2023-boundary-v2";
export const RAINFALL_MAP_BOUNDS = RAINFALL_GRID_BOUNDS;
export const RAINFALL_UNAVAILABLE_COLOR = "#d8dde0";

export function getRainfallAtCoordinate(latitude: number, longitude: number): LocationRainfall | null {
  const column = Math.round((longitude - RAINFALL_GRID_BOUNDS.west) / RAINFALL_GRID_STEP);
  const row = Math.round((RAINFALL_GRID_BOUNDS.north - latitude) / RAINFALL_GRID_STEP);
  if (row < 0 || column < 0 || row >= RAINFALL_GRID_ROWS.length || column >= RAINFALL_GRID_ROWS[0].length) return null;
  const bandIndex = RAINFALL_GRID_BAND_CHARS.indexOf(RAINFALL_GRID_ROWS[row][column]);
  if (bandIndex < 0) return null;
  const band = RAINFALL_SCALE[bandIndex];
  return {
    ...band,
    annualMm: band.calculationMm,
    calculationBasis: band.maxMm === null ? "band lower bound" : "band midpoint",
    spatialResolution: "Published map band at selected coordinate",
  };
}

export function rainfallColor(rainfall: LocationRainfall | null) {
  return rainfall?.color ?? RAINFALL_UNAVAILABLE_COLOR;
}

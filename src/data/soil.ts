export const SOIL_LAYER_URL = "https://icilgis.aub.edu.lb/server/rest/services/Hosted/Soils_Service/FeatureServer/3";

export const SOIL_SOURCE = {
  title: "Detailed Soil Map of Lebanon",
  publisher: "CNRS – Center for Remote Sensing",
  host: "American University of Beirut (AUB)",
  scale: "1:50,000",
  productionYears: "1997–2006",
  sheetCount: 27,
  url: SOIL_LAYER_URL,
} as const;

export type SoilProperties = {
  objectid?: number;
  code2?: string | null;
  soiltype2?: string | null;
  total_sand?: number | null;
  silt__?: number | null;
  clay__?: number | null;
  o_m___?: number | null;
  depth?: number | null;
  soil_class?: string | null;
  soil_group?: string | null;
  soil_unit?: string | null;
};

// Colors reproduce the layer's live, published unique-value renderer.
export const SOIL_CLASS_COLORS: Record<string, string> = {
  Andosols: "#e0d4ff",
  Anthrosols: "#bcffb5",
  Arenosols: "#fee1b8",
  Calcisols: "#bafdfb",
  Cambisols: "#feb3c1",
  City: "#fdb4fc",
  Cliff: "#d6fed8",
  Fluvisols: "#c8b5ff",
  Gleysols: "#f8febd",
  Harbor: "#b4defe",
  Island: "#fdd7df",
  Lac: "#fdc8ef",
  Leptosols: "#b6c1ff",
  Luvisols: "#fed4c3",
  Regosols: "#dbfdb4",
  Rock: "#b4fde4",
  Vertisols: "#cceffe",
  "beach rock": "#fdfcd5",
};

export const SOIL_CLASS_ORDER = Object.keys(SOIL_CLASS_COLORS);

export function soilColor(soilClass?: string | null) {
  return soilClass ? (SOIL_CLASS_COLORS[soilClass] ?? "#828282") : "#828282";
}

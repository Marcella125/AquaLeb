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

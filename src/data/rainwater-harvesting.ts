export const ROOF_MATERIALS = {
  concrete: { key: "concrete", label: "Concrete", coefficient: 0.8 },
  tiles: { key: "tiles", label: "Tiles", coefficient: 0.8 },
  metal: { key: "metal", label: "Metal", coefficient: 0.9 },
  other: { key: "other", label: "Other", coefficient: 0.7 },
} as const;

export type RoofMaterialKey = keyof typeof ROOF_MATERIALS;

export const ROOF_COEFFICIENT_SOURCE = {
  title: "Blue Drop Series on Rainwater Harvesting and Utilisation — Book 3",
  publisher: "UN-Habitat",
  url: "https://unhabitat.org/sites/default/files/download-manager-files/Blue%20Drop%20Series%20on%20Rainwater%20Harvesting%20and%20Utilisation%20%E2%80%93%20Book%203%20Project%20Managers%20and%20implemetation%20Agency.pdf",
  note: "Design coefficients are selected within the published ranges for tiled, corrugated-metal and hard catchment surfaces. Other uses a conservative general-surface assumption and should be refined for detailed system design.",
} as const;

export const MIN_ROOF_AREA_M2 = 0.1;
export const MAX_ROOF_AREA_M2 = 100_000;

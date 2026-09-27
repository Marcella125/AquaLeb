import { RAINFALL_BY_GOVERNORATE_KEY, RAINFALL_SOURCE } from "@/data/governorate-rainfall";
import { ROOF_MATERIALS, type RoofMaterialKey } from "@/data/rainwater-harvesting";
import { GOVERNORATES, type GovernorateKey } from "@/data/governorate-water";
import type { PlaceRecord } from "@/data/places";

export type RainwaterEstimate = {
  location: {
    name: string;
    governorate: string;
    coordinates: { lat: number; lng: number };
  };
  rainfall: {
    value: number;
    unit: "mm/year";
    source: typeof RAINFALL_SOURCE;
    referencePeriod: string;
    resolution: "Regional data";
    studyGeography: string;
  };
  roof: {
    areaM2: number;
    materialKey: RoofMaterialKey;
    material: string;
    runoffCoefficient: number;
  };
  result: {
    litresPerYear: number;
    cubicMetresPerYear: number;
    annualizedMonthlyAverageLitres: number;
  };
};

export function calculateRainwaterEstimate(place: PlaceRecord, governorateKey: GovernorateKey, areaM2: number, materialKey: RoofMaterialKey): RainwaterEstimate | null {
  const rainfall = RAINFALL_BY_GOVERNORATE_KEY[governorateKey];
  if (rainfall.annualMm == null) return null;

  const material = ROOF_MATERIALS[materialKey];
  const litresPerYear = rainfall.annualMm * areaM2 * material.coefficient;

  return {
    location: {
      name: place.name,
      governorate: GOVERNORATES[governorateKey].name,
      coordinates: { lat: place.lat, lng: place.lng },
    },
    rainfall: {
      value: rainfall.annualMm,
      unit: "mm/year",
      source: RAINFALL_SOURCE,
      referencePeriod: RAINFALL_SOURCE.publication,
      resolution: "Regional data",
      studyGeography: rainfall.studyGeography,
    },
    roof: {
      areaM2,
      materialKey,
      material: material.label,
      runoffCoefficient: material.coefficient,
    },
    result: {
      litresPerYear,
      cubicMetresPerYear: litresPerYear / 1000,
      annualizedMonthlyAverageLitres: litresPerYear / 12,
    },
  };
}

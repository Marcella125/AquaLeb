import { getRainfallAtCoordinate, RAINFALL_SOURCE } from "@/data/lebanon-rainfall";
import { ROOF_MATERIALS, type RoofMaterialKey } from "@/data/rainwater-harvesting";
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
    resolution: "Spatial rainfall band";
    band: string;
    calculationBasis: "band midpoint" | "band lower bound";
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

export function calculateRainwaterEstimate(place: PlaceRecord, areaM2: number, materialKey: RoofMaterialKey): RainwaterEstimate | null {
  const rainfall = getRainfallAtCoordinate(place.lat, place.lng);
  if (!rainfall) return null;

  const material = ROOF_MATERIALS[materialKey];
  const litresPerYear = rainfall.annualMm * areaM2 * material.coefficient;

  return {
    location: {
      name: place.name,
      governorate: place.governorate,
      coordinates: { lat: place.lat, lng: place.lng },
    },
    rainfall: {
      value: rainfall.annualMm,
      unit: "mm/year",
      source: RAINFALL_SOURCE,
      referencePeriod: RAINFALL_SOURCE.publication,
      resolution: "Spatial rainfall band",
      band: rainfall.label,
      calculationBasis: rainfall.calculationBasis,
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

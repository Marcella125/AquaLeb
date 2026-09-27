import { LAND_COVER_SOURCE } from "@/data/agriculture";
import { EXPLORER_SOURCES } from "@/data/data-sources";
import { BOUNDARY_SOURCE, DATA_SOURCES } from "@/data/governorate-water";
import { GEONAMES_SOURCE } from "@/data/places";
import { ROOF_COEFFICIENT_SOURCE } from "@/data/rainwater-harvesting";
import { SOIL_SOURCE } from "@/data/soil";

export type SourceRegistryRecord = {
  key: string;
  dataset: string;
  publisher: string;
  url: string;
  powers: string;
  coverage: string;
  observationPeriod: string;
  geographicUnit: string;
  resolutionOrScale: string;
  updateDate: string;
  limitation: string;
  methodology: string[];
};

export const SOURCE_REGISTRY: SourceRegistryRecord[] = [
  {
    key: "rainfall-harvesting",
    dataset: EXPLORER_SOURCES.rainfall.dataset,
    publisher: EXPLORER_SOURCES.rainfall.institution,
    url: EXPLORER_SOURCES.rainfall.url,
    powers: "Annual precipitation layers, location rainfall context and rainwater-harvesting estimates.",
    coverage: `Lebanon published study geographies · ${EXPLORER_SOURCES.rainfall.year}`,
    observationPeriod: EXPLORER_SOURCES.rainfall.year,
    geographicUnit: EXPLORER_SOURCES.rainfall.geographicResolution,
    resolutionOrScale: EXPLORER_SOURCES.rainfall.geographicResolution,
    updateDate: EXPLORER_SOURCES.rainfall.year,
    limitation: EXPLORER_SOURCES.rainfall.administrativeLimitations,
    methodology: [EXPLORER_SOURCES.rainfall.methodology, EXPLORER_SOURCES.rainfall.transformation],
  },
  {
    key: "water-lfhlcs",
    dataset: DATA_SOURCES.lfhlcs_2018_19.title,
    publisher: DATA_SOURCES.lfhlcs_2018_19.publisher,
    url: DATA_SOURCES.lfhlcs_2018_19.url,
    powers: "Governorate comparisons for piped, non-piped and unavailable drinking-water facilities.",
    coverage: "All eight governorates · April 2018–March 2019 · published 2020",
    observationPeriod: DATA_SOURCES.lfhlcs_2018_19.collectionYear,
    geographicUnit: "Governorate (ADM1); primary residences",
    resolutionOrScale: "Published governorate percentages",
    updateDate: "Published 2020",
    limitation: "Survey estimates describe governorates, not villages or selected points. Bracketed estimates have relative standard error above 20%.",
    methodology: [
      "Geographic unit: governorate (ADM1), based on primary residences.",
      "AquaLeb uses the published governorate percentages from Figure 5.8, report page 89, and retains the report’s published precision.",
    ],
  },
  {
    key: "water-mics",
    dataset: DATA_SOURCES.mics_2023.title,
    publisher: DATA_SOURCES.mics_2023.publisher,
    url: DATA_SOURCES.mics_2023.url,
    powers: "Later drinking-water access, availability and basic sanitation indicators where published.",
    coverage: "Five surveyed governorates · July–November 2023 · 2025/26 release",
    observationPeriod: DATA_SOURCES.mics_2023.collectionYear,
    geographicUnit: "Five surveyed governorates; weighted household population",
    resolutionOrScale: "Published governorate percentages",
    updateDate: DATA_SOURCES.mics_2023.publicationYear,
    limitation: "Definitions and population basis differ from LFHLCS. Mount Lebanon and Bekaa coverage is incomplete; three governorates are unavailable.",
    methodology: [
      "Geographic unit: five surveyed governorates, using weighted household population.",
      "AquaLeb uses tables WS.1.2, WS.1.5 and WS.3.2. The survey figures are kept separate from LFHLCS indicators and are never filled into unavailable governorates.",
    ],
  },
  {
    key: "land-cover",
    dataset: LAND_COVER_SOURCE.title,
    publisher: LAND_COVER_SOURCE.publisher,
    url: LAND_COVER_SOURCE.url,
    powers: "The Agriculture result returned for a searched place or selected map coordinate.",
    coverage: `${LAND_COVER_SOURCE.observationYear} annual raster · ${LAND_COVER_SOURCE.resolution} pixels`,
    observationPeriod: String(LAND_COVER_SOURCE.observationYear),
    geographicUnit: "Raster pixel at selected coordinate",
    resolutionOrScale: LAND_COVER_SOURCE.resolution,
    updateDate: "Annual 2023 raster; service update date not stated",
    limitation: "AI-derived land-cover classification, not a field inspection, parcel boundary, crop type, or confirmation of current cultivation.",
    methodology: [
      "Geographic unit: the raster pixel at the selected coordinate.",
      "AquaLeb queries the ArcGIS ImageServer identify endpoint and locks the result to the 2023 catalog raster (OBJECTID 7). “Crops” describes that pixel only.",
    ],
  },
  {
    key: "agriculture-census",
    dataset: EXPLORER_SOURCES.agriculture.dataset,
    publisher: EXPLORER_SOURCES.agriculture.institution,
    url: EXPLORER_SOURCES.agriculture.url,
    powers: "Governorate agricultural-area and irrigated-area context across AQUALEB.",
    coverage: `Seven census governorate groupings · ${EXPLORER_SOURCES.agriculture.year}`,
    observationPeriod: EXPLORER_SOURCES.agriculture.year,
    geographicUnit: EXPLORER_SOURCES.agriculture.geographicResolution,
    resolutionOrScale: EXPLORER_SOURCES.agriculture.geographicResolution,
    updateDate: EXPLORER_SOURCES.agriculture.year,
    limitation: EXPLORER_SOURCES.agriculture.administrativeLimitations,
    methodology: [EXPLORER_SOURCES.agriculture.methodology, EXPLORER_SOURCES.agriculture.transformation],
  },
  {
    key: "soil",
    dataset: SOIL_SOURCE.title,
    publisher: `${SOIL_SOURCE.publisher}; hosted by ${SOIL_SOURCE.host}`,
    url: SOIL_SOURCE.url,
    powers: "The Soil result and the optional detailed soil-polygon map layer.",
    coverage: `Lebanon · produced ${SOIL_SOURCE.productionYears} · ${SOIL_SOURCE.scale}`,
    observationPeriod: SOIL_SOURCE.productionYears,
    geographicUnit: "Mapped polygon intersecting the selected coordinate",
    resolutionOrScale: SOIL_SOURCE.scale,
    updateDate: "Service update date not stated",
    limitation: "Regional soil mapping, not a field test. Numeric attribute units and completeness are not documented in the layer metadata.",
    methodology: [
      `The published map was produced from ${SOIL_SOURCE.sheetCount} sheets. AquaLeb returns the mapped polygon intersecting the selected coordinate.`,
      "Only meaningful text attributes are shown; numeric fields are omitted because the service metadata does not define their units.",
    ],
  },
  {
    key: "boundaries",
    dataset: BOUNDARY_SOURCE.title,
    publisher: BOUNDARY_SOURCE.publisher,
    url: BOUNDARY_SOURCE.url,
    powers: "Governorate shapes, map selection and matching a selected coordinate to its governorate.",
    coverage: "Lebanon national outline and eight governorates · current COD extract",
    observationPeriod: "Current COD release represented by the local extract",
    geographicUnit: "Lebanon national outline and eight governorates (ADM1)",
    resolutionOrScale: "Detailed GeoJSON, simplified for web delivery",
    updateDate: "Check source portal for current release date",
    limitation: BOUNDARY_SOURCE.note,
    methodology: [
      "Geographic unit: Lebanon’s national outline and eight governorates (ADM1).",
      "AquaLeb serves a detailed local GeoJSON extract simplified for web delivery while retaining OCHA P-codes. Check the source portal for the current release date.",
    ],
  },
  {
    key: "places",
    dataset: GEONAMES_SOURCE.title,
    publisher: GEONAMES_SOURCE.publisher,
    url: GEONAMES_SOURCE.url,
    powers: "Place search, alternate spellings and the point coordinate used for map queries.",
    coverage: "Lebanese named places · downloaded gazetteer snapshot",
    observationPeriod: "Downloaded gazetteer snapshot",
    geographicUnit: "Named-place point coordinate",
    resolutionOrScale: "Point gazetteer",
    updateDate: "Generated with the bundled data script",
    limitation: GEONAMES_SOURCE.note,
    methodology: [
      "Geographic unit: a named-place point coordinate, not a village boundary.",
      `The local search index includes Lebanese place names, alternate spellings and WGS84 coordinates from the bundled extract. License: ${GEONAMES_SOURCE.license}.`,
    ],
  },
  {
    key: "roof-coefficients",
    dataset: ROOF_COEFFICIENT_SOURCE.title,
    publisher: ROOF_COEFFICIENT_SOURCE.publisher,
    url: ROOF_COEFFICIENT_SOURCE.url,
    powers: "Roof-material runoff coefficients used by the rainwater-harvesting calculator.",
    coverage: "Published design ranges for common catchment surfaces",
    observationPeriod: "Published technical guidance",
    geographicUnit: "Roof and hard-surface material type",
    resolutionOrScale: "Material-specific design coefficient",
    updateDate: "Source publication",
    limitation: ROOF_COEFFICIENT_SOURCE.note,
    methodology: ["AQUALEB applies the selected material coefficient to the annual regional rainfall and horizontal roof catchment area.", ROOF_COEFFICIENT_SOURCE.note],
  },
];

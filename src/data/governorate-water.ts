/**
 * AquaLeb governorate indicator registry.
 *
 * Every value rendered by the atlas is defined here as a source record. UI
 * components never contain survey figures. Values were checked against:
 * - CAS LFHLCS 2018–19, Figure 5.8, report page 89 (all 8 governorates).
 * - CAS/UNICEF Sub-National MICS 2023 WASH workbook, tables WS.1.2,
 *   WS.1.5 and WS.3.2 (5 governorates only; Mount Lebanon and Bekaa partial).
 *
 * The 2024–2035 National Water Strategy is context only. It is deliberately
 * not used as a source for governorate indicators.
 */

export type GovernorateKey =
  | "beirut" | "mount_lebanon" | "north_lebanon" | "akkar"
  | "bekaa" | "baalbek_hermel" | "south_lebanon" | "nabatieh";

export type MetricCategory = "source" | "access" | "sanitation";
export type MetricKey = "piped" | "non_piped" | "no_facility" | "basic_service_2023" | "available_when_needed_2023" | "basic_sanitation_2023";
export type SourceKey = "lfhlcs_2018_19" | "mics_2023";

export const DATA_SOURCES = {
  lfhlcs_2018_19: {
    shortTitle: "CAS LFHLCS 2018–19", title: "Labour Force and Household Living Conditions Survey 2018–2019",
    publisher: "Lebanon Central Administration of Statistics (CAS)", collectionYear: "April 2018–March 2019", publicationYear: "2020",
    url: "https://www.cas.gov.lb/wp-content/uploads/2025/07/Labour-Force-and-Household-Living-Conditions-Survey-2018-2019.pdf", table: "Figure 5.8, report page 89",
  },
  mics_2023: {
    shortTitle: "CAS/UNICEF MICS 2023", title: "Sub-National Lebanon Multiple Indicator Cluster Survey 2023 — WASH tables",
    publisher: "Lebanon Central Administration of Statistics and UNICEF", collectionYear: "July–November 2023", publicationYear: "2025/26 release",
    url: "https://www.cas.gov.lb/wp-content/uploads/2026/06/MICS6-Ch10-WS-Live-in-a-safe-and-clean-environment-LB_EN.xlsx", table: "Tables WS.1.2, WS.1.5 and WS.3.2",
  },
} as const;

export const BOUNDARY_SOURCE = {
  title: "Lebanon Subnational Administrative Boundaries — ADM1", publisher: "OCHA Field Information Services Section (FISS)",
  url: "https://data.humdata.org/dataset/cod-ab-lbn", note: "Local GeoJSON is a simplified ADM1 extract retaining OCHA P-codes.",
} as const;

export const SECTOR_CONTEXT = {
  title: "Lebanon’s National Water Strategy 2024–2035", publisher: "Ministry of Energy and Water", year: "2024",
  url: "https://www.energyandwater.gov.lb/ar/details/100937/", use: "National sector context only; no strategy figure is mapped as a governorate statistic.",
} as const;

export const GOVERNORATES: Record<GovernorateKey, { name: string; pcode: string }> = {
  beirut: { name: "Beirut", pcode: "LB1" }, mount_lebanon: { name: "Mount Lebanon", pcode: "LB3" },
  north_lebanon: { name: "North Lebanon", pcode: "LB5" }, akkar: { name: "Akkar", pcode: "LB2" },
  bekaa: { name: "Bekaa", pcode: "LB4" }, baalbek_hermel: { name: "Baalbek-Hermel", pcode: "LB8" },
  south_lebanon: { name: "South Lebanon", pcode: "LB6" }, nabatieh: { name: "Nabatieh", pcode: "LB7" },
};

export const GOVERNORATE_ORDER: GovernorateKey[] = ["akkar", "north_lebanon", "baalbek_hermel", "beirut", "mount_lebanon", "bekaa", "south_lebanon", "nabatieh"];

type MetricValue = { value: number; weightedBase?: number; incomplete?: boolean; precisionWarning?: boolean };
export type IndicatorRecord = {
  key: MetricKey; category: MetricCategory; name: string; shortLabel: string; definition: string; geography: string;
  year: string; unit: "%"; basis: string; source: SourceKey; sourceTable: string; coverage: "all" | "partial";
  higherIsBetter: boolean; values: Partial<Record<GovernorateKey, MetricValue>>;
};

const lfhlcsValues = {
  beirut: { piped: 8.1, nonPiped: 91.9, noFacility: 0.1 }, mount_lebanon: { piped: 17.0, nonPiped: 82.7, noFacility: 0.2 },
  north_lebanon: { piped: 32.4, nonPiped: 66.7, noFacility: 1.0 }, akkar: { piped: 36.7, nonPiped: 58.8, noFacility: 4.6 },
  bekaa: { piped: 34.7, nonPiped: 64.4, noFacility: 0.9 }, baalbek_hermel: { piped: 54.7, nonPiped: 44.2, noFacility: 1.1 },
  south_lebanon: { piped: 18.3, nonPiped: 81.6, noFacility: 0.1 }, nabatieh: { piped: 20.6, nonPiped: 79.0, noFacility: 0.3 },
} as const;
const micsBase = { beirut: 1741.868, mount_lebanon: 13184.988, north_lebanon: 4788.020, akkar: 2480.580, bekaa: 2849.264 } as const;
const allGovernorateValues = (field: keyof typeof lfhlcsValues.beirut, warn = false) => Object.fromEntries(
  (Object.keys(lfhlcsValues) as GovernorateKey[]).map((key) => [key, { value: lfhlcsValues[key][field], precisionWarning: warn && key !== "akkar" }]),
) as Record<GovernorateKey, MetricValue>;

export const INDICATORS: IndicatorRecord[] = [
  { key: "piped", category: "source", name: "Dwellings using piped drinking-water supplies", shortLabel: "Piped supplies", definition: "Share of primary residences whose main drinking-water source was a piped supply: tap water in the dwelling or a public standpost.", geography: "Lebanon governorates (ADM1)", year: "2018–19", unit: "%", basis: "Primary residences (dwelling-level percentage)", source: "lfhlcs_2018_19", sourceTable: "Figure 5.8", coverage: "all", higherIsBetter: true, values: allGovernorateValues("piped") },
  { key: "non_piped", category: "source", name: "Dwellings using non-piped drinking-water supplies", shortLabel: "Non-piped supplies", definition: "Share of primary residences whose main drinking-water source was packed water, protected wells or springs, boreholes/tubewells, rainwater or delivered water.", geography: "Lebanon governorates (ADM1)", year: "2018–19", unit: "%", basis: "Primary residences (dwelling-level percentage)", source: "lfhlcs_2018_19", sourceTable: "Figure 5.8", coverage: "all", higherIsBetter: false, values: allGovernorateValues("nonPiped") },
  { key: "no_facility", category: "source", name: "Dwellings with no drinking-water facility", shortLabel: "No facility", definition: "Share of primary residences reporting no drinking-water facility at the dwelling. Bracketed source estimates have a relative standard error above 20%.", geography: "Lebanon governorates (ADM1)", year: "2018–19", unit: "%", basis: "Primary residences (dwelling-level percentage)", source: "lfhlcs_2018_19", sourceTable: "Figure 5.8", coverage: "all", higherIsBetter: false, values: allGovernorateValues("noFacility", true) },
  { key: "basic_service_2023", category: "access", name: "Population using basic drinking-water services", shortLabel: "Basic service", definition: "Household population using an improved drinking-water source with collection time of no more than 30 minutes for a round trip, including queuing; water on premises qualifies.", geography: "Five surveyed governorates; Mount Lebanon and Bekaa incomplete", year: "2023", unit: "%", basis: "Weighted household population", source: "mics_2023", sourceTable: "WS.1.2", coverage: "partial", higherIsBetter: true, values: { beirut: { value: 97.7, weightedBase: micsBase.beirut }, mount_lebanon: { value: 92.5, weightedBase: micsBase.mount_lebanon, incomplete: true }, north_lebanon: { value: 94.3, weightedBase: micsBase.north_lebanon }, akkar: { value: 87.0, weightedBase: micsBase.akkar }, bekaa: { value: 93.3, weightedBase: micsBase.bekaa, incomplete: true } } },
  { key: "available_when_needed_2023", category: "access", name: "Population with sufficient drinking water when needed", shortLabel: "Available when needed", definition: "Percentage of household population with drinking water available in sufficient quantities when needed.", geography: "Five surveyed governorates; Mount Lebanon and Bekaa incomplete", year: "2023", unit: "%", basis: "Weighted household population", source: "mics_2023", sourceTable: "WS.1.5", coverage: "partial", higherIsBetter: true, values: { beirut: { value: 83.5, weightedBase: micsBase.beirut }, mount_lebanon: { value: 73.1, weightedBase: micsBase.mount_lebanon, incomplete: true }, north_lebanon: { value: 65.2, weightedBase: micsBase.north_lebanon }, akkar: { value: 68.1, weightedBase: micsBase.akkar }, bekaa: { value: 72.8, weightedBase: micsBase.bekaa, incomplete: true } } },
  { key: "basic_sanitation_2023", category: "sanitation", name: "Population using basic sanitation services", shortLabel: "Basic sanitation", definition: "Household population using improved sanitation facilities that are not shared with other households.", geography: "Five surveyed governorates; Mount Lebanon and Bekaa incomplete", year: "2023", unit: "%", basis: "Weighted household population", source: "mics_2023", sourceTable: "WS.3.2", coverage: "partial", higherIsBetter: true, values: { beirut: { value: 99.2, weightedBase: micsBase.beirut }, mount_lebanon: { value: 96.2, weightedBase: micsBase.mount_lebanon, incomplete: true }, north_lebanon: { value: 97.2, weightedBase: micsBase.north_lebanon }, akkar: { value: 93.1, weightedBase: micsBase.akkar }, bekaa: { value: 95.5, weightedBase: micsBase.bekaa, incomplete: true } } },
];

export const METRICS = Object.fromEntries(INDICATORS.map((indicator) => [indicator.key, indicator])) as Record<MetricKey, IndicatorRecord>;
export const METRIC_ORDER = INDICATORS.map(({ key }) => key);
export const CATEGORY_DEFAULTS: Record<MetricCategory, MetricKey> = { source: "piped", access: "basic_service_2023", sanitation: "basic_sanitation_2023" };
export const CATEGORY_LABELS: Record<MetricCategory, string> = { source: "Drinking-water source", access: "Access", sanitation: "Sanitation" };
export const geoJsonNameToDataKey: Record<string, GovernorateKey> = { Beirut: "beirut", "Mount Lebanon": "mount_lebanon", North: "north_lebanon", Akkar: "akkar", Bekaa: "bekaa", "Baalbek-El Hermel": "baalbek_hermel", South: "south_lebanon", "El Nabatieh": "nabatieh" };

export function indicatorsForCategory(category: MetricCategory) { return INDICATORS.filter((item) => item.category === category); }
export function sortedGovernorates(metricKey: MetricKey) { return [...GOVERNORATE_ORDER].sort((a, b) => (METRICS[metricKey].values[b]?.value ?? -1) - (METRICS[metricKey].values[a]?.value ?? -1)); }

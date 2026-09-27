export type DataStatus = "official" | "published" | "derived" | "modelled";

export type DataSourceMetadata = {
  institution: string;
  dataset: string;
  year: string;
  url: string;
  methodology: string;
  geographicResolution: string;
  administrativeLimitations: string;
  transformation: string;
  status: DataStatus;
};

export const EXPLORER_SOURCES = {
  waterStrategy: {
    institution: "Lebanese Ministry of Energy and Water",
    dataset: "National Water Sector Strategy 2024–2035",
    year: "2024–2035",
    url: "https://www.energyandwater.gov.lb/ar/details/100937/",
    methodology: "National water-sector strategy used for institutional context only.",
    geographicResolution: "National",
    administrativeLimitations: "The strategy is not used as a source of governorate water-volume values.",
    transformation: "No strategy figure is spatially allocated by AQUALEB.",
    status: "official",
  },
  rainfall: {
    institution: "Karam & Adjizian Gérard / VertigO (OpenEdition)",
    dataset: "Carte de la pluviométrie moyenne annuelle au Liban — Figure 3",
    year: "2023 publication; based on Atlas climatique du Liban (1977)",
    url: "https://journals.openedition.org/vertigo/41649?lang=pt",
    methodology: "The authors mapped mean annual rainfall in thirteen 100 mm spatial bands from 200–300 through 1300–1400 mm/year, plus an open-ended >1400 mm/year band, using the Atlas climatique du Liban (1977).",
    geographicResolution: "Digitized rainfall band at a selected coordinate",
    administrativeLimitations: "The rainfall zones are physical map bands, not governorate averages. The published figure is a generalized historical climatology and is not a parcel survey or a current-year measurement.",
    transformation: "AQUALEB georeferences and digitizes Figure 3. Displays retain the published band; calculations use the midpoint of closed bands and 1,400 mm as the conservative lower bound of the >1,400 band.",
    status: "derived",
  },
  rivers: {
    institution: "Fanack Water",
    dataset: "Major rivers in Lebanon",
    year: "2022",
    url: "https://water.fanack.com/lebanon/water-resources-in-lebanon/",
    methodology: "Published reference map showing Lebanon's named rivers and distinguishing perennial from intermittent waterways.",
    geographicResolution: "National reference map",
    administrativeLimitations: "The map is illustrative and is not a live hydrological network or a source of current river-flow measurements.",
    transformation: "AQUALEB reproduces the supplied Fanack Water map without altering its labels or classifications.",
    status: "published",
  },
  soil: {
    institution: "CNRS Lebanon – Remote Sensing Center",
    dataset: "Detailed Soil Map of Lebanon",
    year: "1997–2006",
    url: "https://icilgis.aub.edu.lb/server/rest/services/Hosted/Soils_Service/FeatureServer/3",
    methodology: "Published polygon soil mapping prepared under Talal Darwish / CNRS and hosted as a feature service by AUB.",
    geographicResolution: "Mapped soil polygons at 1:50,000 scale",
    administrativeLimitations: "Soil classes follow mapped physical polygons rather than governorate boundaries.",
    transformation: "AQUALEB displays the published categorical classes and source attributes without assigning a single class to a governorate.",
    status: "published",
  },
  agriculture: {
    institution: "Lebanese Ministry of Agriculture / FAO",
    dataset: "The Core Module of the Census of Agriculture 2010 – Main Results",
    year: "2010/11",
    url: "https://www.agriculture.gov.lb/getattachment/Statistics-and-Studies/Comprehensive-Agricultural-Statistics/statistics-2010/Agriculture-Census-2010-Main-Results.pdf?lang=ar-LB",
    methodology: "Official agricultural census reporting utilized agricultural area and irrigated area by census governorate grouping.",
    geographicResolution: "Seven census governorate groupings",
    administrativeLimitations: "The census predates the later treatment of Keserwan-Jbeil as a separate governorate. No separate value is fabricated. Beirut is not reported in the supplied governorate table.",
    transformation: "AQUALEB transcribes the published hectare totals and applies no estimation or redistribution.",
    status: "official",
  },
} as const satisfies Record<string, DataSourceMetadata>;


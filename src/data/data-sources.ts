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
    institution: "Traboulsi & Traboulsi / Applied Water Science",
    dataset: "Rooftop Level Rainwater Harvesting System",
    year: "2017 publication",
    url: "https://link.springer.com/article/10.1007/s13201-015-0289-8",
    methodology: "Average annual precipitation values published for Lebanon rainwater-harvesting estimation.",
    geographicResolution: "Published study geographies",
    administrativeLimitations: "Akkar and Baalbek-Hermel are not reported separately. South and Nabatieh share one study-geography value.",
    transformation: "AQUALEB links published study geographies to matching governorate areas; it does not estimate missing values.",
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


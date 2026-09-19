export type TrendDirection = "up" | "down" | "neutral";

export type Metric = {
  label: string;
  value: string;
  unit?: string;
  detail: string;
  trend?: string;
  trendDirection?: TrendDirection;
  icon: "population" | "water" | "production" | "reservoir";
};

export type Indicator = {
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "cyan" | "emerald" | "amber";
  icon: "rainfall" | "spring" | "well" | "reservoir" | "groundwater" | "quality";
};

export type ProductionPoint = {
  month: string;
  springs: number;
  wells: number;
  other: number;
};

export type ReservoirPoint = {
  month: string;
  level: number;
};

export type WaterStatusData = {
  level: string;
  summary: string;
  updated: string;
};

export type LocationData = {
  name: string;
  district: string;
  governorate: string;
  status: WaterStatusData;
  metrics: Metric[];
  indicators: Indicator[];
  production: ProductionPoint[];
  reservoir: ReservoirPoint[];
  sources: string[];
};

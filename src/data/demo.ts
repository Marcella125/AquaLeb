import type { LocationData } from "@/types/water";

export const demoLocation: LocationData = {
  name: "Ehden",
  district: "Zgharta District",
  governorate: "North Lebanon",
  status: {
    level: "Moderate",
    summary:
      "Availability is stable but remains below the seasonal average. Continued monitoring is recommended.",
    updated: "Demo snapshot · September 2026",
  },
  metrics: [
    { label: "Population", value: "12,500", detail: "Demo estimate", trend: "+1.2%", trendDirection: "up", icon: "population" },
    { label: "Estimated water per person", value: "92", unit: "L/day", detail: "Demo vs. national avg.", trend: "−18%", trendDirection: "down", icon: "water" },
    { label: "Daily production", value: "1,150", unit: "m³/day", detail: "Demo monthly change", trend: "+6%", trendDirection: "up", icon: "production" },
    { label: "Reservoir level", value: "56", unit: "%", detail: "1,130 / 2,000 m³ demo capacity", icon: "reservoir" },
  ],
  indicators: [
    { label: "Rainfall", value: "18 mm", detail: "42% below demo normal", tone: "blue", icon: "rainfall" },
    { label: "Springs", value: "3", detail: "~420 m³/day demo", tone: "cyan", icon: "spring" },
    { label: "Wells", value: "5", detail: "~730 m³/day demo", tone: "blue", icon: "well" },
    { label: "Reservoirs", value: "2", detail: "2,500 m³ demo total", tone: "cyan", icon: "reservoir" },
    { label: "Groundwater", value: "Watch", detail: "Demo status", tone: "amber", icon: "groundwater" },
    { label: "Water quality", value: "Good", detail: "Demo assessment", tone: "emerald", icon: "quality" },
  ],
  production: [
    { month: "Apr", springs: 380, wells: 520, other: 180 },
    { month: "May", springs: 410, wells: 600, other: 210 },
    { month: "Jun", springs: 430, wells: 650, other: 230 },
    { month: "Jul", springs: 395, wells: 590, other: 205 },
    { month: "Aug", springs: 420, wells: 625, other: 220 },
    { month: "Sep", springs: 425, wells: 640, other: 215 },
  ],
  reservoir: [
    { month: "Jan", level: 84 }, { month: "Feb", level: 76 },
    { month: "Mar", level: 70 }, { month: "Apr", level: 60 },
    { month: "May", level: 50 }, { month: "Jun", level: 45 },
    { month: "Jul", level: 40 }, { month: "Aug", level: 42 },
    { month: "Sep", level: 56 },
  ],
  sources: [
    "North Lebanon Water Establishment (demo reference)",
    "Litani River Authority (demo reference)",
    "Central Administration of Statistics (demo reference)",
    "Municipality of Ehden (demo reference)",
  ],
};

export const locationTabs = [
  "Overview", "Water Sources", "Reservoirs", "Supply & Demand", "Water Quality", "Trends",
];

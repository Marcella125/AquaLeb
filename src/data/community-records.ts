import type { GovernorateKey } from "@/data/governorate-water";

export type MappedWaterSource = { id: string; governorate: GovernorateKey };
export type CommunityReport = { id: string; governorate: GovernorateKey; reportedAt: string };

// These arrays are the app's source of truth. They are intentionally empty until
// verified mapped-source and community-report records are added to the product.
export const mappedWaterSources: MappedWaterSource[] = [];
export const communityReports: CommunityReport[] = [];

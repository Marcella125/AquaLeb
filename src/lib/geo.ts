import type { Feature, Geometry } from "geojson";
import { geoJsonNameToDataKey, type GovernorateKey } from "@/data/governorate-water";

export type GovernorateBoundaryProperties = { admin1Name?: string; admin1Pcod?: string };

function pointInRing(lng: number, lat: number, ring: number[][]) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [x, y] = ring[index];
    const [previousX, previousY] = ring[previous];
    if ((y > lat) !== (previousY > lat) && lng < ((previousX - x) * (lat - y)) / (previousY - y) + x) inside = !inside;
  }
  return inside;
}

export function featureContainsPoint(feature: Feature<Geometry, GovernorateBoundaryProperties>, lng: number, lat: number) {
  if (feature.geometry.type === "Polygon") return pointInRing(lng, lat, feature.geometry.coordinates[0]) && feature.geometry.coordinates.slice(1).every((ring) => !pointInRing(lng, lat, ring));
  if (feature.geometry.type === "MultiPolygon") return feature.geometry.coordinates.some((polygon) => pointInRing(lng, lat, polygon[0]) && polygon.slice(1).every((ring) => !pointInRing(lng, lat, ring)));
  return false;
}

export function findGovernorateKeyAtPoint(features: Feature<Geometry, GovernorateBoundaryProperties>[], lat: number, lng: number): GovernorateKey | null {
  const match = features.find((feature) => featureContainsPoint(feature, lng, lat));
  const sourceName = match?.properties?.admin1Name;
  return sourceName ? geoJsonNameToDataKey[sourceName] ?? null : null;
}


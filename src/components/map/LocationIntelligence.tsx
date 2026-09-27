"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { Check, Droplets, Layers3, Leaf, LoaderCircle, MapPin, Search } from "lucide-react";
import { PlaceSearch } from "@/components/map/PlaceSearch";
import { AGRICULTURE_BY_GOVERNORATE } from "@/data/agriculture";
import { GOVERNORATES, type GovernorateKey } from "@/data/governorate-water";
import { getRainfallAtCoordinate } from "@/data/lebanon-rainfall";
import type { PlaceRecord } from "@/data/places";
import { SOIL_LAYER_URL, type SoilProperties } from "@/data/soil";
import { findGovernorateKeyAtPoint, type GovernorateBoundaryProperties } from "@/lib/geo";

type AnalysisPhase = "idle" | "locating" | "matching" | "ready";

const briefPause = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function ReportRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="environment-report-row"><span>{label}</span><strong>{children}</strong></div>;
}

function AnalysisState({ name, phase }: { name: string; phase: AnalysisPhase }) {
  return <div className="location-analysis" aria-live="polite">
    <div className="location-analysis-heading"><LoaderCircle className="spin" size={21} /><div><span>Building environmental profile</span><strong>{name}</strong></div></div>
    <ol>
      <li className="complete"><i><Check size={12} /></i><span>Location identified</span></li>
      <li className={phase === "matching" ? "active" : ""}><i>{phase === "matching" && <LoaderCircle className="spin" size={12} />}</i><span>Matching environmental data</span></li>
      <li><i /><span>Preparing location report</span></li>
    </ol>
  </div>;
}

function EnvironmentalProfile({ place, governorateKey, soil, soilUnavailable }: { place: PlaceRecord; governorateKey: GovernorateKey | null; soil: SoilProperties | null; soilUnavailable: boolean }) {
  const governorate = governorateKey ? GOVERNORATES[governorateKey] : null;
  const rainfall = getRainfallAtCoordinate(place.lat, place.lng);
  const agriculture = governorateKey ? AGRICULTURE_BY_GOVERNORATE[governorateKey] : null;

  return <div className="environment-report" aria-live="polite">
    <header className="environment-report-identity">
      <span><MapPin size={19} /></span>
      <div><p>Selected location</p><h3>{place.name}</h3><strong>{governorate ? `${governorate.name}, Lebanon` : "Lebanon"}</strong></div>
      <small>{Math.abs(place.lat).toFixed(4)}° {place.lat >= 0 ? "N" : "S"} · {Math.abs(place.lng).toFixed(4)}° {place.lng >= 0 ? "E" : "W"}</small>
    </header>

    <section className="environment-overview" aria-labelledby="environment-overview-title">
      <div><p>Environmental overview</p><h4 id="environment-overview-title">Available context for {place.name}</h4></div>
      <dl>
        <div><dt>Annual rainfall</dt><dd>{rainfall ? `${rainfall.label} mm/year` : "Not available"}</dd></div>
        <div><dt>Mapped soil</dt><dd>{soil?.soil_class || "Not available"}</dd></div>
        <div><dt>Agricultural context</dt><dd>{agriculture && governorate ? governorate.name : "Not available"}</dd></div>
      </dl>
    </section>

    <div className="environment-report-sections">
      <section className="environment-report-section">
        <header><span className="report-icon water"><Droplets size={17} /></span><div><p>Spatial data</p><h4>Water &amp; Rainfall</h4></div></header>
        <div className="environment-report-rows">
          <ReportRow label="Annual precipitation">{rainfall ? `${rainfall.label} mm/year` : "Data not available at this coordinate"}</ReportRow>
          <ReportRow label="Data resolution">Published spatial rainfall band</ReportRow>
          <ReportRow label="Calculation value">{rainfall ? `${rainfall.annualMm.toLocaleString()} mm/year · ${rainfall.calculationBasis}` : "Not available"}</ReportRow>
        </div>
      </section>

      <section className="environment-report-section">
        <header><span className="report-icon soil"><Layers3 size={17} /></span><div><p>Spatial point query</p><h4>Soil Characteristics</h4></div></header>
        <div className="environment-report-rows">
          <ReportRow label="Classification">{soil?.soil_class || (soilUnavailable ? "Data not available at this coordinate" : "Not published")}</ReportRow>
          <ReportRow label="Soil group">{soil?.soil_group || "Not published"}</ReportRow>
          <ReportRow label="Soil unit">{soil?.soil_unit || "Not published"}</ReportRow>
        </div>
      </section>

      <section className="environment-report-section">
        <header><span className="report-icon agriculture"><Leaf size={17} /></span><div><p>Governorate data · 2010/11 census</p><h4>Agricultural Context</h4></div></header>
        <div className="environment-report-rows">
          <ReportRow label="Utilized agricultural area">{agriculture ? `${agriculture.utilizedAgriculturalAreaHa.toLocaleString()} ha` : "Data not available at this resolution"}</ReportRow>
          <ReportRow label="Irrigated area">{agriculture ? `${agriculture.irrigatedAreaHa.toLocaleString()} ha` : "Data not available at this resolution"}</ReportRow>
          <ReportRow label="Geographic scope">{agriculture && governorate ? `${governorate.name} Governorate` : "Not published"}</ReportRow>
        </div>
      </section>
    </div>

  </div>;
}

export function LocationIntelligence() {
  const boundaryFeaturesRef = useRef<Feature<Geometry, GovernorateBoundaryProperties>[]>([]);
  const soilRequestRef = useRef<AbortController | null>(null);
  const selectionTokenRef = useRef(0);
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecord | null>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState<GovernorateKey | null>(null);
  const [selectedSoil, setSelectedSoil] = useState<SoilProperties | null>(null);
  const [soilUnavailable, setSoilUnavailable] = useState(false);
  const [phase, setPhase] = useState<AnalysisPhase>("idle");

  useEffect(() => {
    let disposed = false;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    fetch(`${basePath}/data/lebanon-governorates.geojson`).then((response) => {
      if (!response.ok) throw new Error("Boundary file unavailable");
      return response.json() as Promise<FeatureCollection<Geometry, GovernorateBoundaryProperties>>;
    }).then((boundaries) => { if (!disposed) boundaryFeaturesRef.current = boundaries.features; }).catch(() => undefined);
    return () => { disposed = true; soilRequestRef.current?.abort(); };
  }, []);

  const analyzeLocation = useCallback(async (place: PlaceRecord) => {
    const token = ++selectionTokenRef.current;
    soilRequestRef.current?.abort();
    const controller = new AbortController();
    soilRequestRef.current = controller;
    const governorateKey = place.governorateKey ?? findGovernorateKeyAtPoint(boundaryFeaturesRef.current, place.lat, place.lng);
    const resolvedPlace = { ...place, governorateKey, governorate: governorateKey ? GOVERNORATES[governorateKey].name : place.governorate };

    setSelectedPlace(resolvedPlace);
    setSelectedGovernorate(governorateKey);
    setSelectedSoil(null);
    setSoilUnavailable(false);
    setPhase("locating");
    await briefPause(260);
    if (token !== selectionTokenRef.current) return;
    setPhase("matching");

    try {
      const params = new URLSearchParams({ f: "geojson", where: "1=1", geometry: `${place.lng},${place.lat}`, geometryType: "esriGeometryPoint", inSR: "4326", outSR: "4326", spatialRel: "esriSpatialRelIntersects", outFields: "objectid,code2,soil_class,soil_group,soil_unit", returnGeometry: "false", resultRecordCount: "10" });
      const [response] = await Promise.all([fetch(`${SOIL_LAYER_URL}/query?${params}`, { signal: controller.signal }), briefPause(850)]);
      if (!response.ok) throw new Error(`Soil service returned ${response.status}`);
      const result = await response.json() as FeatureCollection<Geometry, SoilProperties> & { error?: { message?: string } };
      if (result.error) throw new Error(result.error.message || "Soil query failed");
      if (token !== selectionTokenRef.current || controller.signal.aborted) return;
      setSelectedSoil(result.features[0]?.properties ?? null);
      setSoilUnavailable(!result.features.length);
    } catch (error) {
      if ((error as Error).name === "AbortError" || token !== selectionTokenRef.current) return;
      setSelectedSoil(null);
      setSoilUnavailable(true);
    }

    if (token === selectionTokenRef.current) setPhase("ready");
  }, []);

  const clearSelection = useCallback(() => {
    selectionTokenRef.current += 1;
    soilRequestRef.current?.abort();
    setSelectedPlace(null);
    setSelectedGovernorate(null);
    setSelectedSoil(null);
    setSoilUnavailable(false);
    setPhase("idle");
  }, []);

  return <section className="location-intelligence" id="location-intelligence" aria-labelledby="location-intelligence-title">
    <div className="location-intelligence-inner">
      <div className="location-intro"><div><p>Location Intelligence</p><h2 id="location-intelligence-title">Know Your Land</h2><span>Search for a location to explore the water, soil and agricultural characteristics of that area.</span></div><p>Understand the environmental context of a location before planning, building or managing land.</p></div>
      <div className="location-report-shell">
        <div className="location-search-shell"><PlaceSearch selectedPlace={selectedPlace} onSelect={(place) => void analyzeLocation(place)} onClear={clearSelection} label="SEARCH A VILLAGE, TOWN OR LOCATION IN LEBANON" placeholder="Search by village, town or location..." inputId="location-intelligence-search" /></div>
        <div className="location-report-content">
          {!selectedPlace ? <div className="location-report-empty"><span><Search size={20} /></span><p>Explore a location</p><h3>Search for a village or town in Lebanon to generate its environmental profile.</h3></div> : phase !== "ready" ? <AnalysisState name={selectedPlace.name} phase={phase} /> : <EnvironmentalProfile place={selectedPlace} governorateKey={selectedGovernorate} soil={selectedSoil} soilUnavailable={soilUnavailable} />}
        </div>
      </div>
    </div>
  </section>;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeoJSON as LeafletGeoJSON, LatLngBounds, Layer, LeafletMouseEvent, Map as LeafletMap } from "leaflet";
import { Droplets, ExternalLink, Info, Layers3, Leaf, LoaderCircle, MapPinned, Sprout } from "lucide-react";
import { AGRICULTURE_BY_GOVERNORATE, AGRICULTURE_CENSUS_SOURCE, AGRICULTURE_NATIONAL_TOTALS, AGRICULTURE_NO_DATA_COLOR, agricultureColor, agricultureLegend, agricultureValue, type AgricultureMetric } from "@/data/agriculture";
import { EXPLORER_SOURCES, type DataSourceMetadata } from "@/data/data-sources";
import { BOUNDARY_SOURCE, geoJsonNameToDataKey, GOVERNORATES, type GovernorateKey } from "@/data/governorate-water";
import { RAINFALL_BY_GOVERNORATE_KEY, RAINFALL_SCALE, RAINFALL_UNAVAILABLE_COLOR, rainfallColor } from "@/data/governorate-rainfall";
import { SOIL_CLASS_COLORS, SOIL_CLASS_ORDER, SOIL_LAYER_URL, soilColor, type SoilProperties } from "@/data/soil";
import { findGovernorateKeyAtPoint, type GovernorateBoundaryProperties } from "@/lib/geo";

type ExplorerLayer = "water" | "soil" | "agriculture";
type GovernorateProperties = GovernorateBoundaryProperties;
type SoilFeature = Feature<Geometry, SoilProperties>;
type StyledLayer = Layer & { setStyle: (style: Record<string, unknown>) => void; bringToFront: () => void; getElement?: () => SVGPathElement; feature?: SoilFeature };

const LAYER_OPTIONS: { key: ExplorerLayer; label: string; description: string; icon: typeof Droplets }[] = [
  { key: "water", label: "Water Resources", description: "Published annual precipitation", icon: Droplets },
  { key: "soil", label: "Soil Types", description: "CNRS mapped classifications", icon: Layers3 },
  { key: "agriculture", label: "Agricultural Land", description: "Official 2010/11 census", icon: Leaf },
];

function sourceStatus(source: DataSourceMetadata) {
  if (source.status === "official") return "Official data";
  if (source.status === "modelled") return "Modelled data";
  if (source.status === "derived") return "Derived by AQUALEB";
  return "Published data";
}

function governorateTooltip(key: GovernorateKey, layer: ExplorerLayer, metric: AgricultureMetric) {
  const name = GOVERNORATES[key].name;
  if (layer === "agriculture") {
    const value = agricultureValue(key, metric);
    return `<div class="explorer-map-tooltip"><strong>${name}</strong><span>${metric === "uaa" ? "Utilized agricultural area" : "Irrigated area"}</span><b>${value === null ? "Not reported" : `${value.toLocaleString()} ha`}</b></div>`;
  }
  const rainfall = RAINFALL_BY_GOVERNORATE_KEY[key];
  return `<div class="explorer-map-tooltip"><strong>${name}</strong><span>Annual precipitation</span><b>${rainfall.annualMm === null ? "Not published separately" : `${rainfall.annualMm.toLocaleString()} mm/year`}</b></div>`;
}

function GovernorateDetails({ activeLayer, selectedKey, selectedSoil }: { activeLayer: ExplorerLayer; selectedKey: GovernorateKey | null; selectedSoil: SoilProperties | null }) {
  const source = activeLayer === "water" ? EXPLORER_SOURCES.rainfall : activeLayer === "soil" ? EXPLORER_SOURCES.soil : AGRICULTURE_CENSUS_SOURCE;
  const governorate = selectedKey ? GOVERNORATES[selectedKey] : null;
  const rainfall = selectedKey ? RAINFALL_BY_GOVERNORATE_KEY[selectedKey] : null;
  const agriculture = selectedKey ? AGRICULTURE_BY_GOVERNORATE[selectedKey] : null;

  return <aside className={`explorer-detail explorer-detail-${activeLayer}`} aria-live="polite">
    <header><span><MapPinned size={18} /></span><div><p>{activeLayer === "soil" && selectedSoil ? "Selected soil polygon" : "Selected governorate"}</p><h3>{activeLayer === "soil" && selectedSoil ? selectedSoil.soil_class || "Unclassified soil" : governorate?.name ?? "Select a governorate"}</h3>{governorate && <small>{governorate.name} · {governorate.pcode}</small>}</div></header>
    {!governorate && !selectedSoil ? <div className="explorer-detail-empty"><strong>Explore the map</strong><p>Choose any governorate to inspect its supported data, source, period and status.</p></div> : <div key={`${activeLayer}-${selectedKey ?? "none"}-${selectedSoil?.objectid ?? "none"}`} className="explorer-detail-content">
      {activeLayer === "water" && governorate && rainfall && <><section className="explorer-primary-stat"><span>Annual precipitation</span>{rainfall.annualMm === null ? <strong className="unavailable">Not available</strong> : <strong>{rainfall.annualMm.toLocaleString()} <small>mm/year</small></strong>}<p>{rainfall.category}</p></section><dl className="explorer-data-grid"><div><dt>Study geography</dt><dd>{rainfall.studyGeography}</dd></div><div><dt>Reference</dt><dd>2017 publication</dd></div><div><dt>Unit</dt><dd>Millimetres per year</dd></div><div><dt>Status</dt><dd>Published study value</dd></div></dl>{rainfall.annualMm === null && <div className="explorer-caution"><Info size={16} /><p>No separate value is published for {governorate.name}. AQUALEB does not estimate one.</p></div>}</>}
      {activeLayer === "agriculture" && governorate && <>{agriculture ? <div className="agriculture-detail-values"><section><span>Utilized agricultural area</span><strong>{agriculture.utilizedAgriculturalAreaHa.toLocaleString()} <small>ha</small></strong></section><section><span>Irrigated area</span><strong>{agriculture.irrigatedAreaHa.toLocaleString()} <small>ha</small></strong></section></div> : <section className="explorer-primary-stat"><span>Agricultural census</span><strong className="unavailable">Not reported</strong><p>No value is assigned to {governorate.name} in the supplied governorate table.</p></section>}<dl className="explorer-data-grid"><div><dt>Reference period</dt><dd>2010/11</dd></div><div><dt>Unit</dt><dd>Hectares</dd></div><div><dt>Institution</dt><dd>Ministry of Agriculture / FAO</dd></div><div><dt>Status</dt><dd>Official census</dd></div></dl></>}
      {activeLayer === "soil" && <>{selectedSoil ? <><section className="explorer-primary-stat"><span>Published soil class</span><strong>{selectedSoil.soil_class || "Unclassified"}</strong><p>Mapped polygon · not a governorate-wide classification</p></section><dl className="explorer-data-grid">{selectedSoil.soil_group && <div><dt>Soil group</dt><dd>{selectedSoil.soil_group}</dd></div>}{selectedSoil.soil_unit && <div><dt>Soil unit</dt><dd>{selectedSoil.soil_unit}</dd></div>}{selectedSoil.code2 && <div><dt>Published code</dt><dd>{selectedSoil.code2}</dd></div>}<div><dt>Map scale</dt><dd>1:50,000</dd></div></dl></> : <section className="explorer-primary-stat"><span>Soil classifications</span><strong className="unavailable">Select a polygon</strong><p>Choose a colored soil polygon to inspect its published attributes.</p></section>}</>}
      <div className={`explorer-source-status status-${source.status}`}>{sourceStatus(source)}</div>
    </div>}
  </aside>;
}

function NationalSummary({ activeLayer, agricultureMetric }: { activeLayer: ExplorerLayer; agricultureMetric: AgricultureMetric }) {
  if (activeLayer === "agriculture") return <div className="explorer-national-stats" key={`${activeLayer}-${agricultureMetric}`}><div><strong>{AGRICULTURE_NATIONAL_TOTALS.utilizedAgriculturalAreaHa.toLocaleString()} ha</strong><span>Utilized agricultural area</span></div><div><strong>{AGRICULTURE_NATIONAL_TOTALS.irrigatedAreaHa.toLocaleString()} ha</strong><span>Irrigated area</span></div><div><strong>7</strong><span>Census governorate groupings</span></div><div><strong>2010/11</strong><span>Official census</span></div></div>;
  if (activeLayer === "soil") return <div className="explorer-national-stats" key={activeLayer}><div><strong>{SOIL_CLASS_ORDER.length}</strong><span>Published map classes</span></div><div><strong>1:50,000</strong><span>Map scale</span></div><div><strong>27</strong><span>Source map sheets</span></div><div><strong>CNRS</strong><span>Remote Sensing Center</span></div></div>;
  return <div className="explorer-national-stats" key={activeLayer}><div><strong>Annual precipitation</strong><span>Active comparison indicator</span></div><div><strong>mm/year</strong><span>Published unit</span></div><div><strong>2017</strong><span>Published study reference</span></div><div><strong>MEW 2024–35</strong><span>Official national sector context</span></div></div>;
}

export function GovernorateMap() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const boundsRef = useRef<LatLngBounds | null>(null);
  const boundaryLayerRef = useRef<LeafletGeoJSON | null>(null);
  const soilLayerRef = useRef<LeafletGeoJSON | null>(null);
  const polygonRefs = useRef(new Map<GovernorateKey, StyledLayer>());
  const boundaryFeaturesRef = useRef<Feature<Geometry, GovernorateProperties>[]>([]);
  const requestRef = useRef<AbortController | null>(null);
  const removeSoilTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeLayerRef = useRef<ExplorerLayer>("water");
  const agricultureMetricRef = useRef<AgricultureMetric>("uaa");
  const selectedKeyRef = useRef<GovernorateKey | null>(null);
  const [activeLayer, setActiveLayer] = useState<ExplorerLayer>("water");
  const [agricultureMetric, setAgricultureMetric] = useState<AgricultureMetric>("uaa");
  const [selectedKey, setSelectedKey] = useState<GovernorateKey | null>(null);
  const [selectedSoil, setSelectedSoil] = useState<SoilProperties | null>(null);
  const [boundaryError, setBoundaryError] = useState(false);
  const [soilStatus, setSoilStatus] = useState<"idle" | "loading" | "ready" | "empty" | "error">("idle");
  const [soilCount, setSoilCount] = useState(0);

  const selectGovernorate = useCallback((key: GovernorateKey) => { selectedKeyRef.current = key; setSelectedKey(key); }, []);
  const findGovernorate = useCallback((lat: number, lng: number) => findGovernorateKeyAtPoint(boundaryFeaturesRef.current, lat, lng) ?? undefined, []);
  const loadSoils = useCallback(async () => {
    const map = mapRef.current;
    if (!map || activeLayerRef.current !== "soil" || soilLayerRef.current) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setSoilStatus("loading");
    try {
      const bounds = (boundsRef.current ?? map.getBounds()).pad(.04);
      const envelope = { xmin: bounds.getWest(), ymin: bounds.getSouth(), xmax: bounds.getEast(), ymax: bounds.getNorth(), spatialReference: { wkid: 4326 } };
      const features: SoilFeature[] = [];
      let offset = 0;
      let more = true;
      while (more && offset < 5000) {
        const params = new URLSearchParams({ f: "geojson", where: "1=1", geometry: JSON.stringify(envelope), geometryType: "esriGeometryEnvelope", inSR: "4326", outSR: "4326", spatialRel: "esriSpatialRelIntersects", outFields: "objectid,code2,soil_class,soil_group,soil_unit", returnGeometry: "true", orderByFields: "objectid", resultOffset: String(offset), resultRecordCount: "100", geometryPrecision: "5" });
        const response = await fetch(`${SOIL_LAYER_URL}/query?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Soil service returned ${response.status}`);
        const page = await response.json() as FeatureCollection<Geometry, SoilProperties> & { exceededTransferLimit?: boolean; error?: { message?: string } };
        if (page.error) throw new Error(page.error.message || "Soil service query failed");
        features.push(...page.features);
        more = Boolean(page.exceededTransferLimit) || page.features.length === 100;
        offset += page.features.length;
        if (!page.features.length) break;
      }
      if (controller.signal.aborted || !mapRef.current || activeLayerRef.current !== "soil") return;
      const L = await import("leaflet");
      const soilLayer = L.geoJSON({ type: "FeatureCollection", features } as FeatureCollection<Geometry, SoilProperties>, {
        style: (feature) => ({ color: "#f2eee5", weight: .6, fillColor: soilColor((feature?.properties as SoilProperties | undefined)?.soil_class), fillOpacity: 0 }),
        onEachFeature: (feature: SoilFeature, layer: Layer) => {
          const properties = feature.properties;
          const vector = layer as StyledLayer;
          layer.bindTooltip(`<div class="explorer-map-tooltip soil"><strong>${properties.soil_class || "Unclassified"}</strong><span>${properties.soil_group || properties.soil_unit || "Published soil polygon"}</span></div>`, { className: "water-tooltip", direction: "top", sticky: true });
          layer.on({ mouseover: () => { vector.setStyle({ weight: 2, color: "#173d43", fillOpacity: .96 }); vector.bringToFront(); }, mouseout: () => vector.setStyle({ weight: .6, color: "#f2eee5", fillOpacity: .84 }), click: (event: LeafletMouseEvent) => { const key = findGovernorate(event.latlng.lat, event.latlng.lng); if (key) selectGovernorate(key); setSelectedSoil(properties); } });
          layer.on("add", () => { const path = vector.getElement?.(); if (!path) return; path.setAttribute("tabindex", "0"); path.setAttribute("role", "button"); path.setAttribute("aria-label", `Select ${properties.soil_class || "unclassified"} soil polygon`); });
        },
      }).addTo(map);
      soilLayerRef.current = soilLayer;
      requestAnimationFrame(() => soilLayer.setStyle({ fillOpacity: .84 }));
      setSoilCount(features.length);
      setSoilStatus(features.length ? "ready" : "empty");
    } catch (error) {
      if ((error as Error).name !== "AbortError") setSoilStatus("error");
    }
  }, [findGovernorate, selectGovernorate]);

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return;
    let disposed = false;
    const polygonIndex = polygonRefs.current;
    async function createMap() {
      const L = await import("leaflet");
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const response = await fetch(`${basePath}/data/lebanon-governorates.geojson`);
      if (!response.ok) throw new Error("Boundary file unavailable");
      const boundaries = await response.json() as FeatureCollection<Geometry, GovernorateProperties>;
      boundaryFeaturesRef.current = boundaries.features;
      if (disposed || !mapElement.current) return;
      const map = L.map(mapElement.current, { center: [33.89, 35.86], zoom: 7, minZoom: 6, maxZoom: 12, zoomSnap: .25, zoomDelta: .5, zoomControl: true, scrollWheelZoom: false, attributionControl: true });
      mapRef.current = map;
      map.attributionControl.setPrefix(false);
      map.attributionControl.addAttribution(`Boundaries: <a href="${BOUNDARY_SOURCE.url}" target="_blank" rel="noreferrer">OCHA Lebanon</a>`);
      const boundaryLayer = L.geoJSON(boundaries, {
        style: (feature) => { const name = feature?.properties?.admin1Name; const key = name ? geoJsonNameToDataKey[name] : undefined; return { color: "#f8fbfc", weight: 1.35, fillColor: key ? rainfallColor(RAINFALL_BY_GOVERNORATE_KEY[key].annualMm) : RAINFALL_UNAVAILABLE_COLOR, fillOpacity: .92 }; },
        onEachFeature: (feature: Feature<Geometry, GovernorateProperties>, layer: Layer) => {
          const sourceName = feature.properties?.admin1Name;
          if (!sourceName || !(sourceName in geoJsonNameToDataKey)) return;
          const key = geoJsonNameToDataKey[sourceName];
          const vector = layer as StyledLayer;
          polygonIndex.set(key, vector);
          layer.bindTooltip(() => governorateTooltip(key, activeLayerRef.current, agricultureMetricRef.current), { className: "water-tooltip", direction: "top", sticky: true });
          layer.on({ mouseover: () => { if (activeLayerRef.current === "soil") return; vector.setStyle({ weight: 2.4, color: "#fff", fillOpacity: 1 }); vector.bringToFront(); }, mouseout: () => { if (activeLayerRef.current === "soil") return; const selected = selectedKeyRef.current === key; vector.setStyle({ weight: selected ? 3.2 : 1.35, color: selected ? "#f3b45b" : "#f8fbfc", fillOpacity: selected ? 1 : .92 }); }, click: () => { if (activeLayerRef.current !== "soil") selectGovernorate(key); } });
          layer.on("add", () => { const path = vector.getElement?.(); if (!path) return; path.setAttribute("tabindex", "0"); path.setAttribute("role", "button"); path.setAttribute("aria-label", `Select ${GOVERNORATES[key].name}`); path.addEventListener("keydown", (event) => { if ((event.key === "Enter" || event.key === " ") && activeLayerRef.current !== "soil") { event.preventDefault(); selectGovernorate(key); } }); });
        },
      }).addTo(map);
      boundaryLayerRef.current = boundaryLayer;
      boundsRef.current = boundaryLayer.getBounds();
      const fitLebanon = () => { if (!disposed && mapElement.current) { map.invalidateSize({ pan: false }); const padding = mapElement.current.clientWidth < 700 ? 18 : 46; map.fitBounds(boundaryLayer.getBounds(), { padding: [padding, padding], maxZoom: 8.5, animate: false }); } };
      requestAnimationFrame(fitLebanon);
      const resizeObserver = new ResizeObserver(() => map.invalidateSize({ pan: false }));
      resizeObserver.observe(mapElement.current);
      map.once("unload", () => resizeObserver.disconnect());
    }
    createMap().catch(() => { if (!disposed) setBoundaryError(true); });
    return () => { disposed = true; requestRef.current?.abort(); if (removeSoilTimer.current) clearTimeout(removeSoilTimer.current); mapRef.current?.remove(); mapRef.current = null; boundaryLayerRef.current = null; soilLayerRef.current = null; polygonIndex.clear(); };
  }, [selectGovernorate]);

  useEffect(() => {
    activeLayerRef.current = activeLayer;
    agricultureMetricRef.current = agricultureMetric;
    if (removeSoilTimer.current) clearTimeout(removeSoilTimer.current);
    for (const [key, polygon] of polygonRefs.current) {
      const selected = key === selectedKey;
      const value = agricultureValue(key, agricultureMetric);
      const fillColor = activeLayer === "water" ? rainfallColor(RAINFALL_BY_GOVERNORATE_KEY[key].annualMm) : activeLayer === "agriculture" ? agricultureColor(value, agricultureMetric) : "#263f43";
      polygon.setStyle({ color: selected ? "#f3b45b" : activeLayer === "soil" ? "rgba(255,255,255,.42)" : "#f8fbfc", weight: selected ? 3.2 : activeLayer === "soil" ? .8 : 1.35, fillColor, fillOpacity: activeLayer === "soil" ? .14 : selected ? 1 : .92 });
      if (selected) polygon.bringToFront();
    }
    if (activeLayer === "soil") queueMicrotask(() => void loadSoils());
    else {
      requestRef.current?.abort();
      const soilLayer = soilLayerRef.current;
      if (soilLayer) {
        soilLayer.setStyle({ fillOpacity: 0, opacity: 0 });
        removeSoilTimer.current = setTimeout(() => { soilLayer.remove(); if (soilLayerRef.current === soilLayer) soilLayerRef.current = null; setSoilStatus("idle"); }, 380);
      }
    }
  }, [activeLayer, agricultureMetric, loadSoils, selectedKey]);

  useEffect(() => {
    selectedKeyRef.current = selectedKey;
    const selectedId = selectedSoil?.objectid;
    soilLayerRef.current?.eachLayer((layer) => {
      const vector = layer as StyledLayer;
      const isSelected = Boolean(selectedId && vector.feature?.properties?.objectid === selectedId);
      vector.setStyle({ weight: isSelected ? 3 : .6, color: isSelected ? "#fff" : "#f2eee5", fillOpacity: .84 });
      if (isSelected) vector.bringToFront();
    });
  }, [selectedKey, selectedSoil]);

  const layerDescription = activeLayer === "water" ? "Annual precipitation by supported study geography" : activeLayer === "soil" ? "Published CNRS soil classifications and spatial distribution" : "Official utilized and irrigated agricultural area";
  const activeSource = activeLayer === "water" ? EXPLORER_SOURCES.rainfall : activeLayer === "soil" ? EXPLORER_SOURCES.soil : AGRICULTURE_CENSUS_SOURCE;

  return <div className={`lebanon-explorer layer-${activeLayer}`}>
    <div className="explorer-layer-switcher" role="tablist" aria-label="Lebanon data layer">{LAYER_OPTIONS.map(({ key, label, description, icon: Icon }) => <button type="button" role="tab" aria-selected={activeLayer === key} className={activeLayer === key ? "active" : ""} key={key} onClick={() => setActiveLayer(key)}><span><Icon size={18} /></span><span><strong>{label}</strong><small>{description}</small></span></button>)}</div>
    <div className="explorer-visualization">
      <div className="explorer-map-wrap">
        <div className="explorer-map-heading"><div><span>Active layer</span><strong>{LAYER_OPTIONS.find((item) => item.key === activeLayer)?.label}</strong></div><p>{layerDescription}</p></div>
        {activeLayer === "agriculture" && <div className="agriculture-metric-toggle" role="group" aria-label="Agriculture metric"><button type="button" className={agricultureMetric === "uaa" ? "active" : ""} onClick={() => setAgricultureMetric("uaa")}>Utilized Agricultural Area</button><button type="button" className={agricultureMetric === "irrigated" ? "active" : ""} onClick={() => setAgricultureMetric("irrigated")}>Irrigated Area</button></div>}
        <div ref={mapElement} className="explorer-leaflet-map" aria-label={`Interactive Lebanon ${activeLayer} map`} />
        {boundaryError && <div className="explorer-map-message" role="alert"><MapPinned size={25} /><strong>Boundary map unavailable</strong><span>Source information remains accessible.</span></div>}
        {activeLayer === "soil" && soilStatus === "loading" && <div className="explorer-map-loading" role="status"><LoaderCircle size={18} className="spin" />Loading published soil polygons</div>}
        {activeLayer === "soil" && soilStatus === "error" && <div className="explorer-map-message" role="alert"><Info size={22} /><strong>Soil service unavailable</strong><span>The live AUB-hosted layer could not be reached.</span><button type="button" onClick={() => void loadSoils()}>Retry</button></div>}
        {activeLayer === "soil" && soilStatus === "empty" && <div className="explorer-map-message"><Sprout size={22} /><strong>No soil polygons returned</strong></div>}
        {activeLayer === "water" && <div className="explorer-legend"><div className="legend-heading"><span>Annual precipitation</span><strong>mm/year</strong></div><div className="water-legend-ramp">{RAINFALL_SCALE.map((item) => <span key={item.annualMm}><i style={{ background: item.color }} />{item.annualMm.toLocaleString()}</span>)}</div><small><i style={{ background: RAINFALL_UNAVAILABLE_COLOR }} />Not published separately</small></div>}
        {activeLayer === "agriculture" && <div className="explorer-legend"><div className="legend-heading"><span>{agricultureMetric === "uaa" ? "Utilized agricultural area" : "Irrigated area"}</span><strong>hectares</strong></div><div className="agriculture-legend-ramp">{agricultureLegend(agricultureMetric).map((item, index, scale) => <span key={item.max}><i style={{ background: item.color }} />{index === 0 ? `≤ ${item.max.toLocaleString()}` : Number.isFinite(item.max) ? `≤ ${item.max.toLocaleString()}` : `> ${scale[index - 1].max.toLocaleString()}`}</span>)}</div><small><i style={{ background: AGRICULTURE_NO_DATA_COLOR }} />Not reported</small></div>}
        {activeLayer === "soil" && <div className="explorer-legend soil"><div className="legend-heading"><span>Soil Types</span><strong>Published classes</strong></div><div>{SOIL_CLASS_ORDER.map((name) => <span key={name}><i style={{ background: SOIL_CLASS_COLORS[name] }} />{name}</span>)}</div></div>}
        <div className="explorer-map-source"><span>{activeLayer === "water" ? "Published study" : activeLayer === "soil" ? `${soilCount || "—"} mapped polygons` : "Official census"}</span><a href={activeSource.url} target="_blank" rel="noreferrer">View source <ExternalLink size={12} /></a></div>
      </div>
      <GovernorateDetails activeLayer={activeLayer} selectedKey={selectedKey} selectedSoil={selectedSoil} />
    </div>
    <NationalSummary activeLayer={activeLayer} agricultureMetric={agricultureMetric} />
    <p className="explorer-boundary-credit">Administrative boundaries: <a href={BOUNDARY_SOURCE.url} target="_blank" rel="noreferrer">{BOUNDARY_SOURCE.publisher}</a>. Data layers retain their original source geography and limitations.</p>
  </div>;
}

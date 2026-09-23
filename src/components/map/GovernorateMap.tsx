"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeoJSON as LeafletGeoJSON, LatLngBounds, Layer, Map as LeafletMap } from "leaflet";
import { Accessibility, Droplets, ExternalLink, Info, Layers3, MapPinned, Toilet, UsersRound, Waves } from "lucide-react";
import { communityReports, mappedWaterSources } from "@/data/community-records";
import {
  BOUNDARY_SOURCE, CATEGORY_DEFAULTS, CATEGORY_LABELS, DATA_SOURCES, geoJsonNameToDataKey,
  GOVERNORATE_ORDER, GOVERNORATES, INDICATORS, indicatorsForCategory, METRICS,
  type GovernorateKey, type MetricCategory, type MetricKey,
} from "@/data/governorate-water";

type GovernorateProperties = { admin1Name?: string; admin1Pcod?: string };

const categories: { key: MetricCategory; icon: typeof Droplets }[] = [
  { key: "source", icon: Droplets }, { key: "access", icon: Accessibility }, { key: "sanitation", icon: Toilet },
];
const colorStops = [
  { max: 20, color: "#dcefff" }, { max: 40, color: "#acd8f5" }, { max: 60, color: "#6ebce8" },
  { max: 80, color: "#2d8fca" }, { max: Infinity, color: "#0b5b99" },
];
const noDataColor = "#e8e5dd";
const mobileLabelOffsets: Partial<Record<GovernorateKey, [number, number]>> = {
  beirut: [-18, 0],
  mount_lebanon: [18, 0],
  south_lebanon: [-12, 0],
  nabatieh: [12, 0],
};

function colorFor(value: number | undefined) {
  if (value == null) return noDataColor;
  return colorStops.find((stop) => value <= stop.max)?.color ?? colorStops.at(-1)!.color;
}

function tooltipContent(key: GovernorateKey, metricKey: MetricKey) {
  const value = METRICS[metricKey].values[key];
  return `<div class="atlas-tooltip"><strong>${GOVERNORATES[key].name}</strong><span>${value ? `${value.value.toFixed(1)}%${value.incomplete ? " · partial coverage" : ""}` : "Not available"}</span></div>`;
}

function mobileValueContent(key: GovernorateKey, metricKey: MetricKey) {
  const value = METRICS[metricKey].values[key];
  return `<div class="map-value-label">${value ? `${value.value.toFixed(1)}%` : "N/A"}</div>`;
}

function DetailPanel({ governorateKey, metricKey }: { governorateKey: GovernorateKey | null; metricKey: MetricKey }) {
  if (!governorateKey) {
    return (
      <aside className="atlas-detail atlas-detail-empty" aria-live="polite">
        <span className="governorate-mark" aria-hidden="true"><MapPinned size={26} /></span>
        <p className="detail-kicker">Governorate details</p>
        <h2>Select a governorate</h2>
        <p>Choose any shape on the map or a bar in the comparison to see its exact indicator definition, survey year, unit, population basis and source.</p>
      </aside>
    );
  }
  const governorate = GOVERNORATES[governorateKey];
  const metric = METRICS[metricKey];
  const value = metric.values[governorateKey];
  const source = DATA_SOURCES[metric.source];
  const officialIndicators = INDICATORS.filter((item) => item.values[governorateKey]);
  const mappedCount = mappedWaterSources.filter((item) => item.governorate === governorateKey).length;
  const reportCount = communityReports.filter((item) => item.governorate === governorateKey).length;

  return (
    <aside className="atlas-detail" aria-labelledby="atlas-detail-title">
      <div className="detail-heading">
        <span className="governorate-mark" aria-hidden="true"><MapPinned size={24} /></span>
        <div><p>Governorate · {governorate.pcode}</p><h2 id="atlas-detail-title">{governorate.name}</h2></div>
      </div>

      <section className="featured-indicator">
        <p className="detail-kicker">Selected indicator</p>
        {value ? <strong>{value.value.toFixed(1)}<small>%</small></strong> : <strong className="unavailable-value">Not available</strong>}
        <h3>{metric.name}</h3>
        {value?.incomplete && <span className="coverage-tag">Partial geographic coverage</span>}
        {value?.precisionWarning && <span className="coverage-tag neutral">High relative standard error</span>}
      </section>

      <dl className="indicator-meta">
        <div><dt>Survey year</dt><dd>{metric.year}</dd></div>
        <div><dt>Unit</dt><dd>Percent</dd></div>
        <div><dt>Population / household basis</dt><dd>{metric.basis}</dd></div>
        <div><dt>Geography</dt><dd>{metric.geography}</dd></div>
      </dl>

      <div className="definition-card"><Info size={17} /><p><strong>Exact definition</strong>{metric.definition}</p></div>
      <a className="direct-source" href={source.url} target="_blank" rel="noreferrer"><span><b>{source.shortTitle}</b>{metric.sourceTable} · {source.publisher}</span><ExternalLink size={16} /></a>

      <section className="available-indicators">
        <div className="subsection-title"><h3>Available official indicators</h3><span>{officialIndicators.length}</span></div>
        <div className="indicator-list">{INDICATORS.map((item) => {
          const itemValue = item.values[governorateKey];
          return <div className="indicator-row" key={item.key}><span><i style={{ background: colorFor(itemValue?.value) }} />{item.shortLabel}<small>{item.year} · {item.sourceTable}</small></span><strong>{itemValue ? `${itemValue.value.toFixed(1)}%` : "—"}</strong></div>;
        })}</div>
      </section>

      <section className="community-layer-card">
        <div><UsersRound size={18} /><span><strong>Community layer</strong><small>Separate from official survey indicators</small></span></div>
        <p>{mappedCount} mapped sources · {reportCount} community reports</p>
      </section>
    </aside>
  );
}

function ComparisonChart({ metricKey, selectedKey, onSelect }: { metricKey: MetricKey; selectedKey: GovernorateKey | null; onSelect: (key: GovernorateKey) => void }) {
  const metric = METRICS[metricKey];
  const availableCount = GOVERNORATE_ORDER.filter((key) => metric.values[key]).length;
  return (
    <section className="comparison-panel" aria-labelledby="comparison-title">
      <div className="comparison-heading"><div><p className="detail-kicker">Eight-governorate comparison</p><h2 id="comparison-title">{metric.shortLabel}</h2></div><p>{metric.coverage === "all" ? "Comparable definition and year across all eight governorates." : `${availableCount} of 8 governorates reported. Missing governorates remain unranked.`}</p></div>
      <div className="comparison-bars">{GOVERNORATE_ORDER.map((key) => {
        const value = metric.values[key];
        return <button type="button" key={key} onClick={() => onSelect(key)} className={key === selectedKey ? "selected" : ""} aria-label={`Select ${GOVERNORATES[key].name}`}>
          <span className="bar-value">{value ? `${value.value.toFixed(1)}%` : "N/A"}</span>
          <span className="bar-track"><i style={{ "--bar-size": value ? `${Math.max(value.value, 4)}%` : "4%", height: "var(--bar-size)", background: value ? colorFor(value.value) : noDataColor } as CSSProperties} /></span>
          <span className="bar-name">{GOVERNORATES[key].name.replace(" Lebanon", "")}</span>
        </button>;
      })}</div>
      <p className="comparison-note">No values from different survey years or definitions are combined in this comparison.</p>
    </section>
  );
}

export function GovernorateMap() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const boundsRef = useRef<LatLngBounds | null>(null);
  const polygonRefs = useRef(new Map<GovernorateKey, Layer>());
  const [category, setCategory] = useState<MetricCategory>("source");
  const [metricKey, setMetricKey] = useState<MetricKey>("piped");
  const [selectedKey, setSelectedKey] = useState<GovernorateKey | null>(null);
  const [hoveredKey, setHoveredKey] = useState<GovernorateKey | null>(null);
  const [boundaryError, setBoundaryError] = useState(false);
  const metric = METRICS[metricKey];
  const categoryMetrics = useMemo(() => indicatorsForCategory(category), [category]);

  const chooseGovernorate = useCallback((key: GovernorateKey) => setSelectedKey(key), []);
  const chooseCategory = (next: MetricCategory) => { setCategory(next); setMetricKey(CATEGORY_DEFAULTS[next]); };

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return;
    let disposed = false;
    const polygonIndex = polygonRefs.current;

    async function createMap() {
      const L = await import("leaflet");
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const response = await fetch(`${basePath}/data/lebanon-governorates.geojson`);
      if (!response.ok) throw new Error("Boundary file unavailable");
      const boundaries = (await response.json()) as FeatureCollection<Geometry, GovernorateProperties>;
      if (disposed || !mapElement.current) return;
      const map = L.map(mapElement.current, { center: [33.89, 35.86], zoom: 7, minZoom: 6, maxZoom: 11, zoomSnap: .25, zoomDelta: .5, zoomControl: true, scrollWheelZoom: false, attributionControl: true });
      mapRef.current = map;
      map.attributionControl.setPrefix(false);
      map.attributionControl.addAttribution(`Boundaries: <a href="${BOUNDARY_SOURCE.url}" target="_blank" rel="noreferrer">OCHA Lebanon</a>`);
      const mobileLabels = window.matchMedia("(max-width: 780px)").matches;

      const layer = L.geoJSON(boundaries, {
        style: (feature) => {
          const sourceName = feature?.properties?.admin1Name;
          const key = sourceName && geoJsonNameToDataKey[sourceName];
          return { color: "#f7fbfa", weight: 1.25, fillColor: colorFor(key ? METRICS.piped.values[key]?.value : undefined), fillOpacity: .9 };
        },
        onEachFeature: (feature: Feature<Geometry, GovernorateProperties>, polygon: Layer) => {
          const sourceName = feature.properties?.admin1Name;
          if (!sourceName || !(sourceName in geoJsonNameToDataKey)) return;
          const key = geoJsonNameToDataKey[sourceName];
          polygonIndex.set(key, polygon);
          polygon.bindTooltip(mobileLabels ? mobileValueContent(key, "piped") : tooltipContent(key, "piped"), { className: mobileLabels ? "mobile-value-tooltip" : "water-tooltip", direction: mobileLabels ? "center" : "top", offset: mobileLabels ? (mobileLabelOffsets[key] ?? [0, 0]) : [0, 0], permanent: mobileLabels, sticky: !mobileLabels, opacity: 1 });
          if (mobileLabels) polygon.on({ click: () => chooseGovernorate(key) });
          else polygon.on({ mouseover: () => { setHoveredKey(key); polygon.openTooltip(); }, mouseout: () => setHoveredKey((current) => current === key ? null : current), click: () => chooseGovernorate(key) });
          polygon.on("add", () => {
            const path = (polygon as LeafletGeoJSON as unknown as { getElement?: () => SVGPathElement }).getElement?.();
            if (!path) return;
            path.setAttribute("tabindex", "0"); path.setAttribute("role", "button"); path.setAttribute("aria-label", `Select ${GOVERNORATES[key].name}`);
            path.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseGovernorate(key); } });
          });
        },
      }).addTo(map);
      const lebanonBounds = layer.getBounds();
      boundsRef.current = lebanonBounds;
      const fitLebanon = () => {
        if (disposed || !mapElement.current || mapRef.current !== map) return;
        map.invalidateSize({ pan: false });
        const padding = mapElement.current.clientWidth < 600 ? 20 : 44;
        map.fitBounds(lebanonBounds, { padding: [padding, padding], maxZoom: 8.5, animate: false });
      };
      requestAnimationFrame(fitLebanon);
      const resizeObserver = new ResizeObserver(() => requestAnimationFrame(fitLebanon));
      resizeObserver.observe(mapElement.current);
      map.once("unload", () => resizeObserver.disconnect());
    }

    createMap().catch(() => { if (!disposed) setBoundaryError(true); });
    return () => { disposed = true; mapRef.current?.remove(); mapRef.current = null; polygonIndex.clear(); };
  }, [chooseGovernorate]);

  useEffect(() => {
    for (const [key, layer] of polygonRefs.current) {
      const vector = layer as Layer & { setStyle: (style: Record<string, unknown>) => void; bringToFront: () => void; setTooltipContent: (content: string) => void; getElement?: () => SVGPathElement };
      const selected = key === selectedKey;
      const hovered = key === hoveredKey;
      const mobileLabels = window.matchMedia("(max-width: 780px)").matches;
      vector.setTooltipContent(mobileLabels ? mobileValueContent(key, metricKey) : tooltipContent(key, metricKey));
      vector.setStyle({ color: selected ? "#f0a43b" : hovered ? "#064f86" : "#f7fbfa", weight: selected ? 3.5 : hovered ? 2.25 : 1.25, fillColor: colorFor(metric.values[key]?.value), fillOpacity: selected ? 1 : hovered ? .96 : .9 });
      vector.getElement?.()?.classList.toggle("is-selected", selected);
      if (hovered || selected) vector.bringToFront();
    }
    if (selectedKey) (polygonRefs.current.get(selectedKey) as Layer & { bringToFront?: () => void } | undefined)?.bringToFront?.();
  }, [hoveredKey, selectedKey, metric, metricKey]);

  return (
    <div className="atlas-explorer">
      <div className="atlas-controls">
        <div className="category-tabs" role="tablist" aria-label="Indicator category">{categories.map(({ key, icon: Icon }) => <button type="button" role="tab" aria-selected={category === key} className={category === key ? "active" : ""} key={key} onClick={() => chooseCategory(key)}><Icon size={17} />{CATEGORY_LABELS[key]}</button>)}</div>
        <div className="metric-pills" aria-label="Indicators in selected category">{categoryMetrics.map((item) => <button type="button" key={item.key} className={metricKey === item.key ? "active" : ""} onClick={() => setMetricKey(item.key)}>{item.shortLabel}<span>{item.year}</span></button>)}</div>
        <div className="current-metric"><span className="metric-swatch" style={{ background: selectedKey ? colorFor(metric.values[selectedKey]?.value) : colorStops[2].color }} /><p><strong>{metric.name}</strong><span>{metric.year} · {metric.coverage === "all" ? "All eight governorates" : "Partial survey coverage"} · {metric.basis}</span></p></div>
      </div>

      <div className="atlas-main-grid">
        <section className="atlas-map-card" aria-label="Interactive Lebanon governorate map">
          <div ref={mapElement} className="leaflet-map" />
          {boundaryError && <div className="boundary-fallback" role="alert"><MapPinned size={31} /><strong>Boundary map unavailable</strong><span>The indicator records and comparison remain available below.</span></div>}
          <div className="map-status"><Layers3 size={15} /><span className="status-desktop">OCHA boundaries · quiet map</span><span className="status-mobile">OCHA boundaries</span></div>
          <div className="map-legend"><strong>{metric.shortLabel}</strong><div className="legend-gradient" /><p><span>0%</span><span>100%</span></p><small><i /> No published value</small></div>
          <div className="community-map-label"><UsersRound size={14} />Community sources: separate layer · {mappedWaterSources.length} records</div>
        </section>
        <DetailPanel governorateKey={selectedKey} metricKey={metricKey} />
      </div>

      <ComparisonChart metricKey={metricKey} selectedKey={selectedKey} onSelect={setSelectedKey} />
      <div className="atlas-attribution"><Waves size={17} /><p>Survey indicators: <a href={DATA_SOURCES[metric.source].url} target="_blank" rel="noreferrer">{DATA_SOURCES[metric.source].shortTitle}</a>. Boundaries: <a href={BOUNDARY_SOURCE.url} target="_blank" rel="noreferrer">{BOUNDARY_SOURCE.publisher}</a>. Boundary-first map with no road tiles. Community reports are stored and displayed separately.</p></div>
    </div>
  );
}

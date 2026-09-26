"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeoJSON as LeafletGeoJSON, LatLngBounds, Layer, LeafletMouseEvent, Map as LeafletMap } from "leaflet";
import { Accessibility, Droplets, ExternalLink, Info, Layers3, Leaf, LoaderCircle, MapPin, MapPinned, RotateCcw, Sprout, Toilet, UsersRound, Waves } from "lucide-react";
import { PlaceSearch } from "@/components/map/PlaceSearch";
import { LAND_COVER_CLASSES, LAND_COVER_SERVICE_URL, LAND_COVER_SOURCE, type LandCoverResult } from "@/data/agriculture";
import { communityReports, mappedWaterSources } from "@/data/community-records";
import { BOUNDARY_SOURCE, CATEGORY_DEFAULTS, CATEGORY_LABELS, DATA_SOURCES, geoJsonNameToDataKey, GOVERNORATES, INDICATORS, indicatorsForCategory, METRICS, type GovernorateKey, type MetricCategory, type MetricKey } from "@/data/governorate-water";
import { RAINFALL_BY_GOVERNORATE_KEY, RAINFALL_SCALE, RAINFALL_SOURCE, RAINFALL_UNAVAILABLE_COLOR, rainfallColor } from "@/data/governorate-rainfall";
import { SOIL_CLASS_COLORS, SOIL_CLASS_ORDER, SOIL_LAYER_URL, SOIL_SOURCE, soilColor, type SoilProperties } from "@/data/soil";
import type { PlaceRecord } from "@/data/places";

type AtlasMode = "water" | "soil";
type ResultTab = "water" | "land" | "soil";
type GovernorateProperties = { admin1Name?: string; admin1Pcod?: string };
const categories: { key: MetricCategory; icon: typeof Droplets }[] = [{ key: "source", icon: Droplets }, { key: "access", icon: Accessibility }, { key: "sanitation", icon: Toilet }];
const colorStops = [{ max: 20, color: "#dcefff" }, { max: 40, color: "#acd8f5" }, { max: 60, color: "#6ebce8" }, { max: 80, color: "#2d8fca" }, { max: Infinity, color: "#0b5b99" }];
const noDataColor = "#e8e5dd";

function pointInRing(lng: number, lat: number, ring: number[][]) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [x, y] = ring[index];
    const [previousX, previousY] = ring[previous];
    if ((y > lat) !== (previousY > lat) && lng < ((previousX - x) * (lat - y)) / (previousY - y) + x) inside = !inside;
  }
  return inside;
}

function featureContainsPoint(feature: Feature<Geometry, GovernorateProperties>, lng: number, lat: number) {
  if (feature.geometry.type === "Polygon") return pointInRing(lng, lat, feature.geometry.coordinates[0]) && feature.geometry.coordinates.slice(1).every((ring) => !pointInRing(lng, lat, ring));
  if (feature.geometry.type === "MultiPolygon") return feature.geometry.coordinates.some((polygon) => pointInRing(lng, lat, polygon[0]) && polygon.slice(1).every((ring) => !pointInRing(lng, lat, ring)));
  return false;
}

function colorFor(value: number | undefined) {
  if (value == null) return noDataColor;
  return colorStops.find((stop) => value <= stop.max)?.color ?? colorStops.at(-1)!.color;
}
function governorateLabelContent(key: GovernorateKey) {
  const rainfall = RAINFALL_BY_GOVERNORATE_KEY[key];
  const name = GOVERNORATES[key].name.replace("Baalbek-Hermel", "Baalbek–Hermel");
  return `<div class="map-governorate-label rainfall-map-label"><strong>${name}</strong><span>Annual rainfall: ${rainfall.annualMm !== null ? `${rainfall.annualMm.toLocaleString()} mm/year` : "Unavailable"}</span><small>${rainfall.category}</small></div>`;
}
function soilTooltipContent(properties: SoilProperties) {
  return `<div class="atlas-tooltip soil-tooltip"><strong>${properties.soil_class || "Unclassified polygon"}</strong><span>${properties.soil_unit || properties.soil_group || "No soil unit published"}</span></div>`;
}

// Kept temporarily as a reference for the legacy water-only presentation.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function WaterDetailPanel({ governorateKey, metricKey, place }: { governorateKey: GovernorateKey | null; metricKey: MetricKey; place: PlaceRecord | null }) {
  if (!governorateKey) return <aside className="atlas-detail atlas-detail-empty" aria-live="polite"><span className="governorate-mark" aria-hidden="true"><MapPinned size={26} /></span><p className="detail-kicker">Governorate details</p><h2>Select a governorate</h2><p>Choose any shape on the map or a bar in the comparison to see its exact indicator definition, survey year, unit, population basis and source.</p></aside>;
  const governorate = GOVERNORATES[governorateKey];
  const metric = METRICS[metricKey];
  const value = metric.values[governorateKey];
  const source = DATA_SOURCES[metric.source];
  const officialIndicators = INDICATORS.filter((item) => item.values[governorateKey]);
  const mappedCount = mappedWaterSources.filter((item) => item.governorate === governorateKey).length;
  const reportCount = communityReports.filter((item) => item.governorate === governorateKey).length;
  return <aside className="atlas-detail" aria-labelledby="atlas-detail-title">
    {place && <div className="place-detail-banner"><MapPin size={17} /><span><strong>{place.name}</strong><small>{[place.district, place.governorate].filter(Boolean).join(" · ")}</small></span></div>}
    <div className="detail-heading"><span className="governorate-mark" aria-hidden="true"><MapPinned size={24} /></span><div><p>Governorate · {governorate.pcode}</p><h2 id="atlas-detail-title">{governorate.name}</h2></div></div>
    <section className="featured-indicator"><p className="detail-kicker">Governorate statistic · not a village measurement</p>{value ? <strong>{value.value.toFixed(1)}<small>%</small></strong> : <strong className="unavailable-value">Not available</strong>}<h3>{metric.name}</h3>{value?.incomplete && <span className="coverage-tag">Partial geographic coverage</span>}{value?.precisionWarning && <span className="coverage-tag neutral">High relative standard error</span>}</section>
    <dl className="indicator-meta"><div><dt>Survey year</dt><dd>{metric.year}</dd></div><div><dt>Unit</dt><dd>Percent</dd></div><div><dt>Population / household basis</dt><dd>{metric.basis}</dd></div><div><dt>Geography</dt><dd>{metric.geography}</dd></div></dl>
    <div className="definition-card"><Info size={17} /><p><strong>Exact definition</strong>{metric.definition}</p></div>
    <a className="direct-source" href={source.url} target="_blank" rel="noreferrer"><span><b>{source.shortTitle}</b>{metric.sourceTable} · {source.publisher}</span><ExternalLink size={16} /></a>
    <section className="available-indicators"><div className="subsection-title"><h3>Available official indicators</h3><span>{officialIndicators.length}</span></div><div className="indicator-list">{INDICATORS.map((item) => { const itemValue = item.values[governorateKey]; return <div className="indicator-row" key={item.key}><span><i style={{ background: colorFor(itemValue?.value) }} />{item.shortLabel}<small>{item.year} · {item.sourceTable}</small></span><strong>{itemValue ? `${itemValue.value.toFixed(1)}%` : "—"}</strong></div>; })}</div></section>
    <section className="community-layer-card"><div><UsersRound size={18} /><span><strong>Community layer</strong><small>Separate from official survey indicators</small></span></div><p>{mappedCount} mapped sources · {reportCount} community reports</p></section>
  </aside>;
}

// Kept temporarily as a reference for the legacy soil-only presentation.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SoilDetailPanel({ soil, place, pointStatus, selectionKind, matchCount }: { soil: SoilProperties | null; place: PlaceRecord | null; pointStatus: "idle" | "loading" | "none" | "error"; selectionKind: "point" | "polygon" | null; matchCount: number }) {
  if (pointStatus === "loading" && place) return <aside className="atlas-detail atlas-detail-empty soil-detail-empty" aria-live="polite"><LoaderCircle size={28} className="spin" /><p className="detail-kicker">Soil at selected point</p><h2>{place.name}</h2><p>Checking the AUB soil layer at this place coordinate…</p></aside>;
  if ((pointStatus === "none" || pointStatus === "error") && place) return <aside className="atlas-detail atlas-detail-empty soil-detail-empty" aria-live="polite"><span className="governorate-mark soil-mark" aria-hidden="true"><MapPin size={26} /></span><p className="detail-kicker">Soil at selected point</p><h2>{place.name}</h2><p>{pointStatus === "none" ? "No mapped soil result at this point." : "The soil service could not be queried for this point. The place marker remains available on the map."}</p><small className="soil-point-note">A place coordinate is a point reference and does not describe the whole village or city.</small></aside>;
  if (!soil) return <aside className="atlas-detail atlas-detail-empty soil-detail-empty" aria-live="polite"><span className="governorate-mark soil-mark" aria-hidden="true"><Sprout size={26} /></span><p className="detail-kicker">Soil polygon details</p><h2>Select a soil polygon</h2><p>Search for a place or choose a polygon on the map. Nearby polygons remain available for inspection.</p></aside>;
  const pointResult = selectionKind === "point" && place;
  return <aside className="atlas-detail soil-detail" aria-labelledby="soil-detail-title">
    <div className="detail-heading"><span className="governorate-mark soil-mark" style={{ background: soilColor(soil.soil_class) }} aria-hidden="true"><Sprout size={24} /></span><div><p>{pointResult ? "Soil at selected point" : place ? "Nearby polygon" : "Selected soil polygon"}</p><h2 id="soil-detail-title">{pointResult ? place.name : soil.soil_class || "Unclassified"}</h2></div></div>
    <section className="soil-result-class"><span>Published soil class</span><strong>{soil.soil_class || "Not published"}</strong></section>
    {pointResult && <p className="soil-point-note">This is the polygon intersecting the selected GeoNames coordinate, not the soil type of the whole village or city.{matchCount > 1 ? ` ${matchCount} polygons intersect the point; the first result is shown.` : ""}</p>}
    <section className="soil-names"><p><span>Soil group</span><strong>{soil.soil_group || "Not published"}</strong></p><p><span>Soil unit</span><strong>{soil.soil_unit || "Not published"}</strong></p>{soil.code2 && <p><span>Published code</span><strong>{soil.code2}</strong></p>}</section>
    <div className="soil-water-meaning"><Droplets size={18} /><p><strong>What this may mean for water movement</strong>The published class can guide questions about texture, depth, structure and drainage. Coarser texture can allow faster movement, while finer texture can retain water longer; shallow profiles may store less water for roots. This is general guidance, not a measured infiltration rate, recharge value or irrigation prescription.</p></div>
    <div className="definition-card soil-caution"><Info size={17} /><p><strong>Source attributes shown</strong>Only meaningful text attributes are displayed. Numeric fields are omitted because the service metadata does not define their units.</p></div>
    <a className="direct-source" href={SOIL_LAYER_URL} target="_blank" rel="noreferrer"><span><b>AUB hosted Soils layer</b>Polygon {soil.objectid ?? "record"} · {SOIL_SOURCE.publisher}</span><ExternalLink size={16} /></a>
  </aside>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyCombinedDetailsPanel({ governorateKey, metricKey, category, categoryMetrics, place, agriculture, agricultureStatus, soil, pointStatus, selectionKind, matchCount, onCategory, onMetric }: { governorateKey: GovernorateKey | null; metricKey: MetricKey; category: MetricCategory; categoryMetrics: ReturnType<typeof indicatorsForCategory>; place: PlaceRecord | null; agriculture: LandCoverResult | null; agricultureStatus: "idle" | "loading" | "none" | "error"; soil: SoilProperties | null; pointStatus: "idle" | "loading" | "none" | "error"; selectionKind: "point" | "polygon" | null; matchCount: number; onCategory: (category: MetricCategory) => void; onMetric: (metric: MetricKey) => void }) {
  const governorate = governorateKey ? GOVERNORATES[governorateKey] : null;
  const metric = METRICS[metricKey];
  const value = governorateKey ? metric.values[governorateKey] : undefined;
  const source = DATA_SOURCES[metric.source];
  return <aside className="atlas-detail combined-detail" aria-labelledby="atlas-detail-title" aria-live="polite">
    <div className="detail-heading"><span className="governorate-mark" aria-hidden="true"><MapPin size={24} /></span><div><p>Selected location</p><h2 id="atlas-detail-title">{place?.name ?? governorate?.name ?? "Choose a place"}</h2>{place && <small>{[place.district, place.governorate].filter(Boolean).join(" · ")}</small>}</div></div>
    <section className="combined-detail-section agriculture-detail" aria-labelledby="agriculture-detail-title"><div className="combined-section-heading"><span><Sprout size={18} /></span><div><p className="detail-kicker">Satellite-classified land cover</p><h3 id="agriculture-detail-title">Agriculture</h3></div></div>{!place ? <div className="section-state"><strong>Select a place or point</strong><p>The 2023 land-cover raster will be sampled at its coordinate.</p></div> : agricultureStatus === "loading" ? <div className="section-state"><LoaderCircle size={18} className="spin" /><strong>Checking land cover…</strong></div> : agricultureStatus === "error" ? <div className="section-state section-error"><strong>Land-cover service unavailable</strong><p>The water and soil sections remain available.</p></div> : agricultureStatus === "none" || !agriculture ? <div className="section-state section-unavailable"><strong>Agricultural land-cover data not available for this location</strong><p>No classified pixel was returned at the selected point.</p></div> : <><div className={`land-cover-result${agriculture.agricultural ? " is-crops" : ""}`}><span>Land-cover classification at selected point</span><strong>{agriculture.label}</strong><small>{agriculture.agricultural ? "The source classifies this 10 m pixel as Crops." : "This pixel is not classified as Crops in this dataset."}</small></div><dl className="indicator-meta land-cover-meta"><div><dt>Observation year</dt><dd>{LAND_COVER_SOURCE.observationYear}</dd></div><div><dt>Resolution</dt><dd>{LAND_COVER_SOURCE.resolution}</dd></div><div><dt>Source type</dt><dd>Satellite-derived classification</dd></div><div><dt>Geography</dt><dd>Selected point / raster pixel</dd></div></dl><div className="definition-card"><Info size={17} /><p><strong>Interpretation limit</strong>This is a modelled land-cover class, not field verification, a crop type, farm boundary, cultivation history, or current agricultural activity.</p></div><a className="direct-source" href={LAND_COVER_SOURCE.url} target="_blank" rel="noreferrer"><span><b>{LAND_COVER_SOURCE.title}</b>{LAND_COVER_SOURCE.publisher}</span><ExternalLink size={16} /></a></>}</section>
    <section className="combined-detail-section water-detail" aria-labelledby="water-detail-title"><div className="combined-section-heading"><span><Droplets size={18} /></span><div><p className="detail-kicker">Governorate-level figures</p><h3 id="water-detail-title">Water</h3></div></div>
      <div className="detail-indicator-controls"><div className="category-tabs" role="tablist" aria-label="Water indicator category">{categories.map(({ key, icon: Icon }) => <button type="button" role="tab" aria-selected={category === key} className={category === key ? "active" : ""} key={key} onClick={() => onCategory(key)}><Icon size={14} />{key === "source" ? "Water source" : CATEGORY_LABELS[key]}</button>)}</div><div className="metric-pills" aria-label="Water indicators">{categoryMetrics.map((item) => <button type="button" key={item.key} className={metricKey === item.key ? "active" : ""} onClick={() => onMetric(item.key)}>{item.shortLabel}<span>{item.year}</span></button>)}</div></div>
      {!governorate ? <div className="section-state"><strong>Select a place or point</strong><p>The map will identify its governorate and show the existing AquaLeb indicator.</p></div> : <><section className="featured-indicator"><p className="detail-kicker">{governorate.name} · not a village measurement</p>{value ? <strong>{value.value.toFixed(1)}<small>%</small></strong> : <strong className="unavailable-value">Not available</strong>}<h3>{metric.name}</h3>{value?.incomplete && <span className="coverage-tag">Partial geographic coverage</span>}{value?.precisionWarning && <span className="coverage-tag neutral">High relative standard error</span>}</section><dl className="indicator-meta"><div><dt>Survey year</dt><dd>{metric.year}</dd></div><div><dt>Unit</dt><dd>Percent</dd></div><div><dt>Geography</dt><dd>{metric.geography}</dd></div><div><dt>Basis</dt><dd>{metric.basis}</dd></div></dl><div className="definition-card"><Info size={17} /><p><strong>Definition</strong>{metric.definition}</p></div><a className="direct-source" href={source.url} target="_blank" rel="noreferrer"><span><b>{source.shortTitle}</b>{metric.sourceTable} · {source.publisher}</span><ExternalLink size={16} /></a></>}
    </section>
    <section className="combined-detail-section soil-detail" aria-labelledby="soil-detail-title"><div className="combined-section-heading"><span className="soil-mark"><Sprout size={18} /></span><div><p className="detail-kicker">Point-query result</p><h3 id="soil-detail-title">Soil at selected point</h3></div></div>
      {!place ? <div className="section-state"><strong>Select a place or point</strong><p>The AUB layer will be queried independently of the visible map layer.</p></div> : pointStatus === "loading" ? <div className="section-state"><LoaderCircle size={18} className="spin" /><strong>Checking the AUB soil layer…</strong></div> : pointStatus === "error" ? <div className="section-state section-error"><strong>Soil service unavailable</strong><p>The place and water result remain selected.</p></div> : pointStatus === "none" ? <div className="section-state"><strong>No mapped soil result at this point</strong><p>The marker remains visible; nearby polygons can still be inspected in Soil view.</p></div> : soil ? <><section className="soil-result-class"><span>Published soil class</span><strong>{soil.soil_class || "Not published"}</strong></section><p className="soil-point-note">{selectionKind === "polygon" ? "Polygon selected on the map." : "This is the polygon intersecting the selected coordinate, not the soil type of the whole village or city."}{matchCount > 1 ? ` ${matchCount} polygons intersect this point; the first is shown.` : ""}</p><section className="soil-names">{soil.soil_group && <p><span>Soil group</span><strong>{soil.soil_group}</strong></p>}{soil.soil_unit && <p><span>Soil unit</span><strong>{soil.soil_unit}</strong></p>}{soil.code2 && <p><span>Published code</span><strong>{soil.code2}</strong></p>}</section><div className="soil-water-meaning"><Droplets size={18} /><p><strong>General explanation · not a measurement</strong>Texture and depth can influence infiltration, plant-available storage and runoff, alongside slope, structure, vegetation and rainfall. The published class is not an infiltration rate, recharge percentage, groundwater level or irrigation requirement.</p></div><div className="definition-card soil-caution"><Info size={17} /><p><strong>Source attributes shown</strong>Only meaningful text attributes are displayed. Numeric fields are omitted because the service metadata does not define their units.</p></div><a className="direct-source" href={SOIL_LAYER_URL} target="_blank" rel="noreferrer"><span><b>AUB hosted Soils layer</b>Polygon {soil.objectid ?? "record"} · {SOIL_SOURCE.publisher}</span><ExternalLink size={16} /></a></> : <div className="section-state"><strong>No soil result loaded</strong><p>Choose a place or point to query this section.</p></div>}
    </section>
  </aside>;
}

function waterResultHeadline(metricKey: MetricKey, value: number) {
  if (metricKey === "piped") return `${value.toFixed(1)}% of primary residences use piped drinking-water supplies`;
  if (metricKey === "non_piped") return `${value.toFixed(1)}% of primary residences use non-piped drinking-water supplies`;
  if (metricKey === "no_facility") return `${value.toFixed(1)}% of primary residences report no drinking-water facility`;
  return `${value.toFixed(1)}% — ${METRICS[metricKey].name}`;
}

function CombinedDetailsPanel({ governorateKey, metricKey, category, categoryMetrics, place, agriculture, agricultureStatus, soil, pointStatus, selectionKind, matchCount, activeTab, onTab, onCategory, onMetric }: { governorateKey: GovernorateKey | null; metricKey: MetricKey; category: MetricCategory; categoryMetrics: ReturnType<typeof indicatorsForCategory>; place: PlaceRecord | null; agriculture: LandCoverResult | null; agricultureStatus: "idle" | "loading" | "none" | "error"; soil: SoilProperties | null; pointStatus: "idle" | "loading" | "none" | "error"; selectionKind: "point" | "polygon" | null; matchCount: number; activeTab: ResultTab; onTab: (tab: ResultTab) => void; onCategory: (category: MetricCategory) => void; onMetric: (metric: MetricKey) => void }) {
  const governorate = governorateKey ? GOVERNORATES[governorateKey] : null;
  const metric = METRICS[metricKey];
  const value = governorateKey ? metric.values[governorateKey] : undefined;
  const waterSource = DATA_SOURCES[metric.source];
  const rainfall = governorateKey ? RAINFALL_BY_GOVERNORATE_KEY[governorateKey] : null;
  const landCoverHeadline = agriculture?.agricultural ? "Classified cropland at this point" : agriculture ? `${agriculture.label === "Built area" ? "Built-up land" : agriculture.label} at this point` : "Land cover at selected point";
  const hasSelection = Boolean(place || governorate);
  const selectedTitle = place?.name === "Selected map point" ? governorate?.name ?? place.name : place?.name ?? governorate?.name;
  return <aside className={`atlas-detail combined-detail professional-detail${hasSelection ? " has-selection" : ""}`} aria-labelledby="atlas-detail-title" aria-live="polite">
    <div className="sheet-handle" aria-hidden="true" />
    {!hasSelection ? <div className="results-empty-state"><span aria-hidden="true"><MapPin size={25} /></span><p>Start exploring</p><h2 id="atlas-detail-title">Choose a city or click the map</h2><p>Search for a place in Lebanon or select any point on the map. Water access, land cover and soil results will appear here.</p><div><b>1</b> Find a place <i /> <b>2</b> View local context</div></div> : <>
    <header className="selected-point-heading"><span className="selected-point-icon" aria-hidden="true"><MapPin size={20} /></span><div><p>{place?.name === "Selected map point" ? "Governorate selected" : place ? "Place selected" : "Governorate selected"}</p><h2 id="atlas-detail-title">{selectedTitle}</h2>{place && place.name !== "Selected map point" && <small>{[place.district, place.governorate].filter(Boolean).join(" · ") || "Location selected on map"}</small>}</div></header>
    {governorate && rainfall && <section className={`rainfall-selection-card${rainfall.annualMm === null ? " is-unavailable" : ""}`} aria-label={`${governorate.name} annual rainfall`}><div><p>Annual rainfall</p><h3>{governorate.name}</h3></div><strong>{rainfall.annualMm === null ? "Unavailable" : `${rainfall.annualMm.toLocaleString()} mm/year`}</strong><span>{rainfall.category}</span><small>{rainfall.annualMm === null ? `No separate ${governorate.name} value is published in this study dataset.` : RAINFALL_SOURCE.note}</small><a href={RAINFALL_SOURCE.url} target="_blank" rel="noreferrer">Study source <ExternalLink size={12} /></a></section>}
    <div className="result-tabs" role="tablist" aria-label="Results"><button type="button" role="tab" aria-selected={activeTab === "water"} className={activeTab === "water" ? "active" : ""} onClick={() => onTab("water")}><Droplets size={15} />Water access</button><button type="button" role="tab" aria-selected={activeTab === "land"} className={activeTab === "land" ? "active" : ""} onClick={() => onTab("land")}><Leaf size={15} />Land cover</button><button type="button" role="tab" aria-selected={activeTab === "soil"} className={activeTab === "soil" ? "active" : ""} onClick={() => onTab("soil")}><Sprout size={15} />Soil</button></div>

    {activeTab === "land" && <section className="data-card land-cover-card" role="tabpanel" aria-labelledby="land-cover-card-title"><div className="data-card-title"><span aria-hidden="true"><Leaf size={17} /></span><div><p>2023 · 10 m pixel</p><h3 id="land-cover-card-title">Land cover</h3></div></div>
      {!place ? <div className="compact-state"><strong>Select a place or point</strong><p>The 2023 raster will be sampled at that coordinate.</p></div> : agricultureStatus === "loading" ? <div className="compact-state"><LoaderCircle size={17} className="spin" /><strong>Checking land cover…</strong></div> : agricultureStatus === "error" ? <div className="compact-state error"><strong>Source unavailable</strong><p>Water and soil remain available.</p></div> : agricultureStatus === "none" || !agriculture ? <div className="compact-state"><strong>Outside mapped coverage</strong><p>No classified pixel was returned at this point.</p></div> : <><div className="result-lead"><strong>{landCoverHeadline}</strong><p>{agriculture.agricultural ? "The source classifies the selected 10 m pixel as Crops." : `The selected 10 m pixel is classified as ${agriculture.label}; it is not classified cropland.`}</p></div><details className="data-details"><summary>About this data</summary><dl><div><dt>Year</dt><dd>{LAND_COVER_SOURCE.observationYear}</dd></div><div><dt>Pixel</dt><dd>{LAND_COVER_SOURCE.resolution}</dd></div><div><dt>Method</dt><dd>AI-derived Sentinel-2 land-cover classification</dd></div><div><dt>Limit</dt><dd>Not field verification, a parcel boundary, crop type, cultivation history, or current activity.</dd></div></dl></details><a className="source-badge" href={LAND_COVER_SOURCE.url} target="_blank" rel="noreferrer"><span>{LAND_COVER_SOURCE.publisher}</span>View source <ExternalLink size={13} /></a></>}
    </section>}

    {activeTab === "water" && <section className="data-card water-card" role="tabpanel" aria-labelledby="water-card-title"><div className="data-card-title"><span aria-hidden="true"><Droplets size={17} /></span><div><p>{metric.year} · Governorate survey</p><h3 id="water-card-title">Water access</h3></div></div><div className="detail-indicator-controls"><div className="category-tabs" role="tablist" aria-label="Water indicator category">{categories.map(({ key, icon: Icon }) => <button type="button" role="tab" aria-selected={category === key} className={category === key ? "active" : ""} key={key} onClick={() => onCategory(key)}><Icon size={13} />{key === "source" ? "Water source" : CATEGORY_LABELS[key]}</button>)}</div><div className="metric-pills" aria-label="Water indicators">{categoryMetrics.map((item) => <button type="button" key={item.key} className={metricKey === item.key ? "active" : ""} onClick={() => onMetric(item.key)}>{item.shortLabel}<span>{item.year}</span></button>)}</div></div>
      {!governorate ? <div className="compact-state"><strong>Select a place or point</strong><p>Its governorate will be matched to the published survey.</p></div> : !value ? <div className="compact-state"><strong>No published value</strong><p>{governorate.name} is outside this indicator’s published coverage.</p></div> : <><div className="result-lead water-result"><strong>{waterResultHeadline(metricKey, value.value)}</strong><p>{governorate.name} governorate · {metric.year} survey</p><em>This is not a village measurement.</em>{value.incomplete && <span className="coverage-tag">Partial geographic coverage</span>}{value.precisionWarning && <span className="coverage-tag neutral">High relative standard error</span>}</div><details className="data-details"><summary>Definition and survey basis</summary><dl><div><dt>Unit</dt><dd>{metric.unit === "%" ? "Percent" : metric.unit}</dd></div><div><dt>Definition</dt><dd>{metric.definition}</dd></div><div><dt>Basis</dt><dd>{metric.basis}</dd></div><div><dt>Geography</dt><dd>{metric.geography}</dd></div></dl></details><a className="source-badge" href={waterSource.url} target="_blank" rel="noreferrer"><span>{waterSource.publisher} · {metric.sourceTable}</span>View source <ExternalLink size={13} /></a></>}
    </section>}

    {activeTab === "soil" && <section className="data-card soil-card" role="tabpanel" aria-labelledby="soil-card-title"><div className="data-card-title"><span aria-hidden="true"><Sprout size={17} /></span><div><p>1997–2006 · Mapped polygon</p><h3 id="soil-card-title">Soil</h3></div></div>
      {!place ? <div className="compact-state"><strong>Select a place or point</strong><p>The AUB polygon layer will be queried at that coordinate.</p></div> : pointStatus === "loading" ? <div className="compact-state"><LoaderCircle size={17} className="spin" /><strong>Checking mapped soil…</strong></div> : pointStatus === "error" ? <div className="compact-state error"><strong>Source unavailable</strong><p>The place, land cover and water result remain selected.</p></div> : pointStatus === "none" ? <div className="compact-state"><strong>Outside mapped coverage</strong><p>No soil polygon covers the selected point.</p></div> : soil ? <><div className="result-lead"><strong>{soil.soil_class ? `${soil.soil_class} at the selected point` : "Soil class not published"}</strong><p>This classification comes from the mapped polygon intersecting the coordinate, not a field test of the exact spot.</p></div><dl className="soil-core-fields">{soil.soil_group && <div><dt>Group</dt><dd>{soil.soil_group}</dd></div>}{soil.soil_unit && <div><dt>Unit</dt><dd>{soil.soil_unit}</dd></div>}</dl><details className="data-details"><summary>About this polygon</summary><dl>{soil.code2 && <div><dt>Published code</dt><dd>{soil.code2}</dd></div>}<div><dt>Selection</dt><dd>{selectionKind === "polygon" ? "Polygon clicked on the map" : "Polygon intersecting the selected coordinate"}</dd></div>{matchCount > 1 && <div><dt>Overlap</dt><dd>{matchCount} polygons intersect the point; the first service result is shown.</dd></div>}<div><dt>Limits</dt><dd>Numeric fields are not shown because their units and completeness are not documented in the service metadata.</dd></div></dl></details><aside className="educational-note"><Info size={16} /><p><strong>Educational note: soil and water</strong>Texture and depth can influence infiltration, plant-available storage and runoff alongside slope, structure, vegetation and rainfall. The mapped class is not a measured infiltration rate, recharge percentage, groundwater level or irrigation requirement.</p></aside><a className="source-badge" href={SOIL_LAYER_URL} target="_blank" rel="noreferrer"><span>{SOIL_SOURCE.publisher} · polygon {soil.objectid ?? "record"}</span>View source <ExternalLink size={13} /></a></> : <div className="compact-state"><strong>No mapped soil result</strong><p>Select a point to query the layer.</p></div>}
    </section>}
    </>}
  </aside>;
}

export function GovernorateMap() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const boundsRef = useRef<LatLngBounds | null>(null);
  const waterLayerRef = useRef<LeafletGeoJSON | null>(null);
  const soilLayerRef = useRef<LeafletGeoJSON | null>(null);
  const placeMarkerRef = useRef<Layer | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const polygonRefs = useRef(new Map<GovernorateKey, Layer>());
  const boundaryFeaturesRef = useRef<Feature<Geometry, GovernorateProperties>[]>([]);
  const requestRef = useRef<AbortController | null>(null);
  const pointRequestRef = useRef<AbortController | null>(null);
  const agricultureRequestRef = useRef<AbortController | null>(null);
  const modeRef = useRef<AtlasMode>("water");
  const selectedPlaceRef = useRef<PlaceRecord | null>(null);
  const [mode, setMode] = useState<AtlasMode>("water");
  const [category, setCategory] = useState<MetricCategory>("source");
  const [metricKey, setMetricKey] = useState<MetricKey>("piped");
  const [selectedKey, setSelectedKey] = useState<GovernorateKey | null>(null);
  const [selectedSoil, setSelectedSoil] = useState<SoilProperties | null>(null);
  const [agriculture, setAgriculture] = useState<LandCoverResult | null>(null);
  const [agricultureStatus, setAgricultureStatus] = useState<"idle" | "loading" | "none" | "error">("idle");
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecord | null>(null);
  const [soilSelectionKind, setSoilSelectionKind] = useState<"point" | "polygon" | null>(null);
  const [soilPointStatus, setSoilPointStatus] = useState<"idle" | "loading" | "none" | "error">("idle");
  const [soilPointMatchCount, setSoilPointMatchCount] = useState(0);
  const [boundaryError, setBoundaryError] = useState(false);
  const [soilStatus, setSoilStatus] = useState<"idle" | "loading" | "ready" | "empty" | "error">("idle");
  const [soilCount, setSoilCount] = useState(0);
  const [activeResultTab, setActiveResultTab] = useState<ResultTab>("water");
  const categoryMetrics = useMemo(() => indicatorsForCategory(category), [category]);
  const chooseGovernorate = useCallback((key: GovernorateKey) => setSelectedKey(key), []);
  const chooseCategory = (next: MetricCategory) => { setCategory(next); setMetricKey(CATEGORY_DEFAULTS[next]); };
  const resetLebanon = () => { const map = mapRef.current; const bounds = boundsRef.current; if (map && bounds) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 8.5 }); };

  const querySoilAtPoint = useCallback(async (place: PlaceRecord) => {
    pointRequestRef.current?.abort();
    const controller = new AbortController();
    pointRequestRef.current = controller;
    setSoilPointStatus("loading");
    setSoilPointMatchCount(0);
    try {
      const params = new URLSearchParams({
        f: "geojson", where: "1=1", geometry: `${place.lng},${place.lat}`, geometryType: "esriGeometryPoint", inSR: "4326", outSR: "4326",
        spatialRel: "esriSpatialRelIntersects", outFields: "objectid,code2,soiltype2,total_sand,silt__,clay__,o_m___,depth,soil_class,soil_group,soil_unit",
        returnGeometry: "true", resultRecordCount: "20", geometryPrecision: "5",
      });
      const response = await fetch(`${SOIL_LAYER_URL}/query?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`Soil service returned ${response.status}`);
      const result = await response.json() as FeatureCollection<Geometry, SoilProperties> & { error?: { message?: string } };
      if (result.error) throw new Error(result.error.message || "Soil point query failed");
      if (controller.signal.aborted) return;
      setSoilPointMatchCount(result.features.length);
      if (!result.features.length) {
        setSelectedSoil(null);
        setSoilSelectionKind("point");
        setSoilPointStatus("none");
        return;
      }
      setSelectedSoil(result.features[0].properties);
      setSoilSelectionKind("point");
      setSoilPointStatus("idle");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setSelectedSoil(null);
        setSoilPointStatus("error");
      }
    }
  }, []);

  const queryAgricultureAtPoint = useCallback(async (place: PlaceRecord) => {
    agricultureRequestRef.current?.abort();
    const controller = new AbortController();
    agricultureRequestRef.current = controller;
    setAgricultureStatus("loading");
    setAgriculture(null);
    try {
      const params = new URLSearchParams({
        f: "json",
        geometry: JSON.stringify({ x: place.lng, y: place.lat, spatialReference: { wkid: 4326 } }),
        geometryType: "esriGeometryPoint",
        returnGeometry: "false",
        returnCatalogItems: "false",
        mosaicRule: JSON.stringify({ mosaicMethod: "esriMosaicLockRaster", lockRasterIds: [LAND_COVER_SOURCE.rasterId] }),
      });
      const response = await fetch(`${LAND_COVER_SERVICE_URL}/identify?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`Land-cover service returned ${response.status}`);
      const result = await response.json() as { value?: string | number; error?: { message?: string } };
      if (result.error) throw new Error(result.error.message || "Land-cover query failed");
      if (controller.signal.aborted) return;
      const code = Number(result.value);
      const classification = LAND_COVER_CLASSES[code];
      if (!Number.isFinite(code) || !classification) {
        setAgricultureStatus("none");
        return;
      }
      setAgriculture({ code, ...classification });
      setAgricultureStatus("idle");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setAgriculture(null);
        setAgricultureStatus("error");
      }
    }
  }, []);

  const selectPlace = useCallback((place: PlaceRecord) => {
    selectedPlaceRef.current = place;
    setSelectedPlace(place);
    setSelectedSoil(null);
    setAgriculture(null);
    setAgricultureStatus("loading");
    setSoilSelectionKind(null);
    setSoilPointStatus("loading");
    if (place.governorateKey) setSelectedKey(place.governorateKey);
    const map = mapRef.current;
    const L = leafletRef.current;
    if (map && L) {
      placeMarkerRef.current?.remove();
      const marker = L.circleMarker([place.lat, place.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#e2583e", fillOpacity: 1, pane: "markerPane" }).addTo(map);
      marker.bindTooltip(place.name, { permanent: true, direction: "top", className: "place-marker-label", offset: [0, -7] });
      placeMarkerRef.current = marker;
      map.setView([place.lat, place.lng], 11.5, { animate: true });
    }
    queueMicrotask(() => void querySoilAtPoint(place));
    queueMicrotask(() => void queryAgricultureAtPoint(place));
  }, [queryAgricultureAtPoint, querySoilAtPoint]);

  const selectMapPoint = useCallback((lat: number, lng: number) => {
    const match = boundaryFeaturesRef.current.find((feature) => featureContainsPoint(feature, lng, lat));
    const sourceName = match?.properties?.admin1Name;
    const governorateKey = sourceName ? geoJsonNameToDataKey[sourceName] : undefined;
    selectPlace({ id: -Date.now(), name: "Selected map point", asciiName: "Selected map point", names: ["Selected map point"], lat, lng, featureCode: "POINT", governorate: governorateKey ? GOVERNORATES[governorateKey].name : "Lebanon", district: "", governorateKey: governorateKey ?? null, population: 0 });
  }, [selectPlace]);

  const clearPlace = useCallback(() => {
    pointRequestRef.current?.abort();
    agricultureRequestRef.current?.abort();
    placeMarkerRef.current?.remove();
    placeMarkerRef.current = null;
    selectedPlaceRef.current = null;
    setSelectedPlace(null);
    setSelectedSoil(null);
    setAgriculture(null);
    setAgricultureStatus("idle");
    setSoilSelectionKind(null);
    setSoilPointStatus("idle");
    setSoilPointMatchCount(0);
    setSelectedKey(null);
    resetLebanon();
  }, []);

  const loadSoils = useCallback(async () => {
    const map = mapRef.current;
    if (!map || modeRef.current !== "soil") return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setSoilStatus("loading");
    try {
      const bounds = map.getBounds().pad(.08);
      const envelope = { xmin: bounds.getWest(), ymin: bounds.getSouth(), xmax: bounds.getEast(), ymax: bounds.getNorth(), spatialReference: { wkid: 4326 } };
      const features: Feature<Geometry, SoilProperties>[] = [];
      let offset = 0;
      let more = true;
      while (more && offset < 5000) {
        const params = new URLSearchParams({ f: "geojson", where: "1=1", geometry: JSON.stringify(envelope), geometryType: "esriGeometryEnvelope", inSR: "4326", outSR: "4326", spatialRel: "esriSpatialRelIntersects", outFields: "objectid,code2,soiltype2,total_sand,silt__,clay__,o_m___,depth,soil_class,soil_group,soil_unit", returnGeometry: "true", orderByFields: "objectid", resultOffset: String(offset), resultRecordCount: "100", geometryPrecision: "5" });
        const response = await fetch(`${SOIL_LAYER_URL}/query?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Soil service returned ${response.status}`);
        const page = await response.json() as FeatureCollection<Geometry, SoilProperties> & { exceededTransferLimit?: boolean; error?: { message?: string } };
        if (page.error) throw new Error(page.error.message || "Soil service query failed");
        features.push(...page.features);
        more = Boolean(page.exceededTransferLimit) || page.features.length === 100;
        offset += page.features.length;
        if (!page.features.length) break;
      }
      if (controller.signal.aborted || !mapRef.current) return;
      const L = await import("leaflet");
      soilLayerRef.current?.remove();
      const soilCollection: FeatureCollection<Geometry, SoilProperties> = { type: "FeatureCollection", features };
      const soilLayer = L.geoJSON(soilCollection, {
        style: (feature) => ({ color: "#6e6b65", weight: .55, fillColor: soilColor((feature?.properties as SoilProperties | undefined)?.soil_class), fillOpacity: .82 }),
        onEachFeature: (feature: Feature<Geometry, SoilProperties>, polygon: Layer) => {
          const properties = feature.properties;
          polygon.bindTooltip(soilTooltipContent(properties), { className: "water-tooltip", direction: "top", sticky: true, opacity: 1 });
          const vector = polygon as Layer & { setStyle: (style: Record<string, unknown>) => void; bringToFront: () => void; getElement?: () => SVGPathElement };
          const chooseSoil = () => { setSelectedSoil(properties); setSoilSelectionKind("polygon"); setSoilPointStatus("idle"); };
          polygon.on({ mouseover: () => { vector.setStyle({ weight: 2.2, color: "#173f4d", fillOpacity: .96 }); vector.bringToFront(); }, mouseout: () => vector.setStyle({ weight: .55, color: "#6e6b65", fillOpacity: .82 }), click: (event: LeafletMouseEvent) => { selectMapPoint(event.latlng.lat, event.latlng.lng); } });
          polygon.on("add", () => { const path = vector.getElement?.(); if (!path) return; path.setAttribute("tabindex", "0"); path.setAttribute("role", "button"); path.setAttribute("aria-label", `Inspect ${properties.soil_class || "unclassified"} soil polygon`); path.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseSoil(); } }); });
        },
      }).addTo(map);
      soilLayerRef.current = soilLayer;
      setSoilCount(features.length);
      setSoilStatus(features.length ? "ready" : "empty");
    } catch (error) {
      if ((error as Error).name !== "AbortError") setSoilStatus("error");
    }
  }, [selectMapPoint]);

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return;
    let disposed = false;
    const polygonIndex = polygonRefs.current;
    async function createMap() {
      const L = await import("leaflet");
      leafletRef.current = L;
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const response = await fetch(`${basePath}/data/lebanon-governorates.geojson`);
      if (!response.ok) throw new Error("Boundary file unavailable");
      const boundaries = (await response.json()) as FeatureCollection<Geometry, GovernorateProperties>;
      boundaryFeaturesRef.current = boundaries.features;
      if (disposed || !mapElement.current) return;
      const map = L.map(mapElement.current, { center: [33.89, 35.86], zoom: 7, minZoom: 6, maxZoom: 13, zoomSnap: .25, zoomDelta: .5, zoomControl: true, scrollWheelZoom: false, attributionControl: true });
      mapRef.current = map;
      map.attributionControl.setPrefix(false);
      map.attributionControl.addAttribution(`Boundaries: <a href="${BOUNDARY_SOURCE.url}" target="_blank" rel="noreferrer">OCHA Lebanon</a>`);
      const layer = L.geoJSON(boundaries, {
        style: (feature) => { const sourceName = feature?.properties?.admin1Name; const key = sourceName && geoJsonNameToDataKey[sourceName]; const rainfall = key ? RAINFALL_BY_GOVERNORATE_KEY[key] : null; return { color: "#f7fbfa", weight: 1.25, fillColor: rainfallColor(rainfall?.annualMm ?? null), fillOpacity: .9 }; },
        onEachFeature: (feature: Feature<Geometry, GovernorateProperties>, polygon: Layer) => {
          const sourceName = feature.properties?.admin1Name;
          if (!sourceName || !(sourceName in geoJsonNameToDataKey)) return;
          const key = geoJsonNameToDataKey[sourceName];
          polygonIndex.set(key, polygon);
          polygon.bindTooltip(governorateLabelContent(key), { className: `governorate-label-tooltip${key === "beirut" ? " governorate-label-beirut" : ""}`, direction: "top", offset: [0, -8], permanent: false, sticky: true, interactive: false, opacity: 1 });
          polygon.on({ click: (event: LeafletMouseEvent) => selectMapPoint(event.latlng.lat, event.latlng.lng) });
          polygon.on("add", () => { const path = (polygon as LeafletGeoJSON as unknown as { getElement?: () => SVGPathElement }).getElement?.(); if (!path) return; path.setAttribute("tabindex", "0"); path.setAttribute("role", "button"); path.setAttribute("aria-label", `Select ${GOVERNORATES[key].name}`); path.addEventListener("focus", () => polygon.openTooltip()); path.addEventListener("blur", () => polygon.closeTooltip()); path.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); chooseGovernorate(key); } }); });
        },
      }).addTo(map);
      waterLayerRef.current = layer;
      const lebanonBounds = layer.getBounds();
      boundsRef.current = lebanonBounds;
      const fitLebanon = () => { if (disposed || !mapElement.current || mapRef.current !== map) return; map.invalidateSize({ pan: false }); const padding = mapElement.current.clientWidth < 600 ? 20 : 44; map.fitBounds(lebanonBounds, { padding: [padding, padding], maxZoom: 8.5, animate: false }); };
      requestAnimationFrame(fitLebanon);
      const resizeObserver = new ResizeObserver(() => map.invalidateSize({ pan: false }));
      resizeObserver.observe(mapElement.current);
      map.on("moveend", () => { if (modeRef.current === "soil") void loadSoils(); });
      map.on("click", (event: LeafletMouseEvent) => selectMapPoint(event.latlng.lat, event.latlng.lng));
      map.once("unload", () => resizeObserver.disconnect());
    }
    createMap().catch(() => { if (!disposed) setBoundaryError(true); });
    return () => { disposed = true; requestRef.current?.abort(); pointRequestRef.current?.abort(); agricultureRequestRef.current?.abort(); mapRef.current?.remove(); mapRef.current = null; leafletRef.current = null; polygonIndex.clear(); };
  }, [chooseGovernorate, loadSoils, selectMapPoint]);

  useEffect(() => {
    modeRef.current = mode;
    const map = mapRef.current;
    const waterLayer = waterLayerRef.current;
    if (!map || !waterLayer) return;
    const soilCredit = `<a href="${SOIL_LAYER_URL}" target="_blank" rel="noreferrer">AUB Soils</a> · ${SOIL_SOURCE.publisher}`;
    if (mode === "soil") {
      waterLayer.remove();
      map.attributionControl.addAttribution(soilCredit);
      queueMicrotask(() => void loadSoils());
    } else {
      requestRef.current?.abort();
      soilLayerRef.current?.remove();
      soilLayerRef.current = null;
      waterLayer.addTo(map);
      map.attributionControl.removeAttribution(soilCredit);
      queueMicrotask(() => setSoilStatus("idle"));
    }
  }, [mode, loadSoils]);

  useEffect(() => {
    for (const [key, layer] of polygonRefs.current) {
      const vector = layer as Layer & { setStyle: (style: Record<string, unknown>) => void; bringToFront: () => void; getElement?: () => SVGPathElement };
      const selected = key === selectedKey;
      vector.setStyle({ color: selected ? "#f0a43b" : "#f7fbfa", weight: selected ? 3.5 : 1.25, fillColor: rainfallColor(RAINFALL_BY_GOVERNORATE_KEY[key].annualMm), fillOpacity: selected ? 1 : .9 });
      vector.getElement?.()?.classList.toggle("is-selected", selected);
      if (selected) vector.bringToFront();
    }
    if (selectedKey) (polygonRefs.current.get(selectedKey) as Layer & { bringToFront?: () => void } | undefined)?.bringToFront?.();
  }, [selectedKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hideForSearchedPlace = Boolean(selectedPlace && selectedPlace.featureCode !== "POINT");
    for (const [key, layer] of polygonRefs.current) {
      const tooltipLayer = layer as Layer & {
        bindTooltip: (content: string, options: { className: string; direction: "top"; offset: [number, number]; permanent: boolean; sticky: boolean; interactive: boolean; opacity: number }) => Layer;
        closeTooltip: () => void;
        openTooltip: () => void;
        unbindTooltip: () => void;
      };
      if (hideForSearchedPlace) {
        tooltipLayer.closeTooltip();
        tooltipLayer.unbindTooltip();
      } else {
        tooltipLayer.bindTooltip(governorateLabelContent(key), { className: `governorate-label-tooltip${key === "beirut" ? " governorate-label-beirut" : ""}`, direction: "top", offset: [0, -8], permanent: false, sticky: true, interactive: false, opacity: 1 });
      }
    }
  }, [selectedPlace]);

  return <div className={`atlas-explorer atlas-mode-${mode}`}>
    <div className="explorer-toolbar"><div className="toolbar-step"><span>1</span><div><strong>Choose a city or point</strong><small>Search below or click anywhere on the map</small></div></div><PlaceSearch selectedPlace={selectedPlace} onSelect={selectPlace} onClear={clearPlace} /><div className="toolbar-layers"><span>Map layer</span><div className="atlas-mode-tabs map-layer-tabs" role="group" aria-label="Colored map layer"><button type="button" aria-pressed={mode === "water"} className={mode === "water" ? "active" : ""} onClick={() => setMode("water")}><Droplets size={16} />Rainfall</button><button type="button" aria-pressed={mode === "soil"} className={mode === "soil" ? "active" : ""} onClick={() => setMode("soil")}><Sprout size={16} />Soil</button></div></div></div>
    <div className="atlas-main-grid"><section className={`atlas-map-card${selectedPlace?.featureCode !== "POINT" && selectedPlace ? " has-point-selection" : ""}`} aria-label={`Interactive Lebanon ${mode === "water" ? "rainfall" : "soil"} map`} aria-busy={mode === "soil" && soilStatus === "loading"}><div ref={mapElement} className="leaflet-map" />
      {boundaryError && <div className="boundary-fallback" role="alert"><MapPinned size={31} /><strong>Boundary map unavailable</strong><span>The indicator records remain available.</span></div>}
      <button type="button" className="map-reset" onClick={resetLebanon} aria-label="Back to full Lebanon view"><RotateCcw size={15} />Back to Lebanon</button>
      <div className="map-status"><Layers3 size={15} /><span>{mode === "water" ? "Study rainfall by governorate" : soilStatus === "loading" ? "Loading visible soils…" : soilStatus === "ready" ? `${soilCount} visible soil polygons` : "AUB soil layer"}</span></div>
      {mode === "soil" && soilStatus === "loading" && <div className="map-loading" role="status"><LoaderCircle size={24} className="spin" /><span>Loading visible soil polygons</span></div>}
      {mode === "soil" && soilStatus === "empty" && <div className="map-message" role="status"><Sprout size={25} /><strong>No soil polygons in this view</strong><span>Reset to Lebanon or pan back toward the country.</span></div>}
      {mode === "soil" && soilStatus === "error" && <div className="map-message map-error-state" role="alert"><Info size={25} /><strong>Soil layer unavailable</strong><span>The AUB service may be offline or blocking this connection. Try again shortly.</span><button type="button" onClick={() => void loadSoils()}>Retry</button></div>}
      {mode === "water" ? <><div className="map-legend rainfall-scale-legend"><span>Annual rainfall</span><strong>Study values · mm/year</strong><div className="rainfall-legend-scale">{RAINFALL_SCALE.map((item) => <span key={item.annualMm}><i style={{ background: item.color }} />{item.annualMm.toLocaleString()}</span>)}</div><small><i style={{ background: RAINFALL_UNAVAILABLE_COLOR }} />No supported value</small></div><div className="community-map-label"><UsersRound size={14} />Rainfall values shared with the calculator</div></> : <div className="map-legend soil-legend"><strong>Published soil class</strong><div>{SOIL_CLASS_ORDER.map((name) => <span key={name}><i style={{ background: SOIL_CLASS_COLORS[name] }} />{name}</span>)}</div></div>}
    </section><CombinedDetailsPanel governorateKey={selectedKey} metricKey={metricKey} category={category} categoryMetrics={categoryMetrics} place={selectedPlace} agriculture={agriculture} agricultureStatus={agricultureStatus} soil={selectedSoil} pointStatus={soilPointStatus} selectionKind={soilSelectionKind} matchCount={soilPointMatchCount} activeTab={activeResultTab} onTab={setActiveResultTab} onCategory={chooseCategory} onMetric={setMetricKey} /></div>
    <details className="atlas-attribution data-sources"><summary><Waves size={16} />Data sources</summary><p>Rainfall: <a href={RAINFALL_SOURCE.url} target="_blank" rel="noreferrer">{RAINFALL_SOURCE.title}</a> {RAINFALL_SOURCE.note} Water survey: <a href={DATA_SOURCES[METRICS.piped.source].url} target="_blank" rel="noreferrer">{DATA_SOURCES[METRICS.piped.source].shortTitle}</a>. Boundaries: <a href={BOUNDARY_SOURCE.url} target="_blank" rel="noreferrer">{BOUNDARY_SOURCE.publisher}</a>. Soil: <a href={SOIL_LAYER_URL} target="_blank" rel="noreferrer">AUB hosted Soils feature layer</a>; credit: {SOIL_SOURCE.publisher}. Land cover: <a href={LAND_COVER_SOURCE.url} target="_blank" rel="noreferrer">{LAND_COVER_SOURCE.title}</a>, {LAND_COVER_SOURCE.observationYear}, {LAND_COVER_SOURCE.resolution}; {LAND_COVER_SOURCE.publisher}. Point results do not describe whole villages.</p></details>
  </div>;
}

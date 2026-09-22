"use client";

import { useState } from "react";
import { MapPin, Search } from "lucide-react";

type SiteType = "Spring" | "Well" | "Reservoir" | "River";
const filters = ["All places", "Springs", "Wells", "Reservoirs", "Rivers"] as const;
const points: { x: number; y: number; type: SiteType; name: string }[] = [
  { x: 62, y: 17, type: "Spring", name: "North spring" }, { x: 69, y: 21, type: "Well", name: "North well" },
  { x: 56, y: 27, type: "Reservoir", name: "Coastal reservoir" }, { x: 73, y: 31, type: "Spring", name: "Ehden spring" },
  { x: 62, y: 35, type: "Well", name: "Mountain well" }, { x: 77, y: 40, type: "River", name: "Mountain river" },
  { x: 52, y: 45, type: "Spring", name: "Central spring" }, { x: 67, y: 48, type: "Spring", name: "Valley spring" },
  { x: 58, y: 55, type: "Well", name: "Central well" }, { x: 76, y: 57, type: "Reservoir", name: "Central reservoir" },
  { x: 49, y: 63, type: "River", name: "Coastal river" }, { x: 64, y: 68, type: "Spring", name: "Southern spring" },
  { x: 55, y: 74, type: "Well", name: "Southern well" }, { x: 73, y: 77, type: "River", name: "Southern river" },
  { x: 60, y: 85, type: "Reservoir", name: "Southern reservoir" },
];

const matchingType: Record<(typeof filters)[number], SiteType | null> = { "All places": null, Springs: "Spring", Wells: "Well", Reservoirs: "Reservoir", Rivers: "River" };

export function AtlasMap({ imageUrl }: { imageUrl: string }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All places");
  const [query, setQuery] = useState("");
  const shown = points.filter((point) => (!matchingType[filter] || point.type === matchingType[filter]) && point.name.toLowerCase().includes(query.toLowerCase()));

  return <div className="atlas-map" style={{ backgroundImage: `url("${imageUrl}")` }} aria-label="Illustrative map of water sites in Lebanon">
    <div className="map-controls"><label className="map-search"><Search size={16} /><input aria-label="Search water sites" placeholder="Search for a place..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><fieldset className="map-filters"><legend className="sr-only">Water site type</legend>{filters.map((item) => <label key={item}><input type="radio" name="site-type" value={item} checked={filter === item} onChange={() => setFilter(item)} /><span>{item}</span></label>)}</fieldset></div>
    <div className="map-north" aria-hidden="true">N<br />△</div><span className="map-sea" aria-hidden="true">Mediterranean<br />Sea</span><span className="atlas-map-city map-tripoli">Tripoli</span><span className="atlas-map-city map-beirut">Beirut</span><span className="atlas-map-city map-ehden"><MapPin size={21} fill="currentColor" /> Ehden</span>
    {shown.map((point) => <span className={`map-point type-${point.type.toLowerCase()}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} title={point.name} key={point.name} />)}
    {shown.length === 0 && <div className="map-empty">No demo sites match that search.</div>}
    <div className="map-legend"><strong>Water site type</strong><span><i className="type-spring" />Spring</span><span><i className="type-well" />Well</span><span><i className="type-reservoir" />Reservoir</span><span><i className="type-river" />River</span><small>Illustrative map and locations</small></div>
  </div>;
}

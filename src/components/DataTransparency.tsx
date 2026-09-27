"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { EXPLORER_SOURCES } from "@/data/data-sources";
import { ROOF_COEFFICIENT_SOURCE } from "@/data/rainwater-harvesting";
import { SOURCE_REGISTRY } from "@/data/source-registry";

type TransparencyView = "sources" | "methodology" | null;

function SourcesContent() {
  return <div className="transparency-source-list">
    {SOURCE_REGISTRY.map((source) => <section key={source.key}>
      <header><div><p>{source.publisher}</p><h3>{source.dataset}</h3></div><a href={source.url} target="_blank" rel="noreferrer">Original source <ArrowUpRight size={14} /></a></header>
      <p>{source.powers}</p>
      <dl><div><dt>Coverage</dt><dd>{source.coverage}</dd></div><div><dt>Resolution</dt><dd>{source.resolutionOrScale}</dd></div><div><dt>Limitation</dt><dd>{source.limitation}</dd></div></dl>
    </section>)}
  </div>;
}

function MethodologyContent() {
  return <div className="transparency-methodology-list">
    <section><h3>Data resolution</h3><p><strong>Regional data</strong> retains the geography published by its source. <strong>Governorate data</strong> describes an administrative area, not a village or property. <strong>Spatial data</strong> is returned from the mapped polygon or raster cell intersecting a selected coordinate.</p></section>
    <section><h3>Location matching</h3><p>AQUALEB searches its GeoNames-based Lebanon gazetteer, uses the selected point coordinates, and matches that point to an OCHA governorate boundary. A place name is never treated as a parcel boundary.</p></section>
    <section><h3>Environmental values</h3><p>Rainfall is matched to the published mean-annual-rainfall band at the selected coordinate, independent of governorate boundaries. Soil is queried from the published CNRS polygon layer at the selected coordinate. Agricultural census figures remain governorate-level and are not redistributed to villages.</p></section>
    <section><h3>Rainwater harvesting</h3><p>The calculator combines the coordinate-matched rainfall value, the user&apos;s horizontal roof catchment area, and the selected roof-material runoff coefficient. Closed rainfall bands use their midpoint; the open &gt;1,400 mm band uses 1,400 mm as a conservative lower bound. The result is annual collection potential before tank capacity, overflow, first-flush diversion, maintenance and water-quality constraints.</p></section>
    <section><h3>Runoff coefficients</h3><p>Material assumptions reference {ROOF_COEFFICIENT_SOURCE.publisher}&apos;s <em>{ROOF_COEFFICIENT_SOURCE.title}</em>. {ROOF_COEFFICIENT_SOURCE.note}</p></section>
    <section><h3>Assumptions and limitations</h3><p>{EXPLORER_SOURCES.rainfall.administrativeLimitations} Band digitization and georeferencing introduce map-reading uncertainty. Annualized monthly averages are planning aids only and do not represent Lebanon&apos;s seasonal monthly rainfall distribution.</p></section>
  </div>;
}

export function DataTransparency() {
  const [view, setView] = useState<TransparencyView>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!view) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setView(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus();
    };
  }, [view]);

  return <>
    <section className="data-transparency" id="sources" aria-labelledby="transparency-title">
      <div className="data-transparency-inner">
        <p id="transparency-title">Data &amp; Transparency</p>
        <div className="transparency-links">
          <button type="button" onClick={() => setView("sources")}><span>Data &amp; Sources <i>↗</i></span><small>Official datasets and institutions behind AQUALEB.</small></button>
          <button type="button" onClick={() => setView("methodology")}><span>Methodology <i>↗</i></span><small>How the data and estimates used by AQUALEB are produced.</small></button>
        </div>
      </div>
    </section>

    {view && <div className="transparency-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setView(null); }}>
      <section className="transparency-dialog" role="dialog" aria-modal="true" aria-labelledby="transparency-dialog-title">
        <header><div><p>Data &amp; Transparency</p><h2 id="transparency-dialog-title">{view === "sources" ? "Data & Sources" : "Methodology"}</h2></div><button ref={closeButtonRef} type="button" onClick={() => setView(null)} aria-label="Close transparency information"><X size={21} /></button></header>
        <div className="transparency-dialog-content">{view === "sources" ? <SourcesContent /> : <MethodologyContent />}</div>
      </section>
    </div>}
  </>;
}

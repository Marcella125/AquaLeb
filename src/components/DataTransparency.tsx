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
    <section><h3>Data resolution</h3><p><strong>Spatial data</strong> is matched at a selected coordinate. <strong>Governorate data</strong> describes an administrative area, not a village or property. Each value remains attached to the geographic resolution published by its source.</p></section>
    <section><h3>Location matching</h3><p>AQUALEB searches its GeoNames-based Lebanon gazetteer, uses the selected point coordinates, and matches that point to the relevant mapped layer and OCHA governorate boundary. A place name is never treated as a parcel boundary.</p></section>
    <section><h3>Rainfall</h3><p>AQUALEB uses only <em>{EXPLORER_SOURCES.rainfall.dataset}</em> from {EXPLORER_SOURCES.rainfall.institution} for annual rainfall. The selected coordinate is matched directly to its digitized rainfall band; governorate rainfall averages are not used.</p></section>
    <section><h3>Environmental and agricultural values</h3><p>Soil is queried from the published CNRS polygon layer at the selected coordinate. Agricultural census figures and water-access indicators remain at their published governorate or survey geography and are not redistributed to villages.</p></section>
    <section><h3>Rainwater harvesting</h3><p>Closed rainfall bands use their midpoint; the open &gt;1,400 mm/year band uses 1,400 mm/year as a conservative lower bound. The calculator combines that coordinate-matched value with roof area and the selected runoff coefficient. Material assumptions reference {ROOF_COEFFICIENT_SOURCE.publisher}&apos;s <em>{ROOF_COEFFICIENT_SOURCE.title}</em>.</p></section>
    <section><h3>Assumptions and limitations</h3><p>{EXPLORER_SOURCES.rainfall.administrativeLimitations} Rainfall digitization and georeferencing introduce map-reading uncertainty. Annualized monthly averages are planning aids only and do not represent Lebanon&apos;s seasonal rainfall distribution.</p></section>
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
          <button type="button" onClick={() => setView("sources")}><span>Data &amp; Sources <i>↗</i></span><small>Datasets and institutions behind AQUALEB.</small></button>
          <button type="button" onClick={() => setView("methodology")}><span>Methodology <i>↗</i></span><small>How AQUALEB matches source data and produces estimates.</small></button>
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

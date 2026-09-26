"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, CloudRain, Droplets, Info, Leaf, Layers3, Map as MapIcon, MapPin, Menu, Plus, Search, Send } from "lucide-react";
import { GovernorateMap } from "@/components/map/GovernorateMap";
import { GOVERNORATE_RAINFALL, LEBANESE_GOVERNORATES, RAINFALL_SOURCE, type RainfallGovernorate } from "@/data/governorate-rainfall";
import { SOURCE_REGISTRY } from "@/data/source-registry";

const SOURCE_ICONS: Record<string, typeof BookOpen> = {
  "water-lfhlcs": Droplets,
  "water-mics": Droplets,
  "land-cover": Leaf,
  soil: Layers3,
  boundaries: MapIcon,
  places: Search,
};

const COLLECTION_COEFFICIENT = 0.8;

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rainfallGovernorate, setRainfallGovernorate] = useState<RainfallGovernorate | "">("");
  const [roofArea, setRoofArea] = useState("");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const pageStyle = {
    "--atlas-hero-image": `url("${basePath}/aqualeb-coast-hero.png")`,
    "--harvest-image": `url("${basePath}/rainwater-harvest-home.png")`,
  } as CSSProperties;
  const rainfallRecord = rainfallGovernorate ? GOVERNORATE_RAINFALL[rainfallGovernorate] : null;
  const rainfallValue = rainfallRecord?.annualMm ?? null;
  const rainfallAvailable = rainfallValue !== null;
  const roofAreaValue = Number(roofArea);
  const roofAreaValid = roofArea.trim() !== "" && Number.isFinite(roofAreaValue) && roofAreaValue > 0;
  const calculationValid = rainfallAvailable && roofAreaValid;
  const annualHarvest = rainfallValue !== null && calculationValid ? rainfallValue * roofAreaValue * COLLECTION_COEFFICIENT : null;

  return (
    <main className="atlas-page" id="top" style={pageStyle}>
      <header className="atlas-header">
        <a href="#top" className="atlas-wordmark" aria-label="AquaLeb water atlas home"><Image src={`${basePath}/logo.png`} width={220} height={90} alt="AquaLeb" priority /></a>
        <nav className="atlas-desktop-nav" aria-label="Primary navigation"><a href="#atlas">Water atlas</a><a href="#harvest">Rainwater</a><a href="#sources">Data &amp; Sources</a><a href="#context">Sector context</a></nav>
        <div className="atlas-header-actions"><button type="button" aria-label="Search"><Search size={20} /></button><a href="#community"><Plus size={17} />Report a source</a><div className={`atlas-mobile-nav${mobileMenuOpen ? " is-open" : ""}`}><button type="button" aria-label="Open navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}><Menu size={21} /></button><nav aria-label="Mobile navigation"><a href="#atlas" onClick={() => setMobileMenuOpen(false)}>Water atlas</a><a href="#harvest" onClick={() => setMobileMenuOpen(false)}>Rainwater potential</a><a href="#sources" onClick={() => setMobileMenuOpen(false)}>Data &amp; Sources</a><a href="#context" onClick={() => setMobileMenuOpen(false)}>Sector context</a><a href="#community" onClick={() => setMobileMenuOpen(false)}>Report a source</a></nav></div></div>
      </header>

      <section className="atlas-top-hero" aria-labelledby="hero-title">
        <div className="atlas-hero-content">
          <p className="atlas-hero-kicker">Water for a brighter Lebanon</p>
          <h1 id="hero-title">Know your<br />water.</h1>
          <p>Explore trusted water data across Lebanon<br className="desktop-break" /> and share what you find.</p>
          <div className="atlas-hero-actions"><a href="#atlas">Explore the atlas <ArrowRight size={21} /></a><a href="#community">Report a source</a></div>
        </div>
        <div className="atlas-hero-location"><MapPin size={16} />Lebanon · Mediterranean coast</div>
      </section>

      <section className="atlas-shell" id="atlas">
        <div className="atlas-intro section-heading">
          <p>The water atlas</p>
          <h1>Explore water in Lebanon</h1>
          <span>Official survey indicators, clear definitions and honest coverage across Lebanon’s governorates.</span>
        </div>
        <GovernorateMap />
      </section>

      <section className="harvest-section" id="harvest" aria-labelledby="harvest-title">
        <div className="harvest-content">
          <div className="harvest-heading section-heading">
            <p>Rainwater harvesting</p>
            <h2 id="harvest-title">Estimate your rooftop’s potential</h2>
            <span>Choose your governorate and enter the roof’s horizontal collection area. AquaLeb applies the verified rainfall value and coefficient automatically.</span>
          </div>

          <div className="rain-calculator">
            <form className="rain-input-panel" onSubmit={(event) => event.preventDefault()} noValidate>
              <fieldset>
                <legend><span>1</span><div><strong>Choose your governorate</strong><small>Annual rainfall is filled from the source below.</small></div></legend>
                <label htmlFor="harvest-governorate">Lebanese governorate</label>
                <select id="harvest-governorate" value={rainfallGovernorate} onInput={(event) => setRainfallGovernorate(event.currentTarget.value as RainfallGovernorate | "")} onChange={(event) => setRainfallGovernorate(event.target.value as RainfallGovernorate | "")} aria-describedby="rainfall-data-note">
                  <option value="">Choose a governorate</option>
                  {LEBANESE_GOVERNORATES.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
                <div className={`auto-rainfall${rainfallAvailable ? " is-ready" : rainfallGovernorate ? " is-unavailable" : ""}`} id="rainfall-data-note">
                  <CloudRain size={22} />
                  <div>{rainfallAvailable && rainfallRecord ? <><span>Annual rainfall used</span><strong>{rainfallRecord.annualMm?.toLocaleString()} <small>mm/year</small></strong><p>{rainfallRecord.category} · {rainfallRecord.studyGeography}</p></> : rainfallGovernorate ? <><span>Annual rainfall</span><strong>Unavailable</strong><p>This study does not publish a separate value for {rainfallGovernorate}.</p></> : <><span>Annual rainfall</span><strong>Choose a governorate</strong><p>The fixed study value and source will appear here.</p></>}</div>
                </div>
                <a className="rain-source-link" href={RAINFALL_SOURCE.url} target="_blank" rel="noreferrer">{RAINFALL_SOURCE.title} <ArrowUpRight size={15} /></a>
                <p className="rain-study-note">{RAINFALL_SOURCE.note}</p>
              </fieldset>

              <fieldset>
                <legend><span>2</span><div><strong>Horizontal roof area</strong><small>Use the roof’s plan area, not its sloped surface area.</small></div></legend>
                <label htmlFor="roof-area">Collection area <span>m²</span></label>
                <input id="roof-area" type="number" min="0.1" step="0.1" inputMode="decimal" placeholder="e.g. 100" value={roofArea} onChange={(event) => setRoofArea(event.target.value)} aria-invalid={roofArea !== "" && !roofAreaValid} />
                {roofArea !== "" && !roofAreaValid && <p className="field-error">Enter a roof area greater than 0 m².</p>}
              </fieldset>
              <p className="coefficient-note"><Info size={16} /><span>AquaLeb applies a fixed collection coefficient of <strong>C = {COLLECTION_COEFFICIENT}</strong> in the background.</span></p>
            </form>

            <section className="rain-result-panel" aria-live="polite" aria-labelledby="rain-result-title">
              <div className="rain-formula"><span>Formula</span><strong>Harvestable rainwater = P&nbsp;×&nbsp;A&nbsp;×&nbsp;C</strong><p><b>P</b> rainfall in mm/year · <b>A</b> roof area in m² · <b>C</b> unitless coefficient</p><small>With these units, the numeric result is liters/year. Divide by 1,000 for m³/year.</small></div>
              <div className={`rain-result${calculationValid ? " is-ready" : ""}`}>
                <p id="rain-result-title">Potential rainwater collected per year</p>
                {annualHarvest !== null && rainfallValue !== null ? <><div className="rain-result-primary"><Droplets size={38} /><strong>{Math.round(annualHarvest).toLocaleString()}<span>liters/year</span></strong></div><div className="rain-result-secondary">{(annualHarvest / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} m³/year</div><div className="rain-breakdown"><span>Calculation</span><strong>{rainfallValue.toLocaleString()} mm/year × {roofAreaValue.toLocaleString()} m² × {COLLECTION_COEFFICIENT.toFixed(1)}</strong><small>{rainfallGovernorate} · {RAINFALL_SOURCE.publication}</small></div></> : <div className="rain-result-empty"><CloudRain size={30} /><strong>{rainfallGovernorate && !rainfallAvailable ? `Rainfall unavailable for ${rainfallGovernorate}` : "Enter two details to see your estimate"}</strong><p>{rainfallGovernorate && !rainfallAvailable ? "This study does not provide a separate governorate value, so AquaLeb will not estimate one." : "Choose a governorate and enter a valid roof collection area."}</p></div>}
              </div>
              <aside className="rain-storage-note"><Info size={18} /><p><strong>This is collection potential, not guaranteed stored water.</strong>Actual storage depends on tank capacity, rainfall timing, overflow, first-flush losses and system maintenance.</p></aside>
            </section>
          </div>
        </div>

      </section>

      <section className="data-sources-section" id="sources" aria-labelledby="sources-title">
        <div className="data-sources-heading section-heading">
          <p>The datasets behind the atlas</p>
          <h2 id="sources-title">Data &amp; Sources</h2>
          <span>Six clearly separated sources power AquaLeb. Each result keeps its original geography, date and limitations—sources are never blended into a village-level measurement.</span>
        </div>
        <div className="source-card-grid">
          {SOURCE_REGISTRY.map((source) => {
            const SourceIcon = SOURCE_ICONS[source.key] ?? BookOpen;
            return <article className="source-card" key={source.key}>
              <header className="source-card-header"><span aria-hidden="true"><SourceIcon size={19} /></span><div><p>{source.publisher}</p><h3>{source.dataset}</h3></div><a className="source-link" href={source.url} target="_blank" rel="noreferrer" aria-label={`Open original source: ${source.dataset}`}>Source <ArrowUpRight size={14} /></a></header>
              <details className="source-card-body">
                <summary>View source details</summary>
                <div className="source-card-details">
                  <p className="source-powers"><strong>What it powers in AquaLeb</strong>{source.powers}</p>
                  <dl className="source-summary"><div><dt>Coverage &amp; date</dt><dd>{source.coverage}</dd></div><div><dt>Key limitation</dt><dd>{source.limitation}</dd></div></dl>
                  <details className="source-methodology"><summary>Read methodology</summary><div>{source.methodology.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<dl><div><dt>Resolution / scale</dt><dd>{source.resolutionOrScale}</dd></div><div><dt>Source update</dt><dd>{source.updateDate}</dd></div></dl></div></details>
                </div>
              </details>
            </article>;
          })}
        </div>
      </section>

      <footer className="aqualeb-footer" id="community">
        <div className="footer-main">
          <div className="footer-identity"><a href="#top" className="footer-logo"><Image src={`${basePath}/logo.png`} width={220} height={90} alt="AquaLeb" /></a><p>Open water data for stronger communities<br />and a more resilient Lebanon.</p></div>
          <div className="footer-column"><strong>Explore</strong><a href="#atlas">Water atlas</a><a href="#harvest">Rainwater potential</a><a href="#sources">Data &amp; Sources</a></div>
          <div className="footer-column"><strong>Get involved</strong><a href="#community">Report a source</a><a href="mailto:hello@aqualeb.org">Partner with us</a><a href="mailto:hello@aqualeb.org">Contact</a></div>
          <div className="footer-cta"><span>Help improve Lebanon’s water picture</span><p>Share a verified source or community update with AquaLeb.</p><a href="mailto:hello@aqualeb.org">Report a source <Send size={16} /></a></div>
        </div>
        <div className="footer-legal"><span>© 2026 AquaLeb · Water for a brighter Lebanon</span><p>Official indicators and community-contributed records remain clearly separated.</p></div>
      </footer>
    </main>
  );
}

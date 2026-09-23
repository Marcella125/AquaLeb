"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, Box, BookOpen, CloudRain, Droplets, Leaf, MapPin, Menu, Plus, Search, Send, TreePine, UsersRound } from "lucide-react";
import { GovernorateMap } from "@/components/map/GovernorateMap";
import { DATA_SOURCES, SECTOR_CONTEXT } from "@/data/governorate-water";

const GOVERNORATE_RAINFALL = {
  Akkar: 750,
  "Baalbek-Hermel": 350,
  Bekaa: 450,
  Beirut: 600,
  "Mount Lebanon": 850,
  Nabatieh: 650,
  "North Lebanon": 700,
  "South Lebanon": 700,
} as const;

type RainfallGovernorate = keyof typeof GOVERNORATE_RAINFALL;

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rainfallGovernorate, setRainfallGovernorate] = useState<RainfallGovernorate>("Beirut");
  const [roofArea, setRoofArea] = useState(100);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const pageStyle = {
    "--atlas-hero-image": `url("${basePath}/aqualeb-coast-hero.png")`,
    "--harvest-image": `url("${basePath}/rainwater-harvest-home.png")`,
  } as CSSProperties;
  const annualRainfall = GOVERNORATE_RAINFALL[rainfallGovernorate];
  const annualHarvest = Math.round(Math.max(0, roofArea || 0) * annualRainfall * 0.8);

  return (
    <main className="atlas-page" id="top" style={pageStyle}>
      <header className="atlas-header">
        <a href="#top" className="atlas-wordmark" aria-label="AquaLeb water atlas home"><Image src={`${basePath}/logo.png`} width={220} height={90} alt="AquaLeb" priority /></a>
        <nav className="atlas-desktop-nav" aria-label="Primary navigation"><a href="#atlas">Water atlas</a><a href="#sources">Data sources</a><a href="#context">Sector context</a><a href="#harvest">Rainwater</a></nav>
        <div className="atlas-header-actions"><button type="button" aria-label="Search"><Search size={20} /></button><a href="#community"><Plus size={17} />Report a source</a><div className={`atlas-mobile-nav${mobileMenuOpen ? " is-open" : ""}`}><button type="button" aria-label="Open navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}><Menu size={21} /></button><nav aria-label="Mobile navigation"><a href="#atlas" onClick={() => setMobileMenuOpen(false)}>Water atlas</a><a href="#sources" onClick={() => setMobileMenuOpen(false)}>Data sources</a><a href="#context" onClick={() => setMobileMenuOpen(false)}>Sector context</a><a href="#harvest" onClick={() => setMobileMenuOpen(false)}>Rainwater potential</a><a href="#community" onClick={() => setMobileMenuOpen(false)}>Report a source</a></nav></div></div>
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
        <div className="atlas-intro">
          <div><p className="atlas-eyebrow">The water atlas</p><h1>Explore water in Lebanon</h1><p>Official survey indicators, clear definitions and honest coverage across Lebanon’s governorates.</p></div>
        </div>
        <GovernorateMap />

        <section className="method-grid" id="sources">
          <article><span><BookOpen size={20} /></span><div><p>Official survey source</p><h2>{DATA_SOURCES.lfhlcs_2018_19.shortTitle}</h2><p>All-eight-governorate dwelling indicators from Figure 5.8. Values retain the report’s published precision.</p><a href={DATA_SOURCES.lfhlcs_2018_19.url} target="_blank" rel="noreferrer">Open original report <ArrowUpRight size={15} /></a></div></article>
          <article><span><BookOpen size={20} /></span><div><p>Official survey source</p><h2>{DATA_SOURCES.mics_2023.shortTitle}</h2><p>Five-governorate population indicators. Mount Lebanon and Bekaa are visibly marked as incomplete; three governorates remain unavailable.</p><a href={DATA_SOURCES.mics_2023.url} target="_blank" rel="noreferrer">Open original workbook <ArrowUpRight size={15} /></a></div></article>
          <article id="context"><span><BookOpen size={20} /></span><div><p>National context only</p><h2>{SECTOR_CONTEXT.title}</h2><p>{SECTOR_CONTEXT.use}</p><a href={SECTOR_CONTEXT.url} target="_blank" rel="noreferrer">Read the strategy <ArrowUpRight size={15} /></a></div></article>
        </section>
      </section>

      <section className="harvest-section" id="harvest" aria-labelledby="harvest-title">
        <div className="harvest-content">
          <h2 id="harvest-title">Every rooftop <em>has potential.</em></h2>
          <p className="harvest-lede">Estimate how much rainwater you can harvest and be part of a more resilient, water-secure Lebanon.</p>

          <div className="harvest-tools">
            <form className="harvest-form" onSubmit={(event) => event.preventDefault()}>
              <div><h3>Calculate your rainwater potential</h3><p>Simple inputs. A bigger tomorrow.</p></div>
              <label htmlFor="harvest-governorate">Governorate</label>
              <select id="harvest-governorate" value={rainfallGovernorate} onChange={(event) => setRainfallGovernorate(event.target.value as RainfallGovernorate)}>
                {Object.keys(GOVERNORATE_RAINFALL).map((name) => <option key={name}>{name}</option>)}
              </select>
              <label htmlFor="roof-area">Roof area (m²)</label>
              <input id="roof-area" type="number" min="1" max="10000" inputMode="decimal" value={roofArea} onChange={(event) => setRoofArea(Number(event.target.value))} />
              <button type="submit">Calculate <ArrowRight size={17} /></button>
              <small>Planning estimate using an 80% collection efficiency.</small>
            </form>

            <div className="harvest-result" aria-live="polite">
              <p>Estimated annual harvest</p>
              <div className="harvest-total"><Droplets size={45} /><strong>{annualHarvest.toLocaleString()} <span>liters</span></strong></div>
              <span className="harvest-per-year">of rainwater per year</span>
              <div className="harvest-result-grid">
                <div><Box size={27} /><p><strong>{(annualHarvest / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} m³</strong><span>Potential captured volume</span></p></div>
                <div><CloudRain size={29} /><p><strong>{annualRainfall} mm/year</strong><span>Illustrative local rainfall</span></p></div>
              </div>
              <blockquote>Small changes. A wetter, brighter Lebanon.</blockquote>
            </div>
          </div>
        </div>

        <div className="harvest-benefits" aria-label="Rainwater harvesting benefits">
          <div><Leaf size={30} /><span>Conserve<br />freshwater</span></div>
          <div><UsersRound size={31} /><span>Stronger<br />communities</span></div>
          <div><TreePine size={31} /><span>A more<br />resilient Lebanon</span></div>
          <div><Droplets size={31} /><span>A cleaner,<br />greener future</span></div>
        </div>
      </section>

      <footer className="aqualeb-footer" id="community">
        <div className="footer-main">
          <div className="footer-identity"><a href="#top" className="footer-logo"><Image src={`${basePath}/logo.png`} width={220} height={90} alt="AquaLeb" /></a><p>Open water data for stronger communities<br />and a more resilient Lebanon.</p></div>
          <div className="footer-column"><strong>Explore</strong><a href="#atlas">Water atlas</a><a href="#sources">Data sources</a><a href="#context">Sector context</a></div>
          <div className="footer-column"><strong>Get involved</strong><a href="#community">Report a source</a><a href="mailto:hello@aqualeb.org">Partner with us</a><a href="mailto:hello@aqualeb.org">Contact</a></div>
          <div className="footer-cta"><span>Help improve Lebanon’s water picture</span><p>Share a verified source or community update with AquaLeb.</p><a href="mailto:hello@aqualeb.org">Report a source <Send size={16} /></a></div>
        </div>
        <div className="footer-legal"><span>© 2026 AquaLeb · Water for a brighter Lebanon</span><p>Official indicators and community-contributed records remain clearly separated.</p></div>
      </footer>
    </main>
  );
}

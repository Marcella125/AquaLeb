"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, AtSign, BookOpen, Globe2, MapPin, Menu, Plus, Search, Send } from "lucide-react";
import { GovernorateMap } from "@/components/map/GovernorateMap";
import { DATA_SOURCES, SECTOR_CONTEXT } from "@/data/governorate-water";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="atlas-page" id="top">
      <header className="atlas-header">
        <a href="#top" className="atlas-wordmark" aria-label="AquaLeb water atlas home"><Image src="/logo.png" width={220} height={90} alt="AquaLeb" priority /></a>
        <nav className="atlas-desktop-nav" aria-label="Primary navigation"><a href="#atlas">Water atlas</a><a href="#sources">Data sources</a><a href="#context">Sector context</a></nav>
        <div className="atlas-header-actions"><button type="button" aria-label="Search"><Search size={20} /></button><a href="#community"><Plus size={17} />Report a source</a><div className={`atlas-mobile-nav${mobileMenuOpen ? " is-open" : ""}`}><button type="button" aria-label="Open navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}><Menu size={21} /></button><nav aria-label="Mobile navigation"><a href="#atlas" onClick={() => setMobileMenuOpen(false)}>Water atlas</a><a href="#sources" onClick={() => setMobileMenuOpen(false)}>Data sources</a><a href="#context" onClick={() => setMobileMenuOpen(false)}>Sector context</a><a href="#community" onClick={() => setMobileMenuOpen(false)}>Report a source</a></nav></div></div>
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

      <footer className="aqualeb-footer" id="community">
        <div className="footer-main">
          <div className="footer-identity"><a href="#top" className="footer-logo"><Image src="/logo.png" width={220} height={90} alt="AquaLeb" /></a><p>Open water data for stronger communities<br />and a more resilient Lebanon.</p></div>
          <div className="footer-column"><strong>Explore</strong><a href="#atlas">Water atlas</a><a href="#sources">Data sources</a><a href="#context">Sector context</a></div>
          <div className="footer-column"><strong>Get involved</strong><a href="#community">Report a source</a><a href="mailto:hello@aqualeb.org">Partner with us</a><a href="mailto:hello@aqualeb.org">Contact</a></div>
          <div className="footer-cta"><span>Help improve Lebanon’s water picture</span><p>Share a verified source or community update with AquaLeb.</p><a href="mailto:hello@aqualeb.org">Report a source <Send size={16} /></a></div>
        </div>
        <div className="footer-legal"><span>© 2026 AquaLeb · Water for a brighter Lebanon</span><p>Official indicators and community-contributed records remain clearly separated.</p><div><a href="#top" aria-label="AquaLeb website"><Globe2 size={16} /></a><a href="mailto:hello@aqualeb.org" aria-label="Email AquaLeb"><AtSign size={16} /></a></div></div>
      </footer>
    </main>
  );
}

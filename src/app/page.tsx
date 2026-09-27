"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, Menu, Send, X } from "lucide-react";
import { DataTransparency } from "@/components/DataTransparency";
import { GovernorateMap } from "@/components/map/GovernorateMap";
import { LocationIntelligence } from "@/components/map/LocationIntelligence";
import { RainwaterCalculator } from "@/components/RainwaterCalculator";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const pageStyle = {
    "--atlas-hero-image": `url("${basePath}/aqualeb-coast-hero.png")`,
  } as CSSProperties;
  useEffect(() => {
    let frame = 0;
    const updateScrollEffects = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setHeaderScrolled(scrollY > 12);
        heroRef.current?.style.setProperty("--hero-parallax", `${Math.min(scrollY * 0.1, 58)}px`);
        heroRef.current?.style.setProperty("--hero-fade", `${Math.max(0.72, 1 - scrollY / 1500)}`);
      });
    };

    updateScrollEffects();
    window.addEventListener("scroll", updateScrollEffects, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScrollEffects);
    };
  }, []);

  return (
    <main className="atlas-page" id="top" style={pageStyle}>
      <header className={`atlas-header${headerScrolled ? " is-scrolled" : ""}`}>
        <a href="#top" className="atlas-wordmark" aria-label="AQUALEB home">
          <Image className="brand-logo-base" src={`${basePath}/logo.png`} width={220} height={90} alt="AQUALEB" priority />
        </a>
        <nav className="atlas-desktop-nav" aria-label="Primary navigation"><a href="#top">Home</a><a href="#atlas">Map &amp; Data</a><a href="#harvest">Calculator</a><a href="#sources">About</a></nav>
        <div className="atlas-header-actions">
          <a className="atlas-explore-link" href="#atlas">Explore Data <ArrowRight size={16} /></a>
          <div className={`atlas-mobile-nav${mobileMenuOpen ? " is-open" : ""}`}>
            <button type="button" aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}</button>
            <nav aria-label="Mobile navigation"><a href="#top" onClick={() => setMobileMenuOpen(false)}>Home</a><a href="#atlas" onClick={() => setMobileMenuOpen(false)}>Map &amp; Data</a><a href="#harvest" onClick={() => setMobileMenuOpen(false)}>Calculator</a><a href="#sources" onClick={() => setMobileMenuOpen(false)}>About</a><a className="mobile-explore-link" href="#atlas" onClick={() => setMobileMenuOpen(false)}>Explore Data <ArrowRight size={16} /></a></nav>
          </div>
        </div>
      </header>

      <section className="atlas-top-hero" aria-labelledby="hero-title" ref={heroRef}>
        <div className="atlas-hero-content">
          <p className="atlas-hero-kicker">Data <i /> Nature <i /> A Sustainable Lebanon</p>
          <h1 id="hero-title">Lebanon&apos;s<br />Water, Land<br />and Future</h1>
          <p>Explore authoritative data on Lebanon&apos;s water resources, soils and agricultural land to support more resilient and informed planning.</p>
          <div className="atlas-hero-actions"><a href="#atlas">Explore the Map <ArrowRight size={19} /></a><a href="#atlas">Learn More <ArrowDown size={17} /></a></div>
        </div>
        <aside className="atlas-hero-stats" aria-label="Lebanon at a glance">
          <p className="hero-stats-label">Lebanon at a glance</p>
          <div><strong>8</strong><span>Governorates</span></div>
          <div><strong>10,452 km<sup>2</sup></strong><span>Total area</span></div>
          <div><strong>~231,000 ha</strong><span>Agricultural land<small>2010/11 census</small></span></div>
          <div className="hero-source-stat"><strong>Official &amp; published</strong><span>Data sources</span></div>
        </aside>
        <a className="atlas-scroll-cue" href="#atlas" aria-label="Scroll to explore Lebanon"><span>Scroll to explore</span><i><ArrowDown size={14} /></i></a>
      </section>

      <section className="atlas-shell" id="atlas">
        <div className="atlas-intro section-heading">
          <div className="atlas-intro-main"><p>Explore Lebanon</p><h1>One Map, Multiple Insights</h1><span>Switch between trusted data layers to explore water resources, soil types and agricultural land across Lebanon.</span></div>
          <aside className="atlas-intro-source"><span aria-hidden="true" /><p>All data is based on official and published sources, including Lebanon&apos;s Ministry of Energy and Water, Ministry of Agriculture, CNRS and FAO.</p></aside>
        </div>
        <GovernorateMap />
      </section>

      <LocationIntelligence />

      <RainwaterCalculator />

      <DataTransparency />

      <footer className="aqualeb-footer" id="community">
        <div className="footer-main">
          <div className="footer-identity"><a href="#top" className="footer-logo"><Image className="brand-logo-base" src={`${basePath}/logo.png`} width={220} height={90} alt="AquaLeb" /></a><p>Open water data for stronger communities<br />and a more resilient Lebanon.</p></div>
          <div className="footer-column"><strong>Explore</strong><a href="#atlas">Water atlas</a><a href="#harvest">Rainwater potential</a><a href="#sources">Data &amp; Sources</a></div>
          <div className="footer-column"><strong>Get involved</strong><a href="#community">Report a source</a><a href="mailto:hello@aqualeb.org">Partner with us</a><a href="mailto:hello@aqualeb.org">Contact</a></div>
          <div className="footer-cta"><span>Help improve Lebanon’s water picture</span><p>Share a verified source or community update with AquaLeb.</p><a href="mailto:hello@aqualeb.org">Report a source <Send size={16} /></a></div>
        </div>
        <div className="footer-legal"><span>© 2026 AquaLeb · Water for a brighter Lebanon</span><p>Official indicators and community-contributed records remain clearly separated.</p></div>
      </footer>
    </main>
  );
}

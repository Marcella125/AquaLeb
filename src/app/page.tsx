import type { CSSProperties } from "react";
import { ArrowUpRight, CloudRain, Droplet, FlaskConical, MapPin, Waves } from "lucide-react";
import { AtlasMap } from "@/components/map/AtlasMap";
import { ReservoirChart } from "@/components/dashboard/ReservoirChart";
import { WaterProductionChart } from "@/components/dashboard/WaterProductionChart";
import { demoLocation } from "@/data/demo";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const atlasStyle = { "--atlas-image": `url("${basePath}/lebanon-atlas.png")` } as CSSProperties;

const indicators = [
  { icon: CloudRain, name: "Rainfall", value: "18 mm", detail: "Demo monthly snapshot", note: "Below seasonal average" },
  { icon: Waves, name: "Springs", value: "3", detail: "Mapped springs", note: "~420 m3/day demo" },
  { icon: Droplet, name: "Wells", value: "5", detail: "Active wells", note: "~730 m3/day demo" },
  { icon: WaterTowerIcon, name: "Reservoirs", value: "2", detail: "Main reservoirs", note: "2,500 m3 demo total" },
  { icon: Droplet, name: "Groundwater", value: "Watch", detail: "Demo status", note: "Continued monitoring" },
  { icon: FlaskConical, name: "Water quality", value: "Good", detail: "Demo assessment", note: "Illustrative only" },
];

function WaterTowerIcon({ size = 32 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 6h18l-2 15H9L7 6Z" stroke="currentColor" strokeWidth="1.5"/><path d="M10 11h12M12 21l-2 6m10-6 2 6M7 27h18M13 6V3h6v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M11 17c2-2 3 2 5 0s3 2 5 0" stroke="currentColor" strokeWidth="1.3"/></svg>;
}

function Brand({ inverse = false }: { inverse?: boolean }) {
  return <a className={`atlas-brand${inverse ? " atlas-brand-inverse" : ""}`} href="#top" aria-label="AquaLeb home"><span className="brand-drop"><Droplet size={30} strokeWidth={1.4} fill="currentColor" /></span><span>AquaLeb</span></a>;
}

export default function Home() {
  return (
    <main id="top" className="atlas-site">
      <header className="atlas-header"><div className="site-container header-inner"><Brand /><nav aria-label="Main navigation"><a href="#explore">Explore</a><a href="#stories">Water stories</a><a href="#about">About the data</a></nav><a className="button button-dark header-cta" href="#explore">Explore the map <ArrowUpRight size={15} /></a></div></header>

      <section className="atlas-hero" style={atlasStyle} aria-labelledby="hero-title">
        <div className="hero-map-art" aria-hidden="true" />
        <div className="site-container hero-layout">
          <div className="hero-content"><p className="kicker">A clearer picture of Lebanon&apos;s water</p><h1 id="hero-title">Know the<br /><em>water.</em><br />Know the<br />place.</h1><p className="hero-intro">Maps, data and stories to better understand Lebanon&apos;s water resources - and the places and people that depend on them.</p><a className="button button-dark" href="#explore">Explore Ehden <ArrowUpRight size={16} /></a><div className="hero-signoff"><span>Clearer data.<br />Brighter tomorrows.</span><span className="signoff-quote">&ldquo;Water connects every place in Lebanon.&rdquo;</span></div></div>
          <div className="hero-geography" aria-hidden="true"><span className="sea-label">M e d i t e r r a n e a n<br />S e a</span><span className="map-city city-tripoli">Tripoli</span><span className="map-city city-beirut">Beirut</span><span className="map-city city-ehden"><MapPin size={21} fill="currentColor" /> Ehden</span><span className="hero-north">N<br />&#9651;</span></div>
          <div className="hero-stat-card"><div className="hero-stat-place"><span className="mini-mountain" aria-hidden="true">&#9651;</span><div><small>Featured place</small><strong>Ehden</strong><span>Zgharta District, North Lebanon</span></div></div><div><small>Daily production</small><strong>1,150 m3/day</strong><span>Demo estimate</span></div><div><small>Reservoir level</small><strong>56%</strong><span className="mini-progress"><i /></span></div><a href="#place">View more details <ArrowUpRight size={15} /></a></div>
        </div>
      </section>

      <section className="site-container section-block" id="explore"><div className="section-topline" /><div className="section-heading"><div><p className="kicker">Explore Lebanon&apos;s water resources</p><h2>Water, place by place.</h2></div><p>An interactive atlas of Lebanon&apos;s water systems, from mountain springs to coastal aquifers. Explore the data, the places and the people behind them.</p></div><div className="explore-grid"><AtlasMap imageUrl={`${basePath}/lebanon-atlas.png`} /><article className="place-card" id="place"><div className="place-photo" style={{ backgroundImage: `url("${basePath}/ehden-landscape.png")` }} role="img" aria-label="Illustrative view of a mountain village in Ehden" /><div className="place-card-body"><div className="place-title-row"><div><h3>Ehden</h3><p>Zgharta District, North Lebanon</p></div><span>34.246 deg N<br />36.022 deg E</span></div><p className="place-description">A mountain town known for its abundant springs, Ehden plays a vital role in supplying water to surrounding communities.</p><div className="water-status"><small>Water status</small><div><Droplet size={24} fill="currentColor" /><strong>Moderate</strong><span>Stable supply with seasonal variation. No immediate risk.</span></div></div><div className="place-facts"><div><small>Population</small><strong>12,500</strong><span>Demo estimate</span></div><div><small>Daily production</small><strong>1,150 m3/day</strong><span>From Ehden springs</span></div><div><small>Reservoir level</small><strong>56%</strong><span className="mini-progress"><i /></span></div><div><small>Main sources</small><strong className="fact-sources">Ehden springs<br />Local wells</strong></div></div></div></article></div></section>

      <section className="site-container section-block" id="stories"><div className="section-topline" /><div className="section-heading"><div><p className="kicker">Trends over time</p><h2>Look beneath the surface.</h2></div><p>From daily production to reservoir levels, explore how water availability changes over time in Ehden.</p></div><div className="atlas-charts"><WaterProductionChart data={demoLocation.production} /><ReservoirChart data={demoLocation.reservoir} /></div></section>

      <section className="site-container section-block indicators-block"><div className="section-topline" /><div className="section-heading"><div><p className="kicker">At a glance</p><h2>Key indicators.</h2></div><p>A snapshot of Ehden&apos;s water resources, combining natural supplies, infrastructure and quality indicators.</p></div><div className="atlas-indicators">{indicators.map(({ icon: Icon, name, value, detail, note }) => <div className="atlas-indicator" key={name}><Icon size={34} strokeWidth={1.35} /><small>{name}</small><strong>{value}</strong><span>{detail}</span><em>{note}</em></div>)}</div></section>

      <section className="site-container transparency" id="about"><div><p className="kicker">Data transparency</p><h2>Open data for a<br />clearer tomorrow.</h2></div><p>All figures on this page are illustrative demo data and may not reflect real-time conditions. Our goal is to make water data more accessible, comparable and useful for everyone.</p><div className="transparency-links"><a href="#explore">Explore the map <ArrowUpRight size={15} /></a><a href="#stories">View trends <ArrowUpRight size={15} /></a><a href="#top">Back to top <ArrowUpRight size={15} /></a></div></section>

      <footer className="atlas-footer"><div className="site-container footer-main"><div><Brand inverse /><p>People. Places. Water.<br />A stronger Lebanon.</p></div><nav aria-label="Footer navigation"><a href="#explore">Explore</a><a href="#stories">Water stories</a><a href="#about">About the data</a></nav><span>Clearer data.<br />Brighter tomorrows.</span></div><div className="site-container footer-bottom"><span>&copy; 2026 AquaLeb. All rights reserved.</span><span>Built for a more water-secure Lebanon.</span></div></footer>
    </main>
  );
}

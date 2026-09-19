import { Bookmark, ChevronRight, Share2 } from "lucide-react";
import { DataSources } from "@/components/dashboard/DataSources";
import { Hero } from "@/components/dashboard/Hero";
import { KeyIndicators } from "@/components/dashboard/KeyIndicators";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ReservoirChart } from "@/components/dashboard/ReservoirChart";
import { WaterProductionChart } from "@/components/dashboard/WaterProductionChart";
import { WaterStatus } from "@/components/dashboard/WaterStatus";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { GoogleLebanonMap } from "@/components/map/GoogleLebanonMap";
import { demoLocation, locationTabs } from "@/data/demo";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <section className="dashboard" id="map">
        <Sidebar />
        <GoogleLebanonMap />
        <div className="detail-panel">
          <header className="location-header">
            <div className="breadcrumbs"><span>Lebanon</span><ChevronRight size={13} /><span>North</span><ChevronRight size={13} /><strong>Ehden</strong></div>
            <div className="location-title"><div><span className="demo-badge">Frontend demo</span><h2>{demoLocation.name}</h2><p>{demoLocation.district} <i /> {demoLocation.governorate}</p></div><div className="round-actions"><button aria-label="Save location" type="button"><Bookmark size={17} /></button><button aria-label="Share location" type="button"><Share2 size={17} /></button></div></div>
          </header>
          <nav className="tabs" aria-label="Location data categories">{locationTabs.map((tab, index) => <button className={index === 0 ? "active" : ""} type="button" key={tab}>{tab}</button>)}</nav>
          <div className="summary-grid"><WaterStatus status={demoLocation.status} />{demoLocation.metrics.map((metric) => <MetricCard metric={metric} key={metric.label} />)}</div>
          <div className="charts-grid"><WaterProductionChart data={demoLocation.production} /><ReservoirChart data={demoLocation.reservoir} /></div>
          <KeyIndicators indicators={demoLocation.indicators} />
          <DataSources sources={demoLocation.sources} />
        </div>
      </section>
    </main>
  );
}

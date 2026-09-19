import { CircleGauge, CloudRain, Database, Droplets, ShieldCheck, Waves } from "lucide-react";
import type { Indicator } from "@/types/water";

const icons = { rainfall: CloudRain, spring: Waves, well: Droplets, reservoir: Database, groundwater: CircleGauge, quality: ShieldCheck };

export function KeyIndicators({ indicators }: { indicators: Indicator[] }) {
  return (
    <section className="content-section indicators-section">
      <div className="section-heading"><div><span className="eyebrow">At a glance</span><h2>Key indicators</h2></div><span className="demo-badge">Demo data</span></div>
      <div className="indicator-grid">
        {indicators.map((indicator) => {
          const Icon = icons[indicator.icon];
          return <article className={`indicator ${indicator.tone}`} key={indicator.label}><Icon size={19} /><div><small>{indicator.label}</small><strong>{indicator.value}</strong><span>{indicator.detail}</span></div></article>;
        })}
      </div>
    </section>
  );
}

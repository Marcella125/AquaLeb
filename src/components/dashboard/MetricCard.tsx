import { Droplet, Gauge, Users, Waves } from "lucide-react";
import type { Metric } from "@/types/water";

const icons = { population: Users, water: Droplet, production: Waves, reservoir: Gauge };

export function MetricCard({ metric }: { metric: Metric }) {
  const Icon = icons[metric.icon];
  return (
    <article className="metric-card">
      <div className="metric-label"><Icon size={17} /><span>{metric.label}</span></div>
      <div className="metric-value">{metric.value}<small>{metric.unit}</small></div>
      {metric.icon === "reservoir" && <div className="progress"><span style={{ width: metric.value + "%" }} /></div>}
      {metric.trend && <div className={`trend ${metric.trendDirection}`}>{metric.trend}</div>}
      <small className="metric-detail">{metric.detail}</small>
    </article>
  );
}

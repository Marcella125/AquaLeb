import { Droplets } from "lucide-react";
import type { WaterStatusData } from "@/types/water";

export function WaterStatus({ status }: { status: WaterStatusData }) {
  return (
    <article className="status-card">
      <div className="status-heading"><span className="status-icon"><Droplets size={20} /></span><span><small>Water status</small><strong>{status.level}</strong></span></div>
      <div className="status-gauge"><i /><i /><i /><i /><span /></div>
      <p>{status.summary}</p>
      <small className="muted">{status.updated}</small>
    </article>
  );
}

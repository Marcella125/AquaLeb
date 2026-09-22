"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProductionPoint } from "@/types/water";

export function WaterProductionChart({ data }: { data: ProductionPoint[] }) {
  return (
    <section className="chart-card">
      <div className="chart-title"><div><span className="eyebrow">Flow composition</span><h2>Water production</h2></div><span>m3 / day</span></div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 0, left: -26, bottom: 0 }}>
            <CartesianGrid stroke="#e0e9e8" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#70849a", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9aabba", fontSize: 10 }} />
            <Tooltip cursor={{ fill: "#f3f8fc" }} contentStyle={{ borderRadius: 12, borderColor: "#dbe8f2", fontSize: 12 }} />
            <Bar dataKey="springs" stackId="a" fill="#205b7a" radius={[0, 0, 3, 3]} />
            <Bar dataKey="wells" stackId="a" fill="#6696aa" />
            <Bar dataKey="other" stackId="a" fill="#a8c4c9" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="legend"><span><i className="spring" />Springs</span><span><i className="well" />Wells</span><span><i className="other" />Other</span></div>
    </section>
  );
}

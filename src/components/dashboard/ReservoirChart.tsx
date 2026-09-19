"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReservoirPoint } from "@/types/water";

export function ReservoirChart({ data }: { data: ReservoirPoint[] }) {
  return (
    <section className="chart-card">
      <div className="chart-title"><div><span className="eyebrow">Stored supply</span><h2>Reservoir level</h2></div><strong>56%</strong></div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
            <defs><linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#198bea" stopOpacity={0.28} /><stop offset="100%" stopColor="#198bea" stopOpacity={0.02} /></linearGradient></defs>
            <CartesianGrid stroke="#e3edf5" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#70849a", fontSize: 11 }} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#9aabba", fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#dbe8f2", fontSize: 12 }} formatter={(value) => [`${value}%`, "Level"]} />
            <Area type="monotone" dataKey="level" stroke="#087de1" strokeWidth={2.5} fill="url(#waterFill)" dot={{ r: 2.5, fill: "#087de1", strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-note">Demo capacity trend · Jan–Sep</p>
    </section>
  );
}

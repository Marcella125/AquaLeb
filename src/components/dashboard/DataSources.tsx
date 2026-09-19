import { ArrowUpRight, Link2 } from "lucide-react";

export function DataSources({ sources }: { sources: string[] }) {
  return (
    <section className="content-section sources-section">
      <div className="section-heading"><div><span className="eyebrow">Transparency</span><h2>Data sources</h2></div><button type="button">Methodology <ArrowUpRight size={14} /></button></div>
      <p className="sources-intro">Source labels are illustrative for this frontend prototype. No measurements shown are verified.</p>
      <div className="source-list">{sources.map((source) => <div key={source}><Link2 size={14} /><span>{source}</span></div>)}</div>
    </section>
  );
}

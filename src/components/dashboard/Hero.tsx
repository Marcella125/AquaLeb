import type { CSSProperties } from "react";
import { Sparkles } from "lucide-react";

export function Hero() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const heroStyle = { "--hero-image": `url("${basePath}/bg.png")` } as CSSProperties;

  return (
    <section className="hero" style={heroStyle}>
      <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
      <div className="hero-copy">
        <span className="hero-kicker"><Sparkles size={14} /> Water intelligence, made local</span>
        <h1>Smarter water<br />for a <em>brighter</em> Lebanon.</h1>
        <p>Explore real data, understand water challenges, and support stronger, more resilient communities.</p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="contour contour-one" /><div className="contour contour-two" /><div className="contour contour-three" />
        <div className="water-drop" />
      </div>
    </section>
  );
}

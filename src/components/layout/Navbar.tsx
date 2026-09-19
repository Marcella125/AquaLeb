import Image from "next/image";
import { ArrowUpRight, Menu, Search } from "lucide-react";

const links = ["Home", "Map", "Data", "Insights", "Alerts", "For Municipalities", "About"];

export function Navbar() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <header className="navbar">
      <a className="brand" href="#" aria-label="AquaLeb home">
        <Image className="brand-logo" src={`${basePath}/logo.png`} alt="AquaLeb — Water for a brighter Lebanon" width={220} height={110} priority />
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        {links.map((link, index) => <a className={index === 0 ? "active" : ""} href={`#${link.toLowerCase().replaceAll(" ", "-")}`} key={link}>{link}</a>)}
      </nav>
      <div className="nav-actions">
        <label className="search"><Search size={16} /><input aria-label="Search" placeholder="Search places or water data" /></label>
        <button className="language" type="button">EN <span>/</span> عربي</button>
        <button className="sign-in" type="button">Sign in <ArrowUpRight size={16} /></button>
        <button className="menu-button" aria-label="Open menu" type="button"><Menu /></button>
      </div>
    </header>
  );
}

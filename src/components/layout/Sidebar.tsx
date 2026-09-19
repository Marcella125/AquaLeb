import { Bell, Building2, ChartNoAxesColumnIncreasing, CloudRain, Droplets, Gauge, House, Map, MapPin, MountainSnow, Waves, Users, CircleDot, Database } from "lucide-react";

const navigation = [
  ["Overview", House], ["Map", Map], ["Governorates", Building2], ["Districts", MapPin],
  ["Villages & Cities", Users], ["Insights", ChartNoAxesColumnIncreasing], ["Alerts", Bell],
] as const;
const layers = [
  ["Water Sources", Droplets, true], ["Reservoirs", Database, true], ["Wells", CircleDot, true],
  ["Springs", Waves, true], ["Rivers & Lakes", Waves, true], ["Rainfall", CloudRain, false],
  ["Groundwater", Gauge, false], ["Drought Risk", MountainSnow, true], ["Population", Users, false],
] as const;

export function Sidebar() {
  return (
    <aside className="sidebar panel-shell">
      <nav aria-label="Dashboard navigation">
        {navigation.map(([label, Icon]) => (
          <a href={`#${label.toLowerCase().replaceAll(" ", "-")}`} className={`side-link ${label === "Map" ? "selected" : ""}`} key={label}>
            <Icon size={17} /><span>{label}</span>
          </a>
        ))}
      </nav>
      <div className="side-divider" />
      <p className="eyebrow">Water layers</p>
      <div className="layers">
        {layers.map(([label, Icon, enabled]) => (
          <div className="layer-row" key={label}><span><Icon size={16} />{label}</span><span className={`switch ${enabled ? "on" : ""}`} aria-label={`${label} ${enabled ? "on" : "off"}`} /></div>
        ))}
      </div>
      <div className="sidebar-note">
        <Droplets size={20} />
        <p>Better water decisions start with clearer local data.</p>
      </div>
    </aside>
  );
}

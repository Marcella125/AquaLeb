"use client";

import { useState } from "react";
import { AlignJustify, ArrowRight, CloudRain, Droplets, Gauge, Grid2X2, Info, Layers3, MapPin, Ruler, Square } from "lucide-react";
import { PlaceSearch } from "@/components/map/PlaceSearch";
import type { PlaceRecord } from "@/data/places";
import { MAX_ROOF_AREA_M2, MIN_ROOF_AREA_M2, ROOF_MATERIALS, type RoofMaterialKey } from "@/data/rainwater-harvesting";
import { getRainfallAtCoordinate } from "@/data/lebanon-rainfall";
import { calculateRainwaterEstimate, type RainwaterEstimate } from "@/lib/rainwater";

const MATERIAL_ICONS = {
  concrete: Square,
  tiles: Grid2X2,
  metal: AlignJustify,
  other: Layers3,
} as const;

type CalculatorStatus = "ready" | "result" | "unavailable";

function Metric({ icon: Icon, label, value, note }: { icon: typeof Droplets; label: string; value: React.ReactNode; note: string }) {
  return <div className="harvest-metric"><span><Icon size={19} /></span><div><p>{label}</p><strong>{value}</strong><small>{note}</small></div></div>;
}

function ReadyPanel() {
  return <div className="harvest-ready-panel">
    <span><Droplets size={31} /></span>
    <p>Rainwater potential</p>
    <h3>Ready to estimate your annual harvest</h3>
    <div className="harvest-ready-flow"><span>Location</span><i /><span>Roof</span><i /><span>Estimate</span></div>
    <small>Complete the three inputs, then calculate your potential.</small>
  </div>;
}

function ResultPanel({ estimate }: { estimate: RainwaterEstimate }) {
  const annualLitres = Math.round(estimate.result.litresPerYear);
  return <div className="harvest-results" aria-live="polite">
    <div className="harvest-result-hero">
      <p>Estimated annual harvest</p>
      <div><strong>{annualLitres.toLocaleString()}</strong><span>litres/year</span></div>
      <small>Based on {estimate.rainfall.value.toLocaleString()} mm/year ({estimate.rainfall.calculationBasis}) from the {estimate.rainfall.band} mm/year map band at this location, a roof catchment area of {estimate.roof.areaM2.toLocaleString()} m² and the selected {estimate.roof.material.toLowerCase()} roof characteristics.</small>
    </div>

    <div className="harvest-metrics-grid">
      <Metric icon={CloudRain} label="Annual rainfall" value={<>{estimate.rainfall.value.toLocaleString()} <em>mm/year</em></>} note={`${estimate.rainfall.band} band · ${estimate.rainfall.calculationBasis}`} />
      <Metric icon={Ruler} label="Roof area" value={<>{estimate.roof.areaM2.toLocaleString()} <em>m²</em></>} note="Horizontal catchment" />
      <Metric icon={Gauge} label="Runoff coefficient" value={estimate.roof.runoffCoefficient.toFixed(2)} note={`${estimate.roof.material} roof`} />
      <Metric icon={Droplets} label="Annual harvest" value={<>{annualLitres.toLocaleString()} <em>L</em></>} note={`≈ ${estimate.result.cubicMetresPerYear.toLocaleString(undefined, { maximumFractionDigits: 1 })} m³`} />
    </div>

    <div className="harvest-monthly-average"><span><Droplets size={18} /></span><div><p>Annualized monthly average</p><strong>{Math.round(estimate.result.annualizedMonthlyAverageLitres).toLocaleString()} L/month</strong><small>This is the annual estimate divided by 12 for planning only. Actual monthly collection varies with Lebanon&apos;s seasonal rainfall.</small></div></div>

    <details className="harvest-analysis-details"><summary>View deeper analysis <ArrowRight size={15} /></summary><div><dl><div><dt>Location used</dt><dd>{estimate.location.name}, {estimate.location.governorate}</dd></div><div><dt>Coordinates</dt><dd>{estimate.location.coordinates.lat.toFixed(4)}° N · {estimate.location.coordinates.lng.toFixed(4)}° E</dd></div><div><dt>Published rainfall band</dt><dd>{estimate.rainfall.band} mm/year</dd></div><div><dt>Calculation value</dt><dd>{estimate.rainfall.value.toLocaleString()} mm/year · {estimate.rainfall.calculationBasis}</dd></div><div><dt>Annual storage planning</dt><dd>{estimate.result.cubicMetresPerYear.toLocaleString(undefined, { maximumFractionDigits: 2 })} m³ before tank overflow and operational losses</dd></div></dl><p>The source publishes mapped annual rainfall bands, not exact point or monthly values. AQUALEB uses the midpoint of each closed band and the lower bound of the open-ended &gt;1,400 mm band.</p></div></details>

  </div>;
}

export function RainwaterCalculator() {
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecord | null>(null);
  const [roofArea, setRoofArea] = useState("150");
  const [materialKey, setMaterialKey] = useState<RoofMaterialKey>("concrete");
  const [status, setStatus] = useState<CalculatorStatus>("ready");
  const [estimate, setEstimate] = useState<RainwaterEstimate | null>(null);
  const [validationMessage, setValidationMessage] = useState("");

  const invalidateResult = () => {
    setStatus("ready");
    setEstimate(null);
    setValidationMessage("");
  };

  const choosePlace = (place: PlaceRecord) => {
    invalidateResult();
    setSelectedPlace(place);
  };

  const clearPlace = () => {
    invalidateResult();
    setSelectedPlace(null);
  };

  const calculate = () => {
    const area = Number(roofArea);
    if (!selectedPlace) { setValidationMessage("Select a village, town or location in Lebanon."); return; }
    if (!Number.isFinite(area) || area < MIN_ROOF_AREA_M2 || area > MAX_ROOF_AREA_M2) { setValidationMessage(`Enter a roof area between ${MIN_ROOF_AREA_M2} and ${MAX_ROOF_AREA_M2.toLocaleString()} m².`); return; }
    const nextEstimate = calculateRainwaterEstimate(selectedPlace, area, materialKey);
    setValidationMessage("");
    if (!nextEstimate) {
      setValidationMessage("The selected coordinate falls outside the digitized rainfall zones in the published map.");
      setStatus("unavailable");
      return;
    }

    setEstimate(nextEstimate);
    setStatus("result");
  };

  const rainfallRecord = selectedPlace ? getRainfallAtCoordinate(selectedPlace.lat, selectedPlace.lng) : null;

  return <section className="harvest-section" id="harvest" aria-labelledby="harvest-title">
    <div className="harvest-content">
      <header className="harvest-heading">
        <div><p>Calculate your potential</p><h2 id="harvest-title">Rainwater Harvesting Calculator</h2><span>Estimate how much rainwater you can harvest based on your roof area, roof material and the selected location&apos;s annual rainfall.</span></div>
        <p>Turn rainfall into a practical water source for your home, farm or facility.</p>
      </header>

      <div className="rainwater-calculator">
        <form className="harvest-inputs" onSubmit={(event) => { event.preventDefault(); calculate(); }} noValidate>
          <fieldset className="harvest-input-step">
            <legend><span>1</span><div><strong>Location</strong><small>Search for a village, town or location in Lebanon.</small></div></legend>
            <div className="rainwater-location-search"><PlaceSearch selectedPlace={selectedPlace} onSelect={choosePlace} onClear={clearPlace} label="Location search" placeholder="Search by village, town or location..." inputId="harvest-location-search" /></div>
            {selectedPlace && <div className="harvest-selected-location"><span><MapPin size={18} /></span><div><strong>{selectedPlace.name}</strong><small>{[selectedPlace.district, selectedPlace.governorate, "Lebanon"].filter(Boolean).join(" · ")}</small></div><p>{Math.abs(selectedPlace.lat).toFixed(4)}° {selectedPlace.lat >= 0 ? "N" : "S"} · {Math.abs(selectedPlace.lng).toFixed(4)}° {selectedPlace.lng >= 0 ? "E" : "W"}</p></div>}
          </fieldset>

          <fieldset className="harvest-input-step">
            <legend><span>2</span><div><strong>Roof Catchment Area</strong><small>Enter the horizontal catchment area of your roof.</small></div></legend>
            <label className="harvest-area-input" htmlFor="roof-catchment-area"><input id="roof-catchment-area" type="number" min={MIN_ROOF_AREA_M2} max={MAX_ROOF_AREA_M2} step="0.1" inputMode="decimal" value={roofArea} onChange={(event) => { invalidateResult(); setRoofArea(event.target.value); }} aria-describedby="roof-area-limit" /><span>m²</span></label>
            <small id="roof-area-limit" className="input-limit">Supported range: {MIN_ROOF_AREA_M2}–{MAX_ROOF_AREA_M2.toLocaleString()} m²</small>
          </fieldset>

          <fieldset className="harvest-input-step">
            <legend><span>3</span><div><strong>Roof Material</strong><small>Select your roof type to apply the appropriate runoff coefficient.</small></div></legend>
            <div className="roof-material-options">{Object.values(ROOF_MATERIALS).map((material) => { const Icon = MATERIAL_ICONS[material.key]; return <button type="button" className={materialKey === material.key ? "selected" : ""} aria-pressed={materialKey === material.key} key={material.key} onClick={() => { invalidateResult(); setMaterialKey(material.key); }}><Icon size={20} /><strong>{material.label}</strong><small>{material.coefficient.toFixed(2)}</small></button>; })}</div>
          </fieldset>

          {validationMessage && <p className="harvest-validation" role="alert"><Info size={15} />{validationMessage}</p>}
          <button className="calculate-potential-button" type="submit">Calculate Potential <ArrowRight size={17} /></button>
        </form>

        <section className="harvest-output" aria-label="Rainwater harvesting analysis">
          {status === "result" && estimate ? <ResultPanel estimate={estimate} /> : status === "unavailable" ? <div className="harvest-unavailable"><CloudRain size={30} /><p>Mapped rainfall unavailable</p><h3>{validationMessage}</h3><small>AQUALEB does not fabricate a value outside the digitized source map.</small></div> : <ReadyPanel />}
          {status === "ready" && selectedPlace && rainfallRecord && <div className="harvest-ready-context"><CloudRain size={15} /><span>{rainfallRecord.label} mm/year · published map band at this coordinate</span></div>}
        </section>
      </div>
    </div>
  </section>;
}

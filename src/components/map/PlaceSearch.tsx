"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { LoaderCircle, MapPin, Search, X } from "lucide-react";
import { GEONAMES_SOURCE, normalizePlaceText, type PlaceDataset, type PlaceRecord } from "@/data/places";

type PlaceSearchProps = {
  selectedPlace: PlaceRecord | null;
  onSelect: (place: PlaceRecord) => void;
  onClear: () => void;
};

function searchPlaces(places: PlaceRecord[], input: string) {
  const query = normalizePlaceText(input);
  if (query.length < 2) return [];
  return places.map((place) => {
    const normalizedNames = place.names.map(normalizePlaceText);
    const main = normalizePlaceText(place.name);
    const ascii = normalizePlaceText(place.asciiName);
    let score = Number.POSITIVE_INFINITY;
    if (main === query || ascii === query) score = 0;
    else if (main.startsWith(query) || ascii.startsWith(query)) score = 1;
    else if (normalizedNames.some((name) => name === query)) score = 2;
    else if (normalizedNames.some((name) => name.startsWith(query))) score = 3;
    else if (normalizedNames.some((name) => name.includes(query))) score = 4;
    return { place, score };
  }).filter(({ score }) => Number.isFinite(score)).sort((a, b) => a.score - b.score || b.place.population - a.place.population || a.place.name.localeCompare(b.place.name)).slice(0, 8).map(({ place }) => place);
}

export function PlaceSearch({ selectedPlace, onSelect, onClear }: PlaceSearchProps) {
  const listboxId = useId();
  const datasetRef = useRef<PlaceRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<PlaceRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const activeId = activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined;
  const selectedDescription = useMemo(() => selectedPlace ? [selectedPlace.district, selectedPlace.governorate].filter(Boolean).join(" · ") : "", [selectedPlace]);

  useEffect(() => {
    queueMicrotask(() => setQuery(selectedPlace?.name ?? ""));
  }, [selectedPlace]);

  const ensurePlaces = async () => {
    if (datasetRef.current) return datasetRef.current;
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch(`${basePath}/data/lebanon-places.json`);
      if (!response.ok) throw new Error("Place dataset unavailable");
      const data = await response.json() as PlaceDataset;
      datasetRef.current = data.places;
      return data.places;
    } catch {
      setLoadError(true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 240);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    if (selectedPlace && normalizePlaceText(debouncedQuery) === normalizePlaceText(selectedPlace.name)) {
      queueMicrotask(() => { if (!cancelled) { setResults([]); setOpen(false); setActiveIndex(-1); } });
      return () => { cancelled = true; };
    }
    if (normalizePlaceText(debouncedQuery).length < 2) {
      queueMicrotask(() => { if (!cancelled) { setResults([]); setOpen(false); setActiveIndex(-1); } });
      return () => { cancelled = true; };
    }
    queueMicrotask(() => void ensurePlaces().then((places) => {
      if (cancelled) return;
      setResults(searchPlaces(places, debouncedQuery));
      setActiveIndex(-1);
      setOpen(true);
    }));
    return () => { cancelled = true; };
  // ensurePlaces intentionally uses the stable component-local dataset cache.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, selectedPlace]);

  const choose = (place: PlaceRecord) => {
    setQuery(place.name);
    setOpen(false);
    setActiveIndex(-1);
    onSelect(place);
  };
  const clear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
    onClear();
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && results.length) { event.preventDefault(); setOpen(true); setActiveIndex((index) => Math.min(index + 1, results.length - 1)); }
    else if (event.key === "ArrowUp" && results.length) { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); }
    else if (event.key === "Enter" && open && results.length) { event.preventDefault(); choose(results[Math.max(activeIndex, 0)]); }
    else if (event.key === "Escape") { setOpen(false); setActiveIndex(-1); }
  };

  return <section className="place-search" aria-label="Search Lebanese villages and cities">
    <label htmlFor="atlas-place-search">Search village or city</label>
    <div className="place-search-input"><Search size={18} aria-hidden="true" /><input id="atlas-place-search" type="search" value={query} placeholder="Try Beirut, Ehden, زحلة…" autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={listboxId} aria-activedescendant={activeId} onFocus={() => { void ensurePlaces(); if (results.length) setOpen(true); }} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} onKeyDown={onKeyDown} />{loading && <LoaderCircle className="spin" size={17} aria-label="Loading place names" />}{(query || selectedPlace) && <button type="button" onClick={clear} aria-label="Clear place search and reset to Lebanon"><X size={17} /></button>}</div>
    {selectedPlace && !open && <div className="selected-place-chip"><MapPin size={15} /><span><strong>{selectedPlace.name}</strong><small>{selectedDescription}</small></span></div>}
    {open && <div className="place-results" id={listboxId} role="listbox" aria-label="Matching Lebanese places">
      {loadError ? <p role="alert">Place search is unavailable.</p> : normalizePlaceText(debouncedQuery).length < 2 ? <p>Type at least two characters.</p> : results.length ? results.map((place, index) => <button id={`${listboxId}-${index}`} type="button" role="option" aria-selected={index === activeIndex} className={index === activeIndex ? "active" : ""} key={place.id} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(place)}><MapPin size={15} /><span><strong>{place.name}</strong><small>{[place.district, place.governorate].filter(Boolean).join(" · ")}</small></span></button>) : <p role="status">No matching Lebanese place found.</p>}
    </div>}
    <small className="place-source">Names and coordinates: <a href={GEONAMES_SOURCE.url} target="_blank" rel="noreferrer">GeoNames</a> · {GEONAMES_SOURCE.license}</small>
  </section>;
}

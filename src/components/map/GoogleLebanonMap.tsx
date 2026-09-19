import { ExternalLink, Layers3, MapPin } from "lucide-react";

const ehdenQuery = "Ehden%2C%20Lebanon";

export function GoogleLebanonMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${ehdenQuery}&zoom=11&maptype=satellite&language=en`
    : `https://www.google.com/maps?q=${ehdenQuery}&z=11&t=k&output=embed`;

  return (
    <section className="google-map" aria-label="Google Map of Ehden, Lebanon">
      <iframe
        className="google-map-frame"
        src={mapUrl}
        title="Google Map showing Ehden, Lebanon"
        loading="eager"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <div className="google-map-badge"><Layers3 size={15} /><span><strong>Google Maps</strong><small>Satellite base map</small></span></div>
      <div className="google-location-card"><span className="google-location-icon"><MapPin size={17} /></span><span><strong>Ehden</strong><small>Zgharta District · North Lebanon</small></span></div>
      <a className="open-google-map" href="https://www.google.com/maps/search/?api=1&query=Ehden%2C%20Lebanon" target="_blank" rel="noreferrer">Open in Google Maps <ExternalLink size={13} /></a>
      {!apiKey && <div className="map-key-note">Add a Maps Embed API key for the production integration</div>}
    </section>
  );
}

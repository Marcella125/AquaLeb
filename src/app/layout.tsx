import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aqualeb.org"),
  title: "AquaLeb Water Atlas — Explore water in Lebanon",
  description: "Explore source-verified drinking-water, access and sanitation indicators across Lebanon’s governorates.",
  openGraph: {
    title: "AquaLeb Water Atlas",
    description: "Explore water in Lebanon through source-verified governorate indicators.",
    images: [{ url: "/og.png", width: 1730, height: 911, alt: "AquaLeb Water Atlas — Explore water in Lebanon" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AquaLeb Water Atlas",
    description: "Explore water in Lebanon through source-verified governorate indicators.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}

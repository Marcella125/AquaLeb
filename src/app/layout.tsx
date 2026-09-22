import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });

export const metadata: Metadata = {
  title: "AquaLeb | Water atlas for Lebanon",
  description: "Explore Lebanon's water places, resources, and trends in the AquaLeb atlas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body className={montserrat.variable}>{children}</body></html>;
}

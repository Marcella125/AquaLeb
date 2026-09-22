import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AquaLeb — Water intelligence for Lebanon",
  description: "A modern water intelligence and management platform for Lebanon.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CARBONIQ — Municipal Carbon Intelligence Platform",
  description: "A Data-Driven Framework for Real-Time Monitoring of Municipal Carbon Footprints Using Python Analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070c09] text-slate-100 min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}

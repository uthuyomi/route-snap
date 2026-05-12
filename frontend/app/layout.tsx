import type { Metadata, Viewport } from "next";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";

export const metadata: Metadata = {
  title: "Route Snap",
  description: "Capture an address, normalize it with AI, and open it in Google Maps.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Route Snap",
    statusBarStyle: "default"
  },
  icons: {
    icon: [
      { url: "/image/icon/route-snap.ico", sizes: "256x256" },
      { url: "/image/icon/route-snap.png", sizes: "1254x1254", type: "image/png" }
    ],
    apple: "/image/icon/route-snap.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f5f5"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

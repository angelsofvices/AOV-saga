import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AOV™ RP9 — Gardenlands Playtest",
  description: "Control Anciuxor and explore the Gardenlands of Origon.",
  openGraph: {
    title: "AOV™ RP9 — Gardenlands Playtest",
    description: "Control Anciuxor and explore the Gardenlands of Origon.",
    images: [{ url: "/og.png", width: 1732, height: 909, alt: "Anciuxor in the Gardenlands" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AOV™ RP9 — Gardenlands Playtest",
    description: "Control Anciuxor and explore the Gardenlands of Origon.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

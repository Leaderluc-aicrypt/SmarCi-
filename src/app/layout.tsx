import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Slab } from "next/font/google";

import { THEME, themeClass } from "@/lib/theme";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Réservée aux titres et au bouton central, comme dans la maquette.
const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  weight: ["700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SmarCi — Copilote import FCFA",
    template: "%s · SmarCi",
  },
  description:
    "Copilote IA spécialisé dans l'importation pour la zone FCFA : conseils pédagogiques et calculs de rentabilité fiables.",
  applicationName: "SmarCi",
  appleWebApp: {
    capable: true,
    title: "SmarCi",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#05070b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${themeClass[THEME]} ${inter.variable} ${robotoSlab.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

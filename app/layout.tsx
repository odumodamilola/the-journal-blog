import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import { Inter, Newsreader, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "The Journal — Ideas worth sharing. Stories worth reading.",
  description:
    "An independent editorial publishing platform and CMS atelier for deliberate thinking, systems craftsmanship, and long-form writing.",
  openGraph: {
    title: "The Journal — Ideas worth sharing. Stories worth reading.",
    description:
      "An independent editorial publishing platform and CMS atelier for deliberate thinking, systems craftsmanship, and long-form writing.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Journal — Ideas worth sharing. Stories worth reading.",
    description:
      "An independent editorial publishing platform and CMS atelier for deliberate thinking, systems craftsmanship, and long-form writing.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${inter.variable} ${newsreader.variable} ${mono.variable}`}
    >
      <body
        className="bg-background text-on-surface antialiased font-editorial-sans selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

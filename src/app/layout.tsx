import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Instrument_Serif, Inter, Manrope, Playfair_Display, Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ContentProvider } from "@/components/providers/ContentProvider";
import { SiteProvider } from "@/components/providers/SiteProvider";
import { siteConfig, absoluteUrl } from "@/data/site";
import { hasResumePdf, isContactEmailConfigured } from "@/lib/resume";
import { personJsonLd, websiteJsonLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.title,
  keywords: ["Maruf Billah", "Web Developer", "Frontend Developer", "Full-Stack Developer", "Next.js Developer", "Bangladesh"],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: absoluteUrl("/"),
    siteName: siteConfig.title,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: absoluteUrl(siteConfig.ogImage), width: 1200, height: 630, alt: "Maruf Billah — Web Developer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImage)],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: siteConfig.themeColor,
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const resumeAvailable = hasResumePdf();
  const emailConfigured = isContactEmailConfigured();

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} ${playfair.variable} ${spaceGrotesk.variable} ${manrope.variable} ${instrument.variable} h-full`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var d=document.documentElement;d.classList.add('js-anim');d.dataset.font='editorial';" +
              "if(location.pathname!=='/'||sessionStorage.getItem('mb-intro-complete')==='1'){d.classList.add('intro-complete');}}" +
              "catch(e){document.documentElement.classList.add('js-anim','intro-complete');}})();",
          }}
        />
      </head>
      <body className="min-h-full bg-ink text-foreground antialiased">
        <JsonLd data={personJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <ContentProvider>
          <SiteProvider resumeAvailable={resumeAvailable} emailConfigured={emailConfigured}>
            <AppShell>{children}</AppShell>
          </SiteProvider>
        </ContentProvider>
      </body>
    </html>
  );
}

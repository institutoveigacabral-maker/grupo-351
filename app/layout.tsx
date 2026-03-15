import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { Analytics } from "@/components/Analytics";
import { ServiceWorker } from "@/components/ServiceWorker";
import { organizationSchema, webSiteSchema } from "@/lib/schema";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GRUPO +351 — Hub de Negócios e Joint Ventures",
  description:
    "Construímos empresas combinando experiência, parceiros estratégicos e oportunidades reais de mercado. Sediados em Cascais, Portugal.",
  metadataBase: new URL("https://grupo351.com"),
  openGraph: {
    title: "GRUPO +351 — Hub de Negócios e Joint Ventures",
    description:
      "Construímos empresas combinando experiência, parceiros estratégicos e oportunidades reais de mercado.",
    url: "https://grupo351.com",
    locale: "pt_PT",
    type: "website",
    siteName: "GRUPO +351",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GRUPO +351 — Hub de Negócios e Joint Ventures",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GRUPO +351 — Hub de Negócios e Joint Ventures",
    description:
      "Construímos empresas combinando experiência, parceiros estratégicos e oportunidades reais de mercado.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://grupo351.com",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <JsonLd data={[organizationSchema(), webSiteSchema()]} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B1D32" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/api/pwa-icon?size=180" />
      </head>
      <body
        className={`${inter.variable} ${geistSans.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <ServiceWorker />
      </body>
    </html>
  );
}

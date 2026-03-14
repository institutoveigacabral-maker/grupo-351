import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { organizationSchema, webSiteSchema } from "@/lib/schema";

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
    locale: "pt_PT",
    type: "website",
    siteName: "GRUPO +351",
  },
  twitter: {
    card: "summary_large_image",
    title: "GRUPO +351 — Hub de Negócios e Joint Ventures",
    description:
      "Construímos empresas combinando experiência, parceiros estratégicos e oportunidades reais de mercado.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://grupo351.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        <JsonLd data={[organizationSchema(), webSiteSchema()]} />
      </head>
      <body
        className={`${inter.variable} ${geistSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

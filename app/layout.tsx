import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { DoodleBg } from "./DoodleBg";

const body = Geist({ subsets: ["latin"], variable: "--font-body" });
const display = Geist_Mono({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "EyeFin — understand the market, one stock at a time",
  description:
    "A calm, plain-English way to understand stocks. Built for beginners. Educational, not investment advice.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DoodleBg />
        <ConvexClientProvider>{children}</ConvexClientProvider>
        {/* Datafast analytics. data-domain MUST match the live domain and the
            website's domain in the Datafast dashboard, or events aren't counted. */}
        <Script
          src="https://datafa.st/js/script.js"
          data-website-id="dfid_EYEDZZGBLcaj6E3e7RZv7"
          data-domain="eyefin.vercel.app"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

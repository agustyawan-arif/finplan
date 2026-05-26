import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "../lib/appConfig";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_CONFIG.appName} — ${APP_CONFIG.appLabel}`,
    template: `%s | ${APP_CONFIG.appName}`,
  },
  description: APP_CONFIG.description,
  openGraph: {
    title: APP_CONFIG.appName,
    description: "Track budgets, accounts, investments, and net worth in one personal finance app.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${APP_CONFIG.appName} — ${APP_CONFIG.tagline}`,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_CONFIG.appName,
    description: APP_CONFIG.description,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f9ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased text-[#0b1c30]`}
    >
      <body className="h-full bg-slate-900 md:bg-gradient-to-br md:from-slate-900 md:via-slate-800 md:to-indigo-950 flex items-center justify-center overflow-hidden">
        {children}
      </body>
    </html>
  );
}

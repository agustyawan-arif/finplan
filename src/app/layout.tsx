import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "../lib/appConfig";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: `${APP_CONFIG.appName} — ${APP_CONFIG.appLabel}`,
  description: "Personal finance and money management app",
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

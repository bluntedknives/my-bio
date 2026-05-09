import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";

const arrayFont = localFont({
  src: [
    { path: "../public/font/Array-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/font/Array-Semibold.otf", weight: "600", style: "normal" },
    { path: "../public/font/Array-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-array",
});

type RootLayoutProps = {
  children: ReactNode;
};

import type { Metadata } from "next";
import Providers from "../components/Providers";

export const metadata: Metadata = {
  title: "@blunted",
  description: "Minimalist TUI Bio",
  openGraph: {
    title: "@blunted",
    description: "Minimalist TUI Bio",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "@blunted Bio",
      },
    ],
    ...
    twitter: {
    card: "summary_large_image",
    title: "@blunted",
    description: "Minimalist TUI Bio",
    images: ["/api/og"],
    },

  },
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={arrayFont.variable} suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden bg-[var(--theme-back)] text-[var(--theme-text)]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

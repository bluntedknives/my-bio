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

import Providers from "../components/Providers";

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

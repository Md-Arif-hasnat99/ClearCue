import type { Metadata } from "next";
import { Epilogue, Manrope } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import SessionProviderClient from "@/components/SessionProviderClient";

const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ClearCue",
  description: "AI Interview Practice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${epilogue.variable} ${manrope.variable} bg-[#131313] text-[#e5e2e1] antialiased`}>
        <SessionProviderClient>
          <div className="h-dvh overflow-hidden">{children}</div>
        </SessionProviderClient>
        <SpeedInsights />
      </body>
    </html>
  );
}

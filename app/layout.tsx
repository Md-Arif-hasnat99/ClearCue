import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderClient from "@/components/SessionProviderClient";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} bg-stone-100 text-slate-900`}>
        <SessionProviderClient>
          <div className="min-h-screen">{children}</div>
        </SessionProviderClient>
      </body>
    </html>
  );
}

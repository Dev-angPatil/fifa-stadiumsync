import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FIFA ArenaSync - World Cup 2026 Stadium Operations & Fan Portal",
  description: "A GenAI-enabled stadium operations coordination and immersive fan companion portal for the FIFA World Cup 2026.",
  keywords: "FIFA World Cup 2026, stadium operations, GenAI, crowd management, fan experience, MetLife Stadium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark scroll-smooth`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-brand-navy-dark text-slate-100 antialiased selection:bg-brand-cyan selection:text-brand-navy-dark">
        {children}
      </body>
    </html>
  );
}

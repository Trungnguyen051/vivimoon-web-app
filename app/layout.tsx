import type { Metadata } from "next";
import { Inter, Fraunces, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { CartProvider } from "@/features/cart/cart-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vivimoon — High-Quality Contact Lenses",
  description: "Shop premium daily, monthly, and colored contact lenses at Vivimoon.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
          {process.env.NEXT_PUBLIC_GA_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} /> : null}
        </CartProvider>
      </body>
    </html>
  );
}

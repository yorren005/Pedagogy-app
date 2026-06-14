import type { Metadata, Viewport } from "next";
import { Quicksand, Fredoka } from "next/font/google";
import { GameStoreProvider } from "@/lib/store";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Learn & Play — Interactive Math & English Games",
  description: "Interactive educational games for Math and English covering Elementary through University levels. Adaptive difficulty, rich animations, and gamified learning.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Learn & Play",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0a2e",
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
      className={`${quicksand.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <GameStoreProvider>
          <main className="flex-1 flex flex-col w-full h-full relative">
            {children}
          </main>
        </GameStoreProvider>
      </body>
    </html>
  );
}

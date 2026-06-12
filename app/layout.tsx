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
  title: "Math Adventure Kingdom",
  description: "A fun and educational math learning game for children aged 3-6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Math Kingdom",
  },
};

export const viewport: Viewport = {
  themeColor: "#70a1ff",
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

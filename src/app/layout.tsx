import type { Metadata } from "next";
import { Providers } from "./providers";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nezon",
  description: "la plataforma de tu ciudad",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" }, // ✅ correcto
    ],
    apple: [
      { url: "/favicon.svg", sizes: "180x180", type: "image/svg+xml" }, // ✅ ruta absoluta y mime correcto
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

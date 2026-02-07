import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  // Variable font; weights set via CSS where needed.
});

const text = IBM_Plex_Sans({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Second Brain for Bookmarks",
  description:
    "Turn X bookmarks into a searchable, tagged knowledge base with Grok-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${text.variable} ${mono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

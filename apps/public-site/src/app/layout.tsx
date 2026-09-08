import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Used by the public site's dark theme (src/app/(public)/layout.tsx); the
// admin theme stays on Geist. Declared here, not in the route group, so the
// font loads once and both segments share the generated CSS variable.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// The handwritten hashtag on the Join Us page. Caveat matches the brush script
// baked into the original background art, which is painted out of
// join-us-bg-clean.jpg so the mark can be live text instead of a blurred image.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoboSUST",
  description: "RoboSUST — Robotics Club, Shahjalal University of Science & Technology",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import AnimatedBackground from "@/components/animatedBackground";
import Navbar from "@/components/navbar";
import BottomNav from "@/components/bottomNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Frenz.fi | Web3 Social DeFi Platform",
  description: "Launch tokens, join communities, and participate in DeFi governance across Ethereum, Base, and Celo networks",
  keywords: [
    "DeFi",
    "DeFAI",
    "Web3",
    "Cryptocurrency",
    "Token Launch",
    "Blockchain",
    "Social Finance",
    "DAO",
    "Ethereum",
    "Base",
    "Celo"
  ],
  openGraph: {
    title: "Frenz.fi | Web3 Social DeFi Platform",
    description: "Launch tokens, join communities, and participate in DeFi governance across Ethereum, Base, and Celo networks",
    url: "https://frenz.fi",
    siteName: "Frenz.fi",
    images: [
      {
        url: "/og-image.png", // Make sure to add this image to your public folder
        width: 1200,
        height: 630,
        alt: "Frenz.fi - Web3 Social DeFi Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frenz.fi | Web3 Social DeFi Platform",
    description: "Launch tokens, join communities, and participate in DeFi governance across Ethereum, Base, and Celo networks",
    images: ["/og-image.png"],
    creator: "@frenzfi",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <AnimatedBackground />
          <Navbar />

          {children}

          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

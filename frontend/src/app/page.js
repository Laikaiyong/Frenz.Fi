"use client";

import Image from "next/image";
import Navbar from "../components/navbar";
import FloatingToken from "../components/floatingToken";
import ScreamEmoji from "../components/screamEmoji";
import AnimatedBackground from "@/components/animatedBackground";
const { useEffect } = require("react");

const FLOATING_TOKENS = [
  "https://payload-marketing.moonpay.com/api/media/file/base%20logo.webp",
  "https://images.seeklogo.com/logo-png/40/2/ethereum-logo-png_seeklogo-407463.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyejSxfv1VRb4-lAhpR2xyG-_-A1XH0n9riw&s",
  "https://img.cryptorank.io/coins/unichain1728632895218.png",
];

export default function Home() {

  useEffect(() => {
    localStorage.clear();
  }, []);
  return (
    <>
      {/* Floating Tokens */}
      <div className="fixed inset-0 pointer-events-none">
        {FLOATING_TOKENS.map((token, index) => (
          <FloatingToken key={index} imageSrc={token} />
        ))}
      </div>

      {/* Scream Emoji */}
      <ScreamEmoji />

      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] mt-16">
        <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center w-full z-10">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-[#00EF8B] via-[#0052FF] to-[#FBCC5C] text-transparent bg-clip-text">
              Welcome to Frenz.fi
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Social Token where Everyone Earns 🚀
            </p>
          </div>

          <div className="flex gap-4 items-center justify-center flex-col sm:flex-row mt-8">
            <a href="/app">
              <button className="rounded-full bg-gradient-to-r from-[#00EF8B] to-[#0052FF] px-8 py-3 text-white font-bold hover:opacity-90 transition-all transform hover:scale-105">
                Launch App
              </button>
            </a>
          </div>
        </main>

        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
          <span className="text-gray-600 dark:text-gray-400">
            2025 Frenz.fi
          </span>
        </footer>
      </div>
    </>
  );
}

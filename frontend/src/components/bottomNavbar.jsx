"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-6 py-4 bg-white/80 backdrop-blur-md rounded-full shadow-xl">
        {/* Home */}
        <Link
          href="/app"
          className={`p-3 rounded-full transition-all ${
            isActive("/app")
              ? "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-6 h-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </Link>

        {/* Tokens */}
        <Link
          href="/tokens"
          className={`p-3 rounded-full transition-all ${
            isActive("/tokens")
              ? "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-6 h-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84"
            />
          </svg>
        </Link>

        {/* Chat */}
        <Link
          href="/chat"
          className={`p-4 rounded-full transition-all transform scale-110 hover:scale-125 ${
            isActive("/chat")
              ? "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white scale-125 shadow-lg"
              : "text-gray-500 hover:bg-gray-100 border-2 border-gradient-to-r border-[#627EEA]"
          }`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-7 h-7">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </Link>

        {/* Governance */}
        <Link
          href="/insurance"
          className={`p-3 rounded-full transition-all ${
            isActive("/insurance")
              ? "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-6 h-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className={`p-3 rounded-full transition-all ${
            isActive("/profile")
              ? "bg-gradient-to-r from-[#627EEA] via-[#0052FF] to-[#FBCC5C] text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-6 h-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}

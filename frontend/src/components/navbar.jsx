'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function Navbar() {
  const { login, ready, authenticated, user, logout } = usePrivy();

  return (
    <nav className="fixed top-0 w-full backdrop-blur-md bg-white/75 dark:bg-black/75 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">🐸 Frenz.fi</div>
        {ready && (
          <button
            onClick={authenticated ? logout : login}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-[#00EF8B] via-[#0052FF] to-[#FBCC5C] text-white hover:opacity-90 transition-all transform hover:scale-105"
          >
            {authenticated ? 'Logout' : 'Login'}
          </button>
        )}
      </div>
    </nav>
  );
}
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const moveX = clientX / window.innerWidth;
      const moveY = clientY / window.innerHeight;
      setMousePosition({ x: moveX, y: moveY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      {/* Main gradient layer */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, #00EF8B22 0%, #0052FF33 25%, #FBCC5C22 50%)',
            'radial-gradient(circle at 60% 60%, #FBCC5C22 0%, #00EF8B33 25%, #0052FF22 50%)',
            'radial-gradient(circle at 40% 40%, #0052FF22 0%, #FBCC5C33 25%, #00EF8B22 50%)',
          ],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
      />

      {/* Interactive gradient layer */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at var(--x) var(--y), rgba(0,239,139,0.15) 0%, rgba(0,82,255,0.15) 50%, transparent 100%)',
          '--x': `${mousePosition.x * 100}%`,
          '--y': `${mousePosition.y * 100}%`,
        }}
      />

      {/* Animated blobs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full filter blur-[80px] opacity-30"
        style={{
          background: '#00EF8B',
        }}
        animate={{
          x: ['-25%', '25%', '-25%'],
          y: ['-25%', '25%', '-25%'],
        }}
        transition={{
          duration: 15,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      <motion.div
        className="absolute right-0 w-[500px] h-[500px] rounded-full filter blur-[80px] opacity-30"
        style={{
          background: '#0052FF',
        }}
        animate={{
          x: ['25%', '-25%', '25%'],
          y: ['25%', '-25%', '25%'],
        }}
        transition={{
          duration: 18,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/[0.85] dark:bg-black/[0.85] backdrop-blur-[1px]" />
    </div>
  );
}
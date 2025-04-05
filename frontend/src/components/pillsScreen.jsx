'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './pillsScreen.module.css';

const PillsScreen = ({ onSelect }) => {
  const pills = [
    { 
      color: '#0052FF',
      network: 'Base', 
      gradient: 'from-[#0052FF] to-[#0052FF]/70',
    },
    { 
      color: '#00EF8B',
      network: 'Flow', 
      gradient: 'from-[#00EF8B] to-[#00EF8B]/70',
    },
    { 
      color: '#FBCC5C',
      network: 'Celo', 
      gradient: 'from-[#FBCC5C] to-[#FBCC5C]/70',
    },
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-black/95 overflow-hidden">
      {/* Animated Background Lights */}
      {pills.map(({ color }, index) => (
        <motion.div
          key={`light-${index}`}
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
          style={{ background: color }}
          animate={{
            x: ['20vw', '-20vw', '20vw'],
            y: ['20vh', '-20vh', '20vh'],
          }}
          transition={{
            duration: 15,
            delay: index * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Header Section */}
      <motion.div 
        className="text-center mb-24 z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-6xl font-bold mb-4 tracking-tight text-white">
          Choose Your <span className="bg-gradient-to-r from-[#00EF8B] via-[#0052FF] to-[#FBCC5C] text-transparent bg-clip-text">Network</span>
        </h1>
        <p className="text-xl text-gray-400">
          Select a pill to enter the matrix
        </p>
      </motion.div>
      
      {/* Pills with Hands Section */}
      <div className="flex gap-16 items-end px-4 md:gap-24 lg:gap-32 z-10">
        {pills.map(({ color, network, gradient }, index) => (
          <motion.div
            key={color}
            className="relative group"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.15,
              duration: 0.5,
              ease: "easeOut"
            }}
          >
            {/* Hand Image */}
            <motion.div
              className="w-[180px] md:w-[200px] lg:w-[240px] relative"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="https://static.vecteezy.com/system/resources/thumbnails/022/207/325/small_2x/open-the-palm-of-the-hand-isolated-png.png"
                alt={`${network} network selection`}
                width={240}
                height={240}
                className="w-full h-auto relative z-10 transform-gpu"
                priority
              />
            </motion.div>
            
            {/* Pill */}
            <motion.button
            //   initial={{ opacity: 0.8 }}
              whileHover={{ 
                scale: 1.05,
                filter: 'brightness(1.2)',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(network.toLowerCase())}
              className={`
                absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2
                w-20 h-10 rounded-full bg-gradient-to-r ${gradient}
                transform rotate-45 cursor-pointer z-20 ${styles.pillGlow}
              `}
              style={{
                '--pill-color': color,
              }}
            >
            </motion.button>

            {/* Network Label */}
            <motion.p
              className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white/80 text-base font-medium
                opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              {network} Network
            </motion.p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PillsScreen;
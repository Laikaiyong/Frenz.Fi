'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function FloatingToken({ imageSrc }) {
  const getRandomPosition = () => ({
    x: `${Math.random() * 80 + 10}vw`,
    y: `${Math.random() * 80 + 10}vh`,
  });

  const [targetPosition, setTargetPosition] = useState(getRandomPosition());

  useEffect(() => {
    const interval = setInterval(() => {
      setTargetPosition(getRandomPosition());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      animate={targetPosition}
      initial={getRandomPosition()}
      transition={{
        duration: 3,
        ease: "easeInOut",
        repeat: 0,
      }}
      className="absolute w-16 h-16"
    >
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          },
        }}
      >
        <Image
          src={imageSrc}
          alt="Floating token"
          width={64}
          height={64}
          className="rounded-full shadow-lg"
        />
      </motion.div>
    </motion.div>
  );
}
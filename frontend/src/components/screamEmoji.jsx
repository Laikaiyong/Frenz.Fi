'use client';

import { motion } from 'framer-motion';

export default function ScreamEmoji() {
return (
    <motion.div
        className="fixed bottom-4 right-4 w-50 h-50 z-50"
        animate={{
            scale: [1, 1.2, 1], // Changed back to positive values
            scaleX: [-1, -1, -1], // Added scaleX for horizontal flip
            rotate: [0, -10, 10, -10, 0],
        }}
        transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
        }}
    >
        <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full rounded-full"
        >
            <source
                src="https://cdnl.iconscout.com/lottie/premium/thumb/scream-emoji-animated-icon-download-in-lottie-json-gif-static-svg-file-formats--face-rage-ball-emojis-pack-sign-symbols-icons-9567844.mp4"
                type="video/mp4"
            />
        </video>
    </motion.div>
);
}
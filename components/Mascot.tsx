"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

interface MascotProps {
  message?: string;
  isSpeaking?: boolean;
}

export default function Mascot({ message, isSpeaking = false }: MascotProps) {
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);

  useEffect(() => {
    if (message && isSpeaking) {
      setShowSpeechBubble(true);
    } else {
      setShowSpeechBubble(false);
    }
  }, [message, isSpeaking]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end">
      {/* Speech Bubble */}
      <AnimatePresence>
        {showSpeechBubble && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mb-16 mr-4 relative bg-white border-4 border-orange-400 p-4 rounded-3xl shadow-lg max-w-xs"
          >
            <p className="text-gray-800 font-bold text-lg leading-tight">
              {message}
            </p>
            {/* Tail of the speech bubble */}
            <div className="absolute -bottom-4 right-8 w-0 h-0 border-l-[16px] border-l-transparent border-t-[20px] border-t-orange-400 border-r-[16px] border-r-transparent" />
            <div className="absolute -bottom-2 right-[34px] w-0 h-0 border-l-[12px] border-l-transparent border-t-[16px] border-t-white border-r-[12px] border-r-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milo the Fox */}
      <motion.div
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-32 h-32 md:w-40 md:h-40 cursor-pointer"
        onClick={() => {
          if (!isSpeaking && message) setShowSpeechBubble(!showSpeechBubble);
        }}
      >
        <Image
          src="/assets/milo_fox.png"
          alt="Milo the Fox"
          fill
          className="object-contain drop-shadow-xl"
          priority
        />
      </motion.div>
    </div>
  );
}

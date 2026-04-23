"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Lockscreen() {
  const [visible, setVisible] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = () => {
    if (unlocked) return;
    setUnlocked(true);
    
    document.dispatchEvent(new CustomEvent("bio:unlock"));

    const container = document.getElementById("container");
    if (container) {
      container.style.visibility = "visible";
      container.style.opacity = "1";
    }

    setTimeout(() => {
      setVisible(false);
    }, 500);
  };

  if (!visible) return null;

  return (
    <div 
      id="lockscreen" 
      onClick={handleUnlock}
      style={{
        opacity: unlocked ? 0 : 1,
        transition: "opacity 0.5s ease-out",
        pointerEvents: unlocked ? "none" : "auto"
      }}
    >
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden px-4 py-2"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            animate={{
              backgroundPosition: ["200% center", "-200% center"],
            }}
            className="click-text bg-[length:200%_100%] bg-gradient-to-r from-[#444444] via-[#ffffff] to-[#444444] bg-clip-text text-transparent"
            transition={{
              duration: 2.5,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            [ click to unlock ]
          </motion.h1>
        </motion.div>
      </div>
    </div>
  );
}

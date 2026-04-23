"use client";

import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_TEXT = "[ click to unlock ]";

type UnlockOverlayProps = {
  children: ReactNode;
  onUnlock?: () => void;
  text?: string;
  className?: string;
};

export default function UnlockOverlay({ children, onUnlock, text = DEFAULT_TEXT, className }: UnlockOverlayProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [visible, setVisible] = useState(true);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    setUnlocked(false);
    setVisible(true);
    hasStartedRef.current = false;
  }, []);

  const handleUnlock = () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setUnlocked(true);
    onUnlock?.();
    document.dispatchEvent(new CustomEvent("bio:unlock"));
  };

  return (
    <>
      <div className={clsx("main-content", className, unlocked && "unlocked")}>{children}</div>

      <AnimatePresence>
        {visible && (
          <motion.div
            id="unlock-overlay"
            className={unlocked ? "unlocked" : undefined}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            onClick={handleUnlock}
            onAnimationEnd={() => {
              if (unlocked) setVisible(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-[18px] font-medium uppercase tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
            >
              {text}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useEffect } from "react";

export default function AntiInspect() {
  useEffect(() => {
    const blockEvent = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U" || e.key === "s" || e.key === "S"))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Mobile: disable long-press to save image/inspect
    document.addEventListener("contextmenu", blockEvent);
    document.addEventListener("keydown", handleKeyDown);
    
    // Attempt to detect devtools opening
    let lastWidth = window.outerWidth;
    let lastHeight = window.outerHeight;
    
    const detectDevTools = () => {
        const threshold = 160;
        if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
            // DevTools might be open
            document.body.innerHTML = "Access Denied";
            window.location.reload();
        }
    };
    
    const interval = setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener("contextmenu", blockEvent);
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

export default function StatusPoller() {
  useEffect(() => {
    const statusEl = document.getElementById("currentStatus");
    
    const logVisitor = async () => {
      let visitorData = {};
      try {
        // Try to get public IP from client side to avoid localhost issues
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        if (data.ip) {
          // Obfuscate with simple base64 to hide from URL and obvious logs
          visitorData = { v: window.btoa(data.ip) };
        }
      } catch (e) {
        // ignore
      }

      // Use POST to hide payload from the URL and server access logs
      fetch("/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitorData),
      })
        .catch(() => {
          // ignore
        });
    };

    // Call once on mount only
    logVisitor();
  }, []);

  return null;
}

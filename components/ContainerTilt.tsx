"use client";

import { useEffect } from "react";

export default function ContainerTilt() {
  useEffect(() => {
    const container = document.getElementById("container");
    if (!container) return;

    container.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
    container.style.zIndex = "1";
    container.style.position = "relative";
    container.style.willChange = "transform";
    container.style.backfaceVisibility = "hidden";
    container.style.transformStyle = "preserve-3d";

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId: number | null = null;

    const animateTransform = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      const rotateY = currentX;
      const rotateX = -currentY;

      container.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.02, 1.02, 1.02)
      `;

      rafId = requestAnimationFrame(animateTransform);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const intensity = 10;

      targetX = ((x - centerX) / centerX) * intensity;
      targetY = ((y - centerY) / centerY) * intensity;

      event.stopPropagation();
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;

      if (!rafId) {
        rafId = requestAnimationFrame(animateTransform);
      }
    };

    const handleMouseEnter = (event: MouseEvent) => {
      event.stopPropagation();
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseenter", handleMouseEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

export default function ContainerMusicAnim() {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(".container") ?? document.getElementById("container");
    const musicContainer = document.querySelector<HTMLElement>(".music-container");

    const animatedElements = [container, musicContainer].filter(Boolean) as HTMLElement[];

    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes moveUp {
            from {
                transform: translateY(0);
            }
            to {
                transform: translateY(-60px);
            }
        }
    `;
    document.head.appendChild(styleSheet);

    animatedElements.forEach((element) => {
      element.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
      element.style.zIndex = "1";
      element.style.position = "relative";
      element.style.willChange = "transform";
      element.style.backfaceVisibility = "hidden";
      element.style.transformStyle = "preserve-3d";
      element.style.opacity = "0";
    });

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId: number | null = null;

    let targetYOffset = 0;
    let currentYOffset = 0;

    const animateTransform = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      currentYOffset += (targetYOffset - currentYOffset) * 0.05;

      if (container) {
        container.style.transform = `perspective(1000px) translateY(${currentYOffset}px) rotateX(${currentY}deg) rotateY(${currentX}deg)`;
      }

      if (musicContainer && musicContainer.style.opacity === "1") {
        musicContainer.style.transform = `perspective(1000px) rotateX(${currentY}deg) rotateY(${currentX}deg)`;
      }

      rafId = requestAnimationFrame(animateTransform);
    };

    rafId = requestAnimationFrame(animateTransform);

    const handleMouseMove = (element: HTMLElement) => (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const offsetX = (x - centerX) / centerX;
      const offsetY = (y - centerY) / centerY;
      const intensity = 9;

      targetX = offsetX * intensity;
      targetY = offsetY * intensity;
      event.stopPropagation();
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const handleMouseEnter = (event: MouseEvent) => {
      event.stopPropagation();
    };

    const mouseMoveHandlers = new Map<HTMLElement, (event: MouseEvent) => void>();

    animatedElements.forEach((element) => {
      const handler = handleMouseMove(element);
      mouseMoveHandlers.set(element, handler);
      element.addEventListener("mousemove", handler);
      element.addEventListener("mouseleave", handleMouseLeave);
      element.addEventListener("mouseenter", handleMouseEnter);
    });

    const handleFirstClick = () => {
      if (container) {
        container.style.animation = "fadeIn 0.8s forwards";
        const onEnd = (event: AnimationEvent) => {
          if (event.animationName === "fadeIn") {
            container.style.animation = "";
            container.style.opacity = "1";
          }
        };
        container.addEventListener("animationend", onEnd, { once: true });
      }

      setTimeout(() => {
        if (musicContainer) {
          musicContainer.style.animation = "fadeIn 0.8s forwards";
          const onEnd = (event: AnimationEvent) => {
            if (event.animationName === "fadeIn") {
              musicContainer.style.animation = "";
              musicContainer.style.opacity = "1";
            }
          };
          musicContainer.addEventListener("animationend", onEnd, { once: true });
        }

        if (container) {
          targetYOffset = -60;
        }
      }, 2480);
    };

    document.body.addEventListener("click", handleFirstClick, { once: true });

    return () => {
      document.body.removeEventListener("click", handleFirstClick);
      animatedElements.forEach((element) => {
        const handler = mouseMoveHandlers.get(element);
        if (handler) element.removeEventListener("mousemove", handler);
        element.removeEventListener("mouseleave", handleMouseLeave);
        element.removeEventListener("mouseenter", handleMouseEnter);
      });
      if (rafId) cancelAnimationFrame(rafId);
      styleSheet.remove();
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

export default function RowAnimations() {
  useEffect(() => {
    const animationGroups = Array.from(document.querySelectorAll<HTMLElement>(".animation-group"));
    if (animationGroups.length === 0) return;

    const observers: IntersectionObserver[] = [];

    animationGroups.forEach((group) => {
      const elements = Array.from(group.querySelectorAll<HTMLElement>(".elemento-para-animar"));
      if (elements.length === 0) return;

      let visibleCount = 0;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const delay = 0.1 + visibleCount * 0.15;
              const target = entry.target as HTMLElement;
              target.style.animationDelay = `${delay}s`;
              target.classList.add("animate-fade-in");
              visibleCount += 1;
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      observers.push(observer);
      elements.forEach((element) => observer.observe(element));
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return null;
}

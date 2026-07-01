"use client";

import { useEffect, useRef } from "react";

type TypingEffectProps = {
  active?: boolean;
  activeTab?: string;
};

export default function TypingEffect({ active = true, activeTab }: TypingEffectProps) {
  const shimmerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!active || (activeTab && activeTab !== "bio")) return;

    const textsElement = document.getElementById("typingTexts");
    const textElement = document.getElementById("typingText");
    if (!textsElement || !textElement) return;

    const texts = textsElement.innerHTML.split(" &lt;&gt; ");
    const cursorChar = "|";
    let currentTextIndex = 0;
    let isTyping = true;

    const timeouts: number[] = [];

    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(fn, delay);
      timeouts.push(id);
      return id;
    };

    const startShimmer = () => {
      if (shimmerIntervalRef.current) clearInterval(shimmerIntervalRef.current);
      
      shimmerIntervalRef.current = setInterval(() => {
        if (isTyping) return;
        
        const spans = textElement.querySelectorAll(".bio-word");
        if (spans.length <= 1) return; // If only one word or whole phrase, handled differently
        
        // Remove existing shimmers from individual words
        spans.forEach(s => s.classList.remove("shimmer-text"));
        
        // Pick a random word to shimmer
        const randomIndex = Math.floor(Math.random() * spans.length);
        spans[randomIndex].classList.add("shimmer-text");
      }, 1500);
    };

    const typeWriter = (text: string, index: number) => {
      isTyping = true;
      if (index < text.length) {
        const currentPart = text.substring(0, index + 1);
        const words = currentPart.split(" ");
        
        textElement.innerHTML = words.map((word, i) => 
          `<span class="bio-word ${i === words.length - 1 ? 'shimmer-text' : ''}">${word}</span>`
        ).join(" ") + cursorChar;
        
        schedule(() => typeWriter(text, index + 1), 185);
      } else {
        isTyping = false;
        // Make whole text shimmer for a brief moment before random word shimmer starts
        textElement.innerHTML = `<span class="bio-word shimmer-text">${text}</span>` + cursorChar;
        
        schedule(() => {
          // Re-render as individual words for random shimmering
          const words = text.split(" ");
          textElement.innerHTML = words.map((word) => 
            `<span class="bio-word">${word}</span>`
          ).join(" ") + cursorChar;
          startShimmer();
        }, 1000);

        schedule(() => {
          if (shimmerIntervalRef.current) clearInterval(shimmerIntervalRef.current);
          eraseText(text);
        }, 5000);
      }
    };

    const eraseText = (text: string) => {
      isTyping = true;
      const length = text.length;
      if (length > 0) {
        const currentPart = text.substring(0, length - 1);
        textElement.innerHTML = `<span class="bio-word">${currentPart}</span>` + cursorChar;
        schedule(() => eraseText(currentPart), 40);
      } else {
        currentTextIndex = (currentTextIndex + 1) % texts.length;
        schedule(() => typeWriter(texts[currentTextIndex], 0), 500);
      }
    };

    typeWriter(texts[currentTextIndex], 0);

    return () => {
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      if (shimmerIntervalRef.current) clearInterval(shimmerIntervalRef.current);
    };
  }, [active, activeTab]);

  return null;
}

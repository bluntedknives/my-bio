"use client";

import { useEffect } from "react";

export default function TypingEffect() {
  useEffect(() => {
    const textsElement = document.getElementById("typingTexts");
    const textElement = document.getElementById("typingText");
    if (!textsElement || !textElement) return;

    const texts = textsElement.innerHTML.split(" &lt;&gt; ");
    const cursorChar = "|";
    let currentTextIndex = 0;

    const timeouts: number[] = [];

    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(fn, delay);
      timeouts.push(id);
      return id;
    };

    const typeWriter = (text: string, index: number) => {
      if (index < text.length) {
        textElement.textContent = `${text.substring(0, index + 1)}${cursorChar}`;
        schedule(() => typeWriter(text, index + 1), 185);
      } else {
        schedule(() => eraseText(text), 1000);
      }
    };

    const eraseText = (text: string) => {
      const length = text.length;
      if (length > 0) {
        textElement.textContent = `${text.substring(0, length - 1)}${cursorChar}`;
        schedule(() => eraseText(text.substring(0, length - 1)), 40);
      } else {
        currentTextIndex = (currentTextIndex + 1) % texts.length;
        schedule(() => typeWriter(texts[currentTextIndex], 0), 500);
      }
    };

    typeWriter(texts[currentTextIndex], 0);

    return () => {
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  return null;
}

"use client";

import type { PaperShaderElement } from "@paper-design/shaders";
import { Dithering } from "@paper-design/shaders-react";
import { useEffect, useRef, useState } from "react";

import { ACCENT_EVENT, AUDIO_REACTIVE_EVENT } from "../lib/bio-events";

type AudioReactiveDetail = {
  bass: number;
  energy: number;
  pulse: number;
  time: number;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (![r, g, b].every(Number.isFinite)) return [136, 136, 136];
  return [r, g, b];
};

const toHex = ([r, g, b]: [number, number, number]) =>
  "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");

export default function DitheringBackground() {
  const shaderRef = useRef<PaperShaderElement | null>(null);

  // The shader colors are driven through props: <Dithering> re-applies its prop
  // uniforms on every render, which would clobber any imperative setUniforms.
  const [accent, setAccent] = useState("#888888");

  const rgb = hexToRgb(accent);
  // Tinted near-black so the whole field shifts with the cover art.
  const backHex = toHex([rgb[0] * 0.12, rgb[1] * 0.12, rgb[2] * 0.12]);

  useEffect(() => {
    const handleAccent = (event: Event) => {
      const next = (event as CustomEvent<{ accent: string }>).detail?.accent;
      if (next) setAccent(next);
    };

    const handleAudioReactive = (event: Event) => {
      const mount = shaderRef.current?.paperShaderMount;
      const detail = (event as CustomEvent<AudioReactiveDetail>).detail;

      if (!mount || !detail) return;

      const pulse = clamp(detail.pulse, 0, 1);
      const energy = clamp(detail.energy, 0, 1);
      const bass = clamp(detail.bass, 0, 1);
      const drift = detail.time * 0.00018;

      mount.setUniforms({
        u_scale: 1 + pulse * 0.14 + energy * 0.04,
        u_rotation: clamp((bass - 0.18) * 6, -3, 3),
        u_offsetX: Math.sin(drift) * (0.012 + pulse * 0.025),
        u_offsetY: Math.cos(drift * 0.82) * (0.008 + energy * 0.02),
      });
      mount.setSpeed(0.8 + pulse * 1.35 + energy * 0.2);
    };

    document.addEventListener(ACCENT_EVENT, handleAccent);
    document.addEventListener(AUDIO_REACTIVE_EVENT, handleAudioReactive);

    // On mount, adopt whatever accent is already live so the background is
    // tinted from the first frame instead of starting neutral/gray.
    const initial = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim();
    if (initial) setAccent(initial);

    return () => {
      document.removeEventListener(ACCENT_EVENT, handleAccent);
      document.removeEventListener(AUDIO_REACTIVE_EVENT, handleAudioReactive);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <Dithering
        ref={shaderRef}
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
        colorBack={backHex}
        colorFront={accent}
        shape="warp"
        type="4x4"
        pxSize={2.5}
        speed={1}
        scale={1}
        rotation={0}
        offsetX={0}
        offsetY={0}
        fit="cover"
        minPixelRatio={1}
        maxPixelCount={1500000}
      />
      {/* Scrim: keeps the moving dither field from washing out foreground text. */}
      <div className="bio-scrim absolute inset-0" />
    </div>
  );
}

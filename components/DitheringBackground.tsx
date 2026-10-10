"use client";

import type { PaperShaderElement } from "@paper-design/shaders";
import { Dithering } from "@paper-design/shaders-react";
import { useEffect, useRef } from "react";

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
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return [
    Number.isFinite(r) ? r : 0.5,
    Number.isFinite(g) ? g : 0.5,
    Number.isFinite(b) ? b : 0.5,
  ];
};

export default function DitheringBackground() {
  const shaderRef = useRef<PaperShaderElement | null>(null);

  useEffect(() => {
    // Apply an accent color to the shader, retrying until the mount is ready.
    const applyAccent = (accent: string) => {
      if (!accent) return;
      const [r, g, b] = hexToRgb(accent);
      const set = () => {
        const mount = shaderRef.current?.paperShaderMount;
        if (!mount) return false;
        mount.setUniforms({
          u_colorFront: [r, g, b, 1],
          // Near-black but tinted, so the whole field shifts subtly with the art.
          u_colorBack: [r * 0.12, g * 0.12, b * 0.12, 1],
        });
        return true;
      };
      if (set()) return;
      let tries = 0;
      const tick = () => {
        if (set() || ++tries > 60) return;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    // Recolor the actual shader (not an overlay) whenever the track changes.
    const handleAccent = (event: Event) => {
      const accent = (event as CustomEvent<{ accent: string }>).detail?.accent;
      applyAccent(accent);
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
    // tinted from the first frame instead of starting neutral/white.
    const initial = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim();
    if (initial) applyAccent(initial);

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
        colorBack="#000000"
        colorFront="#888888"
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
      {/* Neutral vignette only — no tinted overlay pretending to be the background */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.75))]" />
    </div>
  );
}

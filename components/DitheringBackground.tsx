"use client";

import type { PaperShaderElement } from "@paper-design/shaders";
import { Dithering } from "@paper-design/shaders-react";
import { useEffect, useRef } from "react";

type AudioReactiveDetail = {
  bass: number;
  energy: number;
  pulse: number;
  time: number;
};

const AUDIO_REACTIVE_EVENT = "bio:audio-reactive";

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

export default function DitheringBackground() {
  const shaderRef = useRef<PaperShaderElement | null>(null);

  useEffect(() => {
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

    document.addEventListener(AUDIO_REACTIVE_EVENT, handleAudioReactive);

    return () => {
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
        colorFront="#333333"
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(68,68,68,0.12),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.4),rgba(0,0,0,0.8))]" />
    </div>
  );
}

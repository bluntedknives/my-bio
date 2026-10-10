"use client";

import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { ACCENT_EVENT, AUDIO_REACTIVE_EVENT } from "../lib/bio-events";

type Track = {
  id: string;
  src: string;
  title: string;
  artist?: string;
  album?: string;
  image?: string;
};

const formatTime = (time: number) => {
  if (!Number.isFinite(time) || time <= 0) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Convert a sampled RGB color into a display-ready accent while preserving
// its true hue. Saturation/value are only nudged into a readable band, so an
// art with no red never yields red.
const toDisplayColor = (r: number, g: number, b: number) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;

  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  s = Math.min(0.95, Math.max(0.45, s));
  const v = Math.min(0.98, Math.max(0.66, max));

  return hsvToHex(h, s, v);
};

const hsvToHex = (h: number, s: number, v: number) => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Darken an accent hex toward transparent black for the gradient tail
const colorMixFade = (hex: string, amount: number) => {
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
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  const f = (v: number) => (Number.isFinite(v) ? v : 128) * amount;
  return `#${toHex(f(r))}${toHex(f(g))}${toHex(f(b))}`;
};

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioGraphFailedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const levelsRef = useRef<number[]>([]);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const bassAverageRef = useRef(0);
  const bassPreviousRef = useRef(0);
  const pulseRef = useRef(0);
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const currentTimeRef = useRef<HTMLSpanElement | null>(null);
  const accentRef = useRef("#ffffff");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unlockRequested, setUnlockRequested] = useState(false);
  const [duration, setDuration] = useState(0);
  const [accent, setAccent] = useState("#ffffff");

  useEffect(() => {
    accentRef.current = accent;
    document.documentElement.style.setProperty("--accent", accent);
    document.dispatchEvent(
      new CustomEvent(ACCENT_EVENT, { detail: { accent } })
    );
  }, [accent]);

  const currentTrack = tracks[currentIndex];

  useEffect(() => {
    const image = currentTrack?.image;
    if (!image) return;
    let cancelled = false;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const size = 60;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        // Bucket colors and pick the most common *vivid* one so the accent
        // faithfully reflects the album art (average RGB washes hue out).
        const buckets = new Map<string, { n: number; r: number; g: number; b: number; score: number }>();
        let bestSat = 0;
        let mostSaturated: { r: number; g: number; b: number } | null = null;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 200) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const mx = Math.max(r, g, b);
          const mn = Math.min(r, g, b);
          const sat = mx === 0 ? 0 : (mx - mn) / mx;

          if (sat > bestSat && (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.15) {
            bestSat = sat;
            mostSaturated = { r, g, b };
          }

          const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          if (sat < 0.18 || lum < 0.12 || lum > 0.95) continue;

          const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
          const bucket = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0, score: 0 };
          bucket.n += 1;
          bucket.r += r;
          bucket.g += g;
          bucket.b += b;
          bucket.score += sat * (1 - Math.abs(lum - 0.55) * 0.8);
          buckets.set(key, bucket);
        }

        let best: { r: number; g: number; b: number } | null = null;
        let bestScore = 0;
        for (const bucket of buckets.values()) {
          const score = bucket.score;
          if (score > bestScore) {
            bestScore = score;
            best = { r: bucket.r / bucket.n, g: bucket.g / bucket.n, b: bucket.b / bucket.n };
          }
        }

        if (!best && mostSaturated && bestSat >= 0.12) best = mostSaturated;

        if (best) {
          setAccent(toDisplayColor(best.r, best.g, best.b));
        } else {
          // Genuinely monochrome art: stay neutral rather than invent a hue.
          setAccent("#8f8f8f");
        }
      } catch {}
    };
    img.src = image;

    return () => {
      cancelled = true;
    };
  }, [currentTrack?.image]);

  const ensureAudioGraph = () => {
    const audio = audioRef.current;
    if (!audio || audioContextRef.current || audioGraphFailedRef.current) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      const context = new AudioContextClass();
      const analyser = context.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.85;

      const source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(context.destination);

      audioContextRef.current = context;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch {
      audioGraphFailedRef.current = true;
    }
  };

  useEffect(() => {
    let active = true;
    fetch("/api/music")
      .then((response) => response.json())
      .then((data: { tracks?: Track[] }) => {
        if (!active) return;
        const list = Array.isArray(data.tracks) ? data.tracks : [];
        setTracks(list);
        setCurrentIndex(0);
      })
      .catch(() => {
        if (!active) return;
        setTracks([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleUnlock = () => {
      setUnlockRequested(true);
    };
    document.addEventListener("bio:unlock", handleUnlock);

    return () => {
      document.removeEventListener("bio:unlock", handleUnlock);
      document.dispatchEvent(
        new CustomEvent(AUDIO_REACTIVE_EVENT, {
          detail: { bass: 0, energy: 0, pulse: 0, time: performance.now() },
        }),
      );
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      analyserRef.current?.disconnect();
      sourceRef.current?.disconnect();
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    ensureAudioGraph();
    const context = audioContextRef.current;
    if (context && context.state === "suspended") {
      context.resume().catch(() => {});
    }
  }, [isPlaying]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!unlockRequested || tracks.length === 0) return;
    setCurrentIndex(0);
    setIsPlaying(true);
    setUnlockRequested(false);
  }, [unlockRequested, tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.src;
    audio.load();
    if (currentTimeRef.current) currentTimeRef.current.textContent = "0:00";
    if (progressFillRef.current) progressFillRef.current.style.width = "0%";
    setDuration(0);

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentTrack?.src, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const cur = audio.currentTime;
      const dur = audio.duration || 0;
      if (progressFillRef.current) {
        const percent = dur > 0 ? (cur / dur) * 100 : 0;
        progressFillRef.current.style.width = `${percent}%`;
      }
      if (currentTimeRef.current) {
        currentTimeRef.current.textContent = formatTime(cur);
      }
    };

    const handleLoaded = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (tracks.length === 0) {
        setIsPlaying(false);
        return;
      }
      setCurrentIndex((index) => (index + 1) % tracks.length);
      setIsPlaying(true);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [tracks.length]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.muted = false;
      audio.volume = 1;
      ensureAudioGraph();
      const context = audioContextRef.current;
      if (context && context.state === "suspended") {
        context.resume().catch(() => {});
      }
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const playNext = () => {
    if (tracks.length === 0) return;
    setCurrentIndex((index) => (index + 1) % tracks.length);
  };

  const playPrev = () => {
    if (tracks.length === 0) return;
    setCurrentIndex((index) => (index - 1 + tracks.length) % tracks.length);
  };

  const handleSeek = (event: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const targetTime = Math.max(0, Math.min(duration, duration * percent));
    audio.currentTime = targetTime;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const barCount = 56;
    const barGap = 1.5;

    if (levelsRef.current.length !== barCount) {
      levelsRef.current = Array.from({ length: barCount }, () => 0);
    }

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      ctx.clearRect(0, 0, width, height);

      const analyserNode = analyserRef.current;
      let dataArray = dataArrayRef.current;
      let bassEnergy = 0;
      let totalEnergy = 0;
      if (analyserNode) {
        if (!dataArray || dataArray.length !== analyserNode.frequencyBinCount) {
          dataArray = new Uint8Array(analyserNode.frequencyBinCount);
          dataArrayRef.current = dataArray;
        }
        analyserNode.getByteFrequencyData(dataArray as any);

        if (isPlayingRef.current && dataArray.length > 0) {
          const bassBins = Math.max(4, Math.floor(dataArray.length * 0.18));
          let bassSum = 0;
          let totalSum = 0;

          for (let i = 0; i < dataArray.length; i += 1) {
            const value = dataArray[i] || 0;
            totalSum += value;
            if (i < bassBins) {
              bassSum += value;
            }
          }

          bassEnergy = bassSum / bassBins / 255;
          totalEnergy = totalSum / dataArray.length / 255;
        }
      }

      const averageBass = bassAverageRef.current * 0.9 + bassEnergy * 0.1;
      const bassRise = Math.max(0, bassEnergy - bassPreviousRef.current);
      const beatDelta = Math.max(0, bassEnergy - averageBass);
      bassAverageRef.current = averageBass;
      bassPreviousRef.current = bassEnergy;
      pulseRef.current = Math.max(
        pulseRef.current * 0.82,
        Math.min(1.5, beatDelta * 12 + bassRise * 8 + totalEnergy * 0.8),
      );

      document.dispatchEvent(
        new CustomEvent(AUDIO_REACTIVE_EVENT, {
          detail: {
            bass: bassEnergy,
            energy: totalEnergy,
            pulse: pulseRef.current,
            time: performance.now(),
          },
        }),
      );

      // Bars follow the current track's extracted accent color
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, accentRef.current || "#ffffff");
      grad.addColorStop(1, colorMixFade(accentRef.current || "#ffffff", 0.35));
      ctx.fillStyle = grad;

      const totalGap = barGap * (barCount - 1);
      const barWidth = Math.max(1, (width - totalGap) / barCount);
      const bins = dataArray ? dataArray.length : 0;

      for (let i = 0; i < barCount; i += 1) {
        const active = isPlayingRef.current && dataArray && bins > 0;
        // Spread the 32 bars across the available frequency bins
        const binIndex = bins > 0 ? Math.min(bins - 1, Math.floor((i / barCount) * bins)) : 0;
        const rawValue = active ? dataArray![binIndex] || 0 : 0;
        const normalized = rawValue / 255;
        // Boost and curve so quiet detail still moves visibly
        const shaped = Math.pow(normalized, 0.75);
        const target = Math.min(1, shaped * 1.35);
        // Snappier attack, slower release -> lively but not jittery
        const prev = levelsRef.current[i] ?? 0;
        const smoothed = target > prev ? prev + (target - prev) * 0.5 : prev + (target - prev) * 0.16;
        levelsRef.current[i] = smoothed;
        const barHeight = Math.max(2, smoothed * (height - 6));
        const x = i * (barWidth + barGap);
        const y = height - barHeight;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="bio-player" style={{ "--accent": accent } as React.CSSProperties}>
      <div className="bio-player-banner">
        {currentTrack?.image ? (
          <img src={currentTrack.image} alt="" className="bio-track-art" />
        ) : (
          <div className="bio-track-art bg-white/[0.03]" />
        )}
        <div className="min-w-0 flex-1">
          <div className="bio-track-title truncate">{currentTrack?.title || "No media"}</div>
          <div className="bio-track-artist truncate">
            {currentTrack?.artist || currentTrack?.album || "Unknown source"}
          </div>
        </div>
        <span className={`bio-eq ${isPlaying ? "is-on" : ""}`} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className="bio-visualizer mb-3">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      <div className="bio-progress mb-1.5" onClick={handleSeek}>
        <div ref={progressFillRef} className="bio-progress-fill" style={{ width: "0%" }} />
      </div>
      <div className="mb-3 flex justify-between font-mono text-[0.6rem] text-[var(--text-faint)]">
        <span ref={currentTimeRef}>0:00</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={playPrev} className="bio-control" aria-label="Previous track">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 5h2v14H6zM20 5v14L9 12z" />
          </svg>
        </button>
        <button
          onClick={togglePlay}
          className="bio-control bio-control-primary flex-1"
          aria-label="Play or pause"
        >
          {isPlaying ? (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 5l12 7-12 7z" />
            </svg>
          )}
        </button>
        <button onClick={playNext} className="bio-control" aria-label="Next track">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 5h2v14h-2zM4 5l11 7-11 7z" />
          </svg>
        </button>
      </div>

      <audio ref={audioRef} />
    </div>
  );
}

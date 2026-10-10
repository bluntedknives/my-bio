"use client";

import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

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

// Turn an averaged RGB sample into a vivid, readable accent (HSV with
// floors on saturation/value so near-black/near-grey covers still pop).
const vividColor = (r: number, g: number, b: number) => {
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
  s = Math.min(1, Math.max(0.55, s * 1.1));
  const v = Math.min(1, Math.max(0.62, max * 1.05));

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

export default function MusicPlayer() {
  const AUDIO_REACTIVE_EVENT = "bio:audio-reactive";
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
  }, [accent]);

  useEffect(() => {
    document.documentElement.classList.toggle("audio-playing", isPlaying);
    return () => document.documentElement.classList.remove("audio-playing");
  }, [isPlaying]);

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
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count += 1;
        }
        if (!count) return;
        setAccent(vividColor(r / count, g / count, b / count));
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
      analyser.fftSize = 64;
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

    const barCount = 12;
    const barGap = 4;

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
      ctx.fillStyle = accentRef.current || "#ffffff";

      const totalGap = barGap * (barCount - 1);
      const barWidth = Math.max(2, (width - totalGap) / barCount);

      for (let i = 0; i < barCount; i += 1) {
        const active = isPlayingRef.current && dataArray;
        const rawValue = dataArray ? dataArray[i * 2] || 0 : 0;
        const normalized = active ? rawValue / 255 : 0;
        const target = Math.min(1, normalized * 1.5);
        const smoothed = (levelsRef.current[i] ?? 0) * 0.8 + target * 0.2;
        levelsRef.current[i] = smoothed;
        const barHeight = Math.max(2, smoothed * height);
        const x = i * (barWidth + barGap);
        const y = (height - barHeight) / 2; // Center bars vertically
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

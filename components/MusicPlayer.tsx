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
  const durationRef = useRef<HTMLSpanElement | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unlockRequested, setUnlockRequested] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [duration, setDuration] = useState(0);

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
    return () => {
      document.dispatchEvent(
        new CustomEvent(AUDIO_REACTIVE_EVENT, {
          detail: { bass: 0, energy: 0, pulse: 0, time: performance.now() },
        }),
      );
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      analyserRef.current?.disconnect();
      sourceRef.current?.disconnect();
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const handleUnlock = () => {
      setIsUnlocked(true);
      setUnlockRequested(true);
    };
    document.addEventListener("bio:unlock", handleUnlock);

    return () => {
      document.removeEventListener("bio:unlock", handleUnlock);
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

  const currentTrack = tracks[currentIndex];

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
      const dur = audio.duration || 0;
      setDuration(dur);
      if (durationRef.current) {
        durationRef.current.textContent = formatTime(dur);
      }
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
      setIsUnlocked(true);
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
    
    // Update UI immediately on seek
    if (progressFillRef.current) progressFillRef.current.style.width = `${percent * 100}%`;
    if (currentTimeRef.current) currentTimeRef.current.textContent = formatTime(targetTime);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const barCount = 10;
    const minHeight = 2;
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
        pulseRef.current * 0.86,
        Math.min(1, beatDelta * 5 + bassRise * 4 + totalEnergy * 0.35),
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

      const totalGap = barGap * (barCount - 1);
      const barWidth = Math.max(2, (width - totalGap) / barCount);
      ctx.fillStyle = "#ffffff";

      for (let i = 0; i < barCount; i += 1) {
        const active = isPlayingRef.current && dataArray;
        const rawValue = dataArray ? dataArray[i * 2] || 0 : 0;
        const normalized = active ? rawValue / 255 : 0;
        const target = Math.min(1, normalized * 1.5);
        const smoothed = (levelsRef.current[i] ?? 0) * 0.8 + target * 0.2;
        levelsRef.current[i] = smoothed;
        const barHeight = Math.max(minHeight, smoothed * (height - 2));
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
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <div className="tui-player">
      <div className="tui-player-header">
        <div className="tui-label">AUDIO.SYS</div>
        <div className="tui-player-visualizer">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>
      </div>

      <div className="tui-player-info">
        <div className="tui-track-title">{currentTrack?.title || "NO MEDIA"}</div>
        <div className="tui-track-artist">{currentTrack?.artist || "UNKNOWN SOURCE"}</div>
      </div>

      <div className="tui-player-progress">
        <div className="tui-progress-track" onClick={handleSeek}>
          <div 
            ref={progressFillRef}
            className="tui-progress-fill" 
            style={{ width: "0%" }} 
          />
        </div>
        <div className="tui-player-time">
          <span ref={currentTimeRef}>0:00</span>
          <span ref={durationRef}>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="tui-player-controls">
        <button onClick={playPrev} className="tui-btn">BACK</button>
        <button onClick={togglePlay} className="tui-btn-main">
          {isPlaying ? "PAUSE" : "PLAY"}
        </button>
        <button onClick={playNext} className="tui-btn">NEXT</button>
      </div>

      <div className="tui-playlist-meta">
        TRACK {currentIndex + 1} OF {tracks.length}
      </div>

      <audio ref={audioRef} />
    </div>
  );
}

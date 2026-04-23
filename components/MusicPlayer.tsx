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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioGraphFailedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const levelsRef = useRef<number[]>([]);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unlockRequested, setUnlockRequested] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const ensureAudioGraph = () => {
    const audio = audioRef.current;
    if (!audio || audioContextRef.current || audioGraphFailedRef.current) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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
    setCurrentTime(0);
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
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
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
    audio.currentTime = Math.max(0, Math.min(duration, duration * percent));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const barCount = 12;
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

      const active = isPlayingRef.current && analyserRef.current;
      const analyserNode = analyserRef.current;
      let dataArray = dataArrayRef.current;
      if (analyserNode) {
        if (!dataArray || dataArray.length !== analyserNode.frequencyBinCount) {
          dataArray = new Uint8Array(analyserNode.frequencyBinCount);
          dataArrayRef.current = dataArray;
        }
        analyserNode.getByteFrequencyData(dataArray);
      } else {
        if (!dataArray) {
          dataArray = new Uint8Array(32);
          dataArrayRef.current = dataArray;
        } else {
          dataArray.fill(0);
        }
      }

      const totalGap = barGap * (barCount - 1);
      const barWidth = Math.max(2, (width - totalGap) / barCount);
      ctx.fillStyle = "#ffffff";

      const binsPerBar = Math.max(1, Math.floor(dataArray.length / barCount));

      for (let i = 0; i < barCount; i += 1) {
        const start = i * binsPerBar;
        let sum = 0;
        for (let j = 0; j < binsPerBar; j += 1) {
          sum += dataArray[start + j] ?? 0;
        }
        const rawValue = sum / binsPerBar;
        const normalized = active ? rawValue / 255 : 0;
        const target = Math.min(1, normalized * 1.5);
        const smoothed = (levelsRef.current[i] ?? 0) * 0.8 + target * 0.2;
        levelsRef.current[i] = smoothed;
        const barHeight = Math.max(minHeight, smoothed * (height - 4));
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
  }, [isPlaying]);

  return (
    <div className="music-player">
      <div className="music-top">
        <div className="music-header">
          <div className="music-label">Status.Playback</div>
          <div className="music-title">{currentTrack?.title ?? "No tracks found"}</div>
          <div className="music-artist">{currentTrack?.artist ? currentTrack.artist : "SoundCloud.app_Leaks"}</div>
        </div>

        <div className="music-visualizer" aria-hidden="true">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>
      </div>

      <div className="music-progress-container">
        <div className="music-progress" onClick={handleSeek} role="button" tabIndex={0} title="Seek">
          <div
            className="music-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="music-time">
        <span>{formatTime(currentTime)}</span>
        <span>
          {tracks.length > 0 ? `${currentIndex + 1}/${tracks.length}` : "--/--"}
        </span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="music-controls">
        <button className="music-btn" type="button" onClick={playPrev} aria-label="Previous" title="Previous">
          PREV
        </button>
        <button
          className="music-btn"
          type="button"
          onClick={togglePlay}
          aria-label="Play or pause"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "PAUSE" : "PLAY"}
        </button>
        <button className="music-btn" type="button" onClick={playNext} aria-label="Next" title="Next">
          NEXT
        </button>
      </div>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}

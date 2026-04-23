"use client";

import { useEffect } from "react";

export default function PlayerController() {
  useEffect(() => {
    const audio = document.querySelector<HTMLAudioElement>(".audioPlayer");
    const playIcon = document.querySelector<HTMLElement>(".play-pause");
    const pauseIcon = document.querySelector<HTMLElement>(".pause-icon");
    const prevButton = document.querySelector<HTMLElement>(".prev");
    const nextButton = document.querySelector<HTMLElement>(".next");
    const timeline = document.querySelector<HTMLElement>(".timeline");
    const timelineProgress = document.querySelector<HTMLElement>(".timeline-progress");
    const currentTime = document.querySelector<HTMLElement>(".current-time");
    const totalTime = document.querySelector<HTMLElement>(".total-time");

    if (!audio || !playIcon || !pauseIcon || !prevButton || !nextButton || !timeline || !timelineProgress || !currentTime || !totalTime) {
      return;
    }

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    let firstClickHappened = false;

    const autoPlayWithDelay = () => {
      if (!firstClickHappened) return;

      setTimeout(() => {
        audio.play();
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
      }, 2000);
    };

    const handleFirstClick = () => {
      if (!firstClickHappened) {
        firstClickHappened = true;
        autoPlayWithDelay();
      }
    };

    const skipTime = (direction: "forward" | "backward") => {
      const skipAmount = 5;
      if (direction === "forward") {
        audio.currentTime = Math.min(audio.currentTime + skipAmount, audio.duration || 0);
      } else {
        audio.currentTime = Math.max(audio.currentTime - skipAmount, 0);
      }
    };

    const handlePrevClick = () => skipTime("backward");
    const handleNextClick = () => skipTime("forward");

    const handleLoadedMetadata = () => {
      totalTime.textContent = formatTime(audio.duration);
    };

    const togglePlayPause = () => {
      if (audio.paused) {
        audio.play();
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
      } else {
        audio.pause();
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
      }
    };

    const handleTimeUpdate = () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      timelineProgress.style.width = `${progress}%`;
      currentTime.textContent = formatTime(audio.currentTime);
    };

    timeline.style.cursor = "pointer";
    timeline.style.position = "relative";

    const clickableArea = document.createElement("div");
    clickableArea.style.position = "absolute";
    clickableArea.style.top = "-10px";
    clickableArea.style.bottom = "-10px";
    clickableArea.style.left = "0";
    clickableArea.style.right = "0";
    clickableArea.style.cursor = "pointer";
    timeline.appendChild(clickableArea);

    const handleTimelineClick = (event: MouseEvent) => {
      const rect = timeline.getBoundingClientRect();
      const pos = (event.clientX - rect.left) / rect.width;
      audio.currentTime = pos * audio.duration;
    };

    const handleAudioEnd = () => {
      playIcon.style.display = "block";
      pauseIcon.style.display = "none";
    };

    document.addEventListener("click", handleFirstClick);
    prevButton.addEventListener("click", handlePrevClick);
    nextButton.addEventListener("click", handleNextClick);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    playIcon.addEventListener("click", togglePlayPause);
    pauseIcon.addEventListener("click", togglePlayPause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    clickableArea.addEventListener("click", handleTimelineClick);
    timeline.addEventListener("click", handleTimelineClick);
    audio.addEventListener("ended", handleAudioEnd);

    const cleanupFns: Array<() => void> = [
      () => document.removeEventListener("click", handleFirstClick),
      () => prevButton.removeEventListener("click", handlePrevClick),
      () => nextButton.removeEventListener("click", handleNextClick),
      () => audio.removeEventListener("loadedmetadata", handleLoadedMetadata),
      () => playIcon.removeEventListener("click", togglePlayPause),
      () => pauseIcon.removeEventListener("click", togglePlayPause),
      () => audio.removeEventListener("timeupdate", handleTimeUpdate),
      () => clickableArea.removeEventListener("click", handleTimelineClick),
      () => timeline.removeEventListener("click", handleTimelineClick),
      () => audio.removeEventListener("ended", handleAudioEnd),
      () => clickableArea.remove(),
    ];

    const audioPlayer = document.querySelector<HTMLAudioElement>(".audioPlayer");
    const volumeSlider = document.querySelector<HTMLInputElement>(".volume-slider");
    const volumeIcon = document.querySelector<HTMLElement>(".volume-icon");

    let lastVolume = 0.04;

    if (audioPlayer && volumeSlider && volumeIcon) {
      audioPlayer.volume = lastVolume;
      volumeSlider.value = String(lastVolume);
      volumeIcon.innerHTML = `<path fill="currentColor" d="M7 9v6h4l5 5V4l-5 5z"></path>`;

      const handleVolumeInput = () => {
        const volume = Number(volumeSlider.value);
        audioPlayer.volume = volume;
        lastVolume = volume;

        if (volume === 0) {
          volumeIcon.innerHTML = `<path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63m2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21L21 19.73l-9-9zM12 4L9.91 6.09L12 8.18z"></path>`;
        } else if (volume < 0.1) {
          volumeIcon.innerHTML = `<path fill="currentColor" d="M7 9v6h4l5 5V4l-5 5z"></path>`;
        } else {
          volumeIcon.innerHTML = `<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77"></path>`;
        }
      };

      const handleVolumeClick = () => {
        if (audioPlayer.volume > 0) {
          lastVolume = audioPlayer.volume;
          audioPlayer.volume = 0;
          volumeSlider.value = "0";
          volumeIcon.innerHTML = `<path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63m2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21L21 19.73l-9-9zM12 4L9.91 6.09L12 8.18z"></path>`;
        } else {
          const restoreVolume = lastVolume || 0.2;
          audioPlayer.volume = restoreVolume;
          volumeSlider.value = String(restoreVolume);

          if (restoreVolume < 0.2) {
            volumeIcon.innerHTML = `<path fill="currentColor" d="M7 9v6h4l5 5V4l-5 5z"></path>`;
          } else {
            volumeIcon.innerHTML = `<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77"></path>`;
          }
        }
      };

      volumeSlider.addEventListener("input", handleVolumeInput);
      volumeIcon.addEventListener("click", handleVolumeClick);

      cleanupFns.push(
        () => volumeSlider.removeEventListener("input", handleVolumeInput),
        () => volumeIcon.removeEventListener("click", handleVolumeClick)
      );
    }

    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}

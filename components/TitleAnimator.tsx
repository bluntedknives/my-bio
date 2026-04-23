"use client";

import { useEffect } from "react";

const TITLE_TEXT = "@biaquista";

const TIMELINE_STYLES = `
.timeline {
    position: relative;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    cursor: pointer;
    overflow: visible;
    transition: height 0.2s ease;
}

.timeline:hover {
    height: 8px;
}

.timeline-progress {
    height: 100%;
    background: linear-gradient(90deg, #ffffff, rgba(255, 255, 255, 0.8));
    border-radius: inherit;
    transition: all 0.3s ease;
    position: relative;
}

.timeline-thumb {
    position: absolute;
    top: 50%;
    right: -8px;
    width: 16px;
    height: 16px;
    background: #ffffff;
    border-radius: 50%;
    transform: translateY(-50%) scale(0);
    cursor: grab;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    z-index: 10;
}

.timeline-thumb:active {
    cursor: grabbing;
    transform: translateY(-50%) scale(1.2);
}

.timeline:hover .timeline-thumb {
    transform: translateY(-50%) scale(1);
}

.timeline-thumb.dragging {
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

@keyframes popIn {
    0% {
        transform: translateY(-50%) scale(0);
    }
    50% {
        transform: translateY(-50%) scale(1.2);
    }
    100% {
        transform: translateY(-50%) scale(1);
    }
}

.timeline-thumb.pop-in {
    animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
`;

export default function TitleAnimator() {
  useEffect(() => {
    const originalTitle = document.title;
    let index = 0;
    let titleTimeoutId: number | null = null;

    const typeTitle = () => {
      if (index < TITLE_TEXT.length) {
        document.title += TITLE_TEXT[index];
        index += 1;
        titleTimeoutId = window.setTimeout(typeTitle, 300);
      } else {
        titleTimeoutId = window.setTimeout(() => {
          document.title = "";
          index = 0;
          typeTitle();
        }, 2000);
      }
    };

    typeTitle();

    const styleElement = document.createElement("style");
    styleElement.textContent = TIMELINE_STYLES;
    document.head.appendChild(styleElement);

    const timeline = document.querySelector<HTMLElement>(".timeline");
    const timelineProgress = document.querySelector<HTMLElement>(".timeline-progress");
    const audioPlayer = document.querySelector<HTMLAudioElement>(".audioPlayer");
    const currentTimeSpan = document.querySelector<HTMLElement>(".current-time");
    const totalTimeSpan = document.querySelector<HTMLElement>(".total-time");

    let animationFrame: number | null = null;
    let isDragging = false;
    let hasInteracted = false;

    const cleanupListeners: Array<() => void> = [];

    if (timeline && timelineProgress && audioPlayer && currentTimeSpan && totalTimeSpan) {
      const thumb = document.createElement("div");
      thumb.className = "timeline-thumb";
      timelineProgress.appendChild(thumb);

      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
      };

      const updateTimeline = () => {
        if (!isDragging && audioPlayer.duration) {
          const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
          timelineProgress.style.width = `${progress}%`;
          currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
        }

        if (!audioPlayer.paused) {
          animationFrame = requestAnimationFrame(updateTimeline);
        }
      };

      const getPositionFromEvent = (event: MouseEvent | TouchEvent) => {
        const rect = timeline.getBoundingClientRect();
        const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
        let position = (clientX - rect.left) / rect.width;
        position = Math.max(0, Math.min(1, position));
        return position;
      };

      const setAudioTime = (position: number) => {
        if (audioPlayer.duration) {
          const newTime = position * audioPlayer.duration;
          audioPlayer.currentTime = newTime;
          timelineProgress.style.width = `${position * 100}%`;
          currentTimeSpan.textContent = formatTime(newTime);
        }
      };

      const handleMouseEnter = () => {
        if (!hasInteracted) {
          thumb.classList.add("pop-in");
          hasInteracted = true;
          window.setTimeout(() => {
            thumb.classList.remove("pop-in");
          }, 400);
        }
      };

      const handleTimelineClick = (event: MouseEvent) => {
        if (!isDragging) {
          const position = getPositionFromEvent(event);
          setAudioTime(position);
        }
      };

      const startDrag = (event: MouseEvent | TouchEvent) => {
        isDragging = true;
        thumb.classList.add("dragging");
        document.body.style.userSelect = "none";
        event.preventDefault();
        const position = getPositionFromEvent(event);
        setAudioTime(position);
      };

      const drag = (event: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        event.preventDefault();
        const position = getPositionFromEvent(event);
        setAudioTime(position);
      };

      const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        thumb.classList.remove("dragging");
        document.body.style.userSelect = "";

        if (!audioPlayer.paused) {
          animationFrame = requestAnimationFrame(updateTimeline);
        }
      };

      const handleLoadedMetadata = () => {
        totalTimeSpan.textContent = formatTime(audioPlayer.duration);
      };

      const handlePlay = () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(updateTimeline);
      };

      const handlePause = () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      };

      const handleTimelineMouseDown = (event: MouseEvent) => {
        if (event.target === timeline || event.target === timelineProgress) {
          startDrag(event);
        }
      };

      const handleTimelineTouchStart = (event: TouchEvent) => {
        if (event.target === timeline || event.target === timelineProgress) {
          startDrag(event);
        }
      };

      timeline.addEventListener("mouseenter", handleMouseEnter);
      timeline.addEventListener("click", handleTimelineClick);
      thumb.addEventListener("mousedown", startDrag);
      timeline.addEventListener("mousedown", handleTimelineMouseDown);
      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", endDrag);

      thumb.addEventListener("touchstart", startDrag, { passive: false });
      timeline.addEventListener("touchstart", handleTimelineTouchStart, { passive: false });
      document.addEventListener("touchmove", drag, { passive: false });
      document.addEventListener("touchend", endDrag);

      audioPlayer.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioPlayer.addEventListener("play", handlePlay);
      audioPlayer.addEventListener("pause", handlePause);

      cleanupListeners.push(
        () => timeline.removeEventListener("mouseenter", handleMouseEnter),
        () => timeline.removeEventListener("click", handleTimelineClick),
        () => thumb.removeEventListener("mousedown", startDrag),
        () => document.removeEventListener("mousemove", drag),
        () => document.removeEventListener("mouseup", endDrag),
        () => thumb.removeEventListener("touchstart", startDrag),
        () => timeline.removeEventListener("mousedown", handleTimelineMouseDown),
        () => timeline.removeEventListener("touchstart", handleTimelineTouchStart),
        () => document.removeEventListener("touchmove", drag),
        () => document.removeEventListener("touchend", endDrag),
        () => audioPlayer.removeEventListener("loadedmetadata", handleLoadedMetadata),
        () => audioPlayer.removeEventListener("play", handlePlay),
        () => audioPlayer.removeEventListener("pause", handlePause),
        () => thumb.remove()
      );
    }

    return () => {
      if (titleTimeoutId) window.clearTimeout(titleTimeoutId);
      document.title = originalTitle;
      styleElement.remove();
      cleanupListeners.forEach((cleanup) => cleanup());
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  return null;
}

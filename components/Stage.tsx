"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import SectionRail, { type SectionId } from "./SectionRail";

export type { SectionId };

export const SECTION_IDS: SectionId[] = [
  "about",
  "projects",
  "socials",
  "wallets",
  "terminal",
];

const ORDER: SectionId[] = SECTION_IDS;

const panelVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    y: dir >= 0 ? 48 : -48,
    scale: 0.97,
    filter: "blur(10px)",
  }),
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (dir: number) => ({
    opacity: 0,
    y: dir >= 0 ? -40 : 40,
    scale: 0.985,
    filter: "blur(8px)",
  }),
};

type Props = {
  active: SectionId;
  onChange: (id: SectionId) => void;
  locked?: boolean;
  children: (section: SectionId) => React.ReactNode;
  /** Always-mounted layer rendered outside the transitioning panels (music). */
  dock?: React.ReactNode;
};

export default function Stage({ active, onChange, locked = false, children, dock }: Props) {
  const dirRef = useRef(1);
  const indexRef = useRef(ORDER.indexOf(active));
  const lastNav = useRef(0);

  const prevIndex = indexRef.current;
  const index = ORDER.indexOf(active);
  if (index !== prevIndex) dirRef.current = index > prevIndex ? 1 : -1;
  indexRef.current = index;

  const goTo = useCallback(
    (id: SectionId) => {
      if (ORDER.indexOf(id) === indexRef.current) return;
      lastNav.current = Date.now();
      onChange(id);
    },
    [onChange]
  );

  const step = useCallback(
    (delta: number) => {
      const next = Math.min(ORDER.length - 1, Math.max(0, indexRef.current + delta));
      if (next === indexRef.current) return;
      lastNav.current = Date.now();
      onChange(ORDER[next]);
    },
    [onChange]
  );

  // Lock the page: sections live in a fixed viewport, so the wheel/keyboard
  // drive section changes instead of document scroll.
  useEffect(() => {
    if (locked) return;
    const unlockAt = Date.now() + 900;
    let accum = 0;
    let resetTimer: number | undefined;

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      // Let nested scroll areas (terminal log, modals) keep native scrolling.
      if (target?.closest(".scrollable, textarea, .crypto-overlay")) return;
      e.preventDefault();
      if (Date.now() < unlockAt) return;
      if (Date.now() - lastNav.current < 720) return;

      // If the active panel is taller than the stage, let it scroll internally
      // before we advance to the next section.
      const panel = document.querySelector<HTMLElement>(".bio-panel");
      if (panel && panel.scrollHeight > panel.clientHeight + 2) {
        const atTop = panel.scrollTop <= 0;
        const atBottom =
          panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 2;
        if (!(e.deltaY < 0 && atTop) && !(e.deltaY > 0 && atBottom)) {
          panel.scrollTop += e.deltaY;
          return;
        }
      }

      accum += e.deltaY;
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => (accum = 0), 160);
      const threshold = 34;
      if (accum > threshold) {
        accum = 0;
        step(1);
      } else if (accum < -threshold) {
        accum = 0;
        step(-1);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        step(1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(ORDER[0]);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(ORDER[ORDER.length - 1]);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      if (resetTimer) window.clearTimeout(resetTimer);
    };
  }, [locked, step, goTo]);

  return (
    <>
      <SectionRail active={active} onChange={goTo} visible={!locked} />

      <div className="bio-stage">
        <AnimatePresence mode="popLayout" custom={dirRef.current} initial={false}>
          <motion.div
            key={active}
            className="bio-panel"
            custom={dirRef.current}
            variants={panelVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {children(active)}
          </motion.div>
        </AnimatePresence>
      </div>

      {dock}

      <div className={`bio-stage-progress ${locked ? "" : "is-in"}`} aria-hidden="true">
        {ORDER.map((id, i) => (
          <span key={id} className={`bio-stage-dot ${i === index ? "is-on" : ""}`} />
        ))}
      </div>
    </>
  );
}

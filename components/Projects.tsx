"use client";

import { motion } from "framer-motion";

type Project = {
  title: string;
  description: string;
  link: string;
};

const projects: Project[] = [
  {
    title: "GRUDGE.LOL",
    description: "An anonymous image board platform for modern expression.",
    link: "https://grudge.lol",
  },
  {
    title: "ISHY.LOL",
    description: "Personal terminal-inspired bio link with integrated features.",
    link: "https://ishy.lol",
  },
];

export default function Projects() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="section-label">Projects</div>
      <div className="flex flex-col gap-2.5">
        {projects.map((project, index) => (
          <a
            key={index}
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="bio-project group"
          >
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-[0.62rem] text-[var(--text-faint)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.82rem] font-semibold tracking-tight text-white truncate">
                  {project.title}
                </span>
              </div>
              <svg
                className="h-3.5 w-3.5 shrink-0 text-[var(--text-faint)] transition-all duration-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </div>
            <p className="text-[0.74rem] leading-relaxed text-[var(--text-muted)]">
              {project.description}
            </p>
          </a>
        ))}
      </div>
    </motion.div>
  );
}

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="tui-label">PROJECTS INDEX</div>
      <div className="flex flex-col gap-6">
        {projects.map((project, index) => (
          <a
            key={index}
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="group block"
          >
            <div className="flex items-start gap-4">
              <span className="text-[8px] font-bold text-[#666666] mt-1 group-hover:text-white transition-colors">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-['Array-BoldWide'] text-[11px] tracking-wider text-[#888888] group-hover:text-white transition-all duration-300">
                    {project.title}
                  </span>
                  <div className="h-[1px] flex-1 mx-4 bg-[#111111] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                  <span className="text-[7px] font-bold text-[#555555] group-hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                    LAUNCH URL
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed text-[#999999] group-hover:text-[#888888] transition-colors max-w-[400px]">
                  {project.description}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </motion.div>
  );
}

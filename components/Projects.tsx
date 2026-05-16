"use client";

import { motion, AnimatePresence } from "framer-motion";

type Project = {
  title: string;
  description: string;
  link: string;
};

const projects: Project[] = [
  {
    title: "ANIME_WEBSITE",
    description: "A custom built platform for streaming and tracking anime content.",
    link: "https://ishy.lol",
  },
  {
    title: "MY_BIO",
    description: "Personal terminal-inspired bio link with integrated features.",
    link: "https://ishy.lol",
  },
];

export default function Projects() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-4"
    >
      <div className="tui-label">PROJECTS.EXE</div>
      <div className="grid gap-2">
        {projects.map((project, index) => (
          <a
            key={index}
            href={project.link}
            className="group relative block border border-[#111111] bg-black/40 px-3 py-2.5 transition-all duration-300 hover:border-[#ffffff]/20 hover:bg-black/60 hover:translate-x-1"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-['Array-BoldWide'] text-[10px] tracking-wider text-[#ffffff] group-hover:text-[#ffffff]">
                {project.title}
              </span>
              <span className="text-[7px] font-bold text-[#222222] group-hover:text-[#ffffff] transition-colors">
                [ SOURCE ]
              </span>
            </div>
            <p className="text-[9px] leading-tight text-[#555555] group-hover:text-[#888888] transition-colors line-clamp-1">
              {project.description}
            </p>
            <div className="absolute left-0 top-0 h-full w-[1px] scale-y-0 bg-white transition-transform duration-300 group-hover:scale-y-100" />
          </a>
        ))}
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type HistoryItem = {
  command?: string;
  output: string | React.ReactNode;
};

const COMMANDS: Record<string, string | React.ReactNode> = {
  help: (
    <div className="space-y-1">
      <p>AVAILABLE COMMANDS:</p>
      <div className="grid grid-cols-2 gap-x-4">
        <div><span className="text-white">help</span> - Show this help</div>
        <div><span className="text-white">about</span> - About this system</div>
        <div><span className="text-white">whoami</span> - Identity reveal</div>
        <div><span className="text-white">clear</span> - Clear terminal</div>
        <div><span className="text-white">ls</span> - List directories</div>
        <div><span className="text-white">socials</span> - View social links</div>
        <div><span className="text-white">projects</span> - View projects</div>
        <div><span className="text-white">exit</span> - Close terminal tab</div>
      </div>
    </div>
  ),
  about: "BIO-OS v2.5.0-STABLE. Interactive terminal interface for @blunted. Designed for minimal latency and high contrast readability.",
  whoami: "GUEST_USER_01. Access level: READ_ONLY. Status: AUTHORIZED.",
  ls: (
    <div className="grid grid-cols-4 gap-2">
      <span className="text-[#627EEA]">bio/</span>
      <span className="text-[#F7931A]">projects/</span>
      <span className="text-[#14F195]">socials/</span>
      <span className="text-white">readme.md</span>
    </div>
  ),
  socials: "TELEGRAM: @wwersec | EMAIL: imited@conversations.im",
  projects: "1. GRUDGE.LOL | 2. ISHY.LOL",
};

export default function InteractiveTerminal({ onExit }: { onExit?: () => void }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([
    { output: "WELCOME TO BIO-OS TERMINAL. TYPE 'help' TO START." },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    inputRef.current?.focus();
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.toLowerCase().trim();
    if (!trimmedCmd) return;

    setCommandHistory((prev) => [cmd, ...prev]);
    setHistoryIndex(-1);

    if (trimmedCmd === "clear") {
      setHistory([]);
      return;
    }

    if (trimmedCmd === "exit" && onExit) {
      onExit();
      return;
    }

    const output = COMMANDS[trimmedCmd] || `COMMAND NOT FOUND: ${trimmedCmd}. TYPE 'help' FOR ASSISTANCE.`;
    setHistory((prev) => [...prev, { command: cmd, output }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full font-mono text-[10px] leading-relaxed text-[#888888]"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 scrollbar-hide space-y-2">
        {history.map((item, i) => (
          <div key={i}>
            {item.command && (
              <div className="flex gap-2">
                <span className="text-[#666666]">guest@bio:~$</span>
                <span className="text-white">{item.command}</span>
              </div>
            )}
            <div className={item.command ? "mt-1" : ""}>{item.output}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center border-t border-[#111111] pt-3 bg-black/50 sticky bottom-0">
        <span className="text-[#666666] shrink-0">guest@bio:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-white p-0"
          autoComplete="off"
          autoFocus
        />
      </div>
    </motion.div>
  );
}

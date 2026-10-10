"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DiscordStatus from "../components/DiscordStatus";
import Clock from "../components/Clock";
import MusicPlayer from "../components/MusicPlayer";
import TypingEffect from "../components/TypingEffect";
import Lockscreen from "../components/Lockscreen";
import StatusPoller from "../components/StatusPoller";
import CryptoModal from "../components/CryptoModal";
import ViewCounter from "../components/ViewCounter";
import Projects from "../components/Projects";
import InteractiveTerminal from "../components/InteractiveTerminal";

const DitheringBackground = dynamic(() => import("../components/DitheringBackground"), {
  ssr: false,
});

const ethIcon = (
  <svg className="h-4 w-4" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"/>
  </svg>
);

const btcIcon = (
  <svg className="h-4 w-4" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zm-141.651-35.33c4.935-32.928-20.154-50.596-54.45-62.366l11.135-44.708-27.214-6.789-10.846 43.51c-7.154-1.783-14.502-3.464-21.803-5.092l10.938-43.831-27.214-6.789-11.135 44.708c-5.925-1.35-11.711-2.694-17.291-4.095l.013-.057-37.541-9.375-7.24 29.062s20.191 4.627 19.762 4.913c11.022 2.751 13.014 10.044 12.68 15.825l-12.699 50.925c.76.194 1.744.473 2.829.778l-2.846-.71-17.8 71.37c-1.347 3.354-4.767 8.385-12.47 6.462.279.408-19.762-4.932-19.762-4.932l-13.51 31.147 35.412 8.827c6.59 1.65 13.052 3.379 19.424 5.009l-11.276 45.297 27.214 6.789 11.135-44.708c7.428 2.019 14.603 3.932 21.554 5.738l-11.196 44.89 27.214 6.789 11.277-45.273c46.495 8.799 81.506 5.253 96.223-36.798 11.873-33.841-.589-53.363-25.027-66.103 17.798-4.102 31.186-15.79 34.663-39.896zm-62.189 87.175c-8.424 33.841-65.439 15.553-83.921 10.953l14.981-60.059c18.483 4.603 77.526 13.726 68.94 49.106zm8.502-87.679c-7.69 30.82-55.171 15.153-70.597 11.314l13.585-54.508c15.421 3.846 64.819 11.021 57.012 43.194z"/>
  </svg>
);

const solIcon = (
  <svg className="h-4 w-4" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M0 80l48-48h352l48 48-48 48H48L0 80zm448 176l-48 48H48l-48-48 48-48h352l48 48zm-48 176l48 48H96l-48-48 48-48h352l-48 48z"/>
  </svg>
);

const telegramIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.257.257-.527.257l.195-2.77 5.042-4.556c.219-.195-.048-.304-.337-.11l-6.23 3.923-2.685-.838c-.584-.183-.594-.584.121-.863l10.495-4.045c.485-.18.909.11.756.832z"/>
  </svg>
);

const emailIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5l-8-5V6l8 5l8-5v2z"/>
  </svg>
);

const discordIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const SOCIALS = [
  { name: "Discord", handle: "@whosbleedingg", link: "https://discord.com/users/1521196393606156578", icon: discordIcon },
  { name: "Telegram", handle: "@wwersec", link: "https://t.me/wwersec", icon: telegramIcon },
  { name: "Email", handle: "imited@conversations.im", link: "mailto:imited@conversations.im", icon: emailIcon },
];

const WALLETS = [
  { name: "ETH", addr: "0xF631fd9773740056cd116AA1364E894B448C5CF0", color: "#627EEA", icon: ethIcon, key: "eth" as const },
  { name: "BTC", addr: "bc1pnu4rw22fqz5v3y6tvmx9ject7pwfayc0mr28ecdn6w3sx6xdrjmsh5tw5k", color: "#F7931A", icon: btcIcon, key: "btc" as const },
  { name: "SOL", addr: "3mG96WjgDNaj1R8XkxifheoBsoPisVTKwDHFo4ErMeRy", color: "#14F195", icon: solIcon, key: "sol" as const },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [discordHandle, setDiscordHandle] = useState("@whosbleedingg");
  const [discordName, setDiscordName] = useState("blunted");
  const [selectedCrypto, setSelectedCrypto] = useState<"eth" | "btc" | "sol" | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    let active = true;

    fetch("/api/discord-user", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { username?: string; displayName?: string }) => {
        if (!active) return;
        const username = data.username?.trim() || data.displayName?.trim() || "";
        if (username) {
          setDiscordHandle(`@${username}`);
          setDiscordName(username);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    document.title = discordHandle;
  }, [discordHandle, isClient]);

  if (!isClient) {
    return (
      <div className="bio-root">
        <div className="flex flex-col items-center justify-center gap-5">
          <span className="h-7 w-7 animate-spin rounded-full border border-white/10 border-t-white/70" />
          <div className="font-mono text-[0.6rem] uppercase tracking-[0.4em] text-white/40">
            Initializing
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bio-root selection:bg-white selection:text-black">
      <DiscordStatus />
      <StatusPoller />
      <TypingEffect active={isUnlocked} />
      <Lockscreen onUnlock={() => setIsUnlocked(true)} />

      <CryptoModal selectedCrypto={selectedCrypto} onClose={() => setSelectedCrypto(null)} />
      <DitheringBackground />

      <div className={`bio-reveal ${isUnlocked ? "is-in" : ""}`}>
        <div className="bio-column">
          {/* Hero */}
          <motion.header
            className="bio-hero"
            variants={fadeUp}
            initial="hidden"
            animate={isUnlocked ? "show" : "hidden"}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bio-hero-head">
              <div className="bio-id">
                <div className="bio-kicker">
                  wazup
                  <span className="bio-kicker-sep">·</span>
                  <span className="bio-kicker-age">owner</span>
                </div>
                <h1 className="bio-name">{discordName}</h1>
                <div className="bio-status">
                  <span className="bio-status-pill">
                    <img src="/images/ui/custom-icon.png" alt="" className="bio-status-icon" />
                    <span className="bio-handle" id="currentStatusHandle">{discordHandle}</span>
                  </span>
                  <span className="bio-status-dot-wrap">
                    <span className="tui-status-dot" />
                    <span className="bio-status-label">Connecting…</span>
                  </span>
                </div>
              </div>
              <Clock />
            </div>
          </motion.header>

          {/* Bio */}
          <motion.section
            className="bio-section"
            variants={fadeUp}
            initial="hidden"
            animate={isUnlocked ? "show" : "hidden"}
            transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="bio-typing">
              <span id="typingText"></span>
              <span id="typingTexts" className="hidden">i like my knives blunted &lt;&gt; Owner of @grudge.lol &lt;&gt; Not a comboy &lt;&gt; Kinda popular &lt;&gt; send me eth</span>
            </p>
          </motion.section>

          {/* Music — always mounted so playback never stops */}
          <motion.section
            className="bio-section"
            variants={fadeUp}
            initial="hidden"
            animate={isUnlocked ? "show" : "hidden"}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <MusicPlayer />
          </motion.section>

          {/* Projects */}
          <motion.section
            className="bio-section"
            variants={fadeUp}
            initial="hidden"
            animate={isUnlocked ? "show" : "hidden"}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <Projects />
          </motion.section>

          {/* Socials */}
          <motion.section
            className="bio-section"
            variants={fadeUp}
            initial="hidden"
            animate={isUnlocked ? "show" : "hidden"}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="section-label">Socials</div>
            <div className="grid grid-cols-1 gap-2">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.link} target="_blank" rel="noreferrer" className="bio-row group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="bio-row-icon scale-90">{s.icon}</span>
                    <span className="bio-row-name">{s.name}</span>
                  </div>
                  <span className="bio-row-value truncate">{s.handle}</span>
                </a>
              ))}
            </div>
          </motion.section>

          {/* Wallets */}
          <motion.section
            className="bio-section"
            variants={fadeUp}
            initial="hidden"
            animate={isUnlocked ? "show" : "hidden"}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="section-label">Wallets</div>
            <div className="grid grid-cols-1 gap-2">
              {WALLETS.map((c) => (
                <div key={c.name} onClick={() => setSelectedCrypto(c.key)} className="bio-row group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="bio-row-icon scale-90">{c.icon}</span>
                    <span className="bio-row-name">{c.name}</span>
                  </div>
                  <span className="bio-row-value truncate">{c.addr.substring(0, 10)}…{c.addr.slice(-4)}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Terminal toggle */}
          <motion.section
            className="bio-section"
            variants={fadeUp}
            initial="hidden"
            animate={isUnlocked ? "show" : "hidden"}
            transition={{ duration: 0.6, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              className="bio-control w-full"
              onClick={() => setShowTerminal((v) => !v)}
            >
              <span className="font-mono text-[0.7rem]">{showTerminal ? "Close terminal" : "Open terminal"}</span>
            </button>
            {showTerminal && (
              <div className="bio-terminal mt-3">
                <InteractiveTerminal onExit={() => setShowTerminal(false)} />
              </div>
            )}
          </motion.section>

          {/* Footer */}
          <footer className="bio-foot">
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedCrypto("eth")} className="bio-pill" title="Ethereum">{ethIcon}</button>
              <button onClick={() => setSelectedCrypto("btc")} className="bio-pill" title="Bitcoin">{btcIcon}</button>
              <button onClick={() => setSelectedCrypto("sol")} className="bio-pill" title="Solana">{solIcon}</button>
            </div>
            <span className="bio-foot-note">with love</span>
          </footer>

          {/* Scroll cue */}
          <motion.div
            className="bio-scroll-cue"
            variants={fadeUp}
            initial="hidden"
            animate={isUnlocked ? "show" : "hidden"}
            transition={{ duration: 0.6, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="bio-scroll-text">scroll</span>
            <span className="bio-scroll-track">
              <span className="bio-scroll-dot" />
            </span>
          </motion.div>
        </div>
      </div>

      {/* Views — pinned to the corner */}
      <div className={`bio-views ${isUnlocked ? "is-in" : ""}`}>
        <ViewCounter />
      </div>
    </div>
  );
}

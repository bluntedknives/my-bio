"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Tilt from "react-parallax-tilt";
import DiscordStatus from "../components/DiscordStatus";
import MusicPlayer from "../components/MusicPlayer";
import TypingEffect from "../components/TypingEffect";
import Lockscreen from "../components/Lockscreen";
import StatusPoller from "../components/StatusPoller";
import CryptoModal from "../components/CryptoModal";
import ViewCounter from "../components/ViewCounter";

import Projects from "../components/Projects";

const DitheringBackground = dynamic(() => import("../components/DitheringBackground"), {
  ssr: false,
});

const discordIcon = (
  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="1.96 4.26 20.03 15.53">
    <path
      fill="currentColor"
      d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1a14.66 14.66 0 0 0-4.58 0a10.14 10.14 0 0 0-.53-1.1a16 16 0 0 0-4.13 1.3a17.33 17.33 0 0 0-3 11.59a16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83a3.39 3.39 0 0 0 .42-.33a11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84a12.41 12.41 0 0 0 1.08 1.78a16.44 16.44 0 0 0 5.06-2.59a17.22 17.22 0 0 0-3-11.59a16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2a1.93 1.93 0 0 1 1.8-2a1.93 1.93 0 0 1 1.8 2a1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2a1.93 1.93 0 0 1 1.8-2a1.92 1.92 0 0 1 1.8 2a1.92 1.92 0 0 1-1.8 2z"
    />
  </svg>
);

const ethIcon = (
  <svg className="h-5 w-5" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"/>
  </svg>
);

const btcIcon = (
  <svg className="h-5 w-5" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zm-141.651-35.33c4.935-32.928-20.154-50.596-54.45-62.366l11.135-44.708-27.214-6.789-10.846 43.51c-7.154-1.783-14.502-3.464-21.803-5.092l10.938-43.831-27.214-6.789-11.135 44.708c-5.925-1.35-11.711-2.694-17.291-4.095l.013-.057-37.541-9.375-7.24 29.062s20.191 4.627 19.762 4.913c11.022 2.751 13.014 10.044 12.68 15.825l-12.699 50.925c.76.194 1.744.473 2.829.778l-2.846-.71-17.8 71.37c-1.347 3.354-4.767 8.385-12.47 6.462.279.408-19.762-4.932-19.762-4.932l-13.51 31.147 35.412 8.827c6.59 1.65 13.052 3.379 19.424 5.009l-11.276 45.297 27.214 6.789 11.135-44.708c7.428 2.019 14.603 3.932 21.554 5.738l-11.196 44.89 27.214 6.789 11.277-45.273c46.495 8.799 81.506 5.253 96.223-36.798 11.873-33.841-.589-53.363-25.027-66.103 17.798-4.102 31.186-15.79 34.663-39.896zm-62.189 87.175c-8.424 33.841-65.439 15.553-83.921 10.953l14.981-60.059c18.483 4.603 77.526 13.726 68.94 49.106zm8.502-87.679c-7.69 30.82-55.171 15.153-70.597 11.314l13.585-54.508c15.421 3.846 64.819 11.021 57.012 43.194z"/>
  </svg>
);

const solIcon = (
  <svg className="h-5 w-5" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M0 80l48-48h352l48 48-48 48H48L0 80zm448 176l-48 48H48l-48-48 48-48h352l48 48zm-48 176l48 48H96l-48-48 48-48h352l-48 48z"/>
  </svg>
);

export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const [discordProfileUrl, setDiscordProfileUrl] = useState("https://discord.com");
  const [discordHandle, setDiscordHandle] = useState("@blunted");
  const [discordAvatar, setDiscordAvatar] = useState("/images/profile/profile.gif");
  const [selectedCrypto, setSelectedCrypto] = useState<"eth" | "btc" | "sol" | null>(null);
  const [activeTab, setActiveTab] = useState<"bio" | "projects">("bio");

  useEffect(() => {
    setIsClient(true);
    let active = true;

    fetch("/api/discord-user", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { profileUrl?: string; username?: string; displayName?: string; avatarUrl?: string }) => {
        if (!active) return;
        if (typeof data.profileUrl === "string" && data.profileUrl.length > 0) {
          setDiscordProfileUrl(data.profileUrl);
        }
        if (data.avatarUrl) {
          setDiscordAvatar(data.avatarUrl);
        }
        const username = data.username?.trim() || data.displayName?.trim() || "";
        if (username) {
          setDiscordHandle(`@${username}`);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isClient) return;
    document.title = discordHandle;
  }, [discordHandle, isClient]);

  if (!isClient) return <div className="min-h-screen bg-[var(--theme-back)]" />;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[var(--theme-back)] selection:bg-[var(--theme-accent)] selection:text-[var(--theme-back)]">
      <DiscordStatus />
      <StatusPoller />
      <TypingEffect activeTab={activeTab} />
      <Lockscreen />

      <CryptoModal 
        selectedCrypto={selectedCrypto} 
        onClose={() => setSelectedCrypto(null)} 
      />

      <DitheringBackground />

      <main className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <Tilt
          tiltMaxAngleX={3}
          tiltMaxAngleY={3}
          perspective={2000}
          transitionSpeed={2000}
          scale={1}
          gyroscope={true}
          className="w-full max-w-[800px]"
        >
          <div id="container" className="tui-card opacity-0 transition-opacity duration-700">
            <ViewCounter />
            <div className="tui-layout">
              <div className="tui-main">
                <header className="tui-header">
                  <div className="tui-avatar-area">
                    <div className="tui-avatar-frame">
                      <img src={discordAvatar} alt="user" className="tui-avatar" />
                    </div>
                  </div>

                  <div className="tui-user-info">
                    <h1 className="tui-username">{discordHandle}</h1>
                    <div className="tui-status">
                      <span className="tui-status-dot"></span>
                      <span id="currentStatus" className="tui-status-text text-[9px] tracking-widest uppercase opacity-40">Connecting...</span>
                    </div>
                  </div>
                </header>

                <div className="flex gap-4 mb-6 border-b border-[#111111]">
                  <button 
                    onClick={() => setActiveTab("bio")}
                    className={`pb-2 text-[10px] tracking-[0.2em] font-bold transition-all ${activeTab === "bio" ? "text-white border-b border-white" : "text-[#333333] hover:text-[#555555]"}`}
                  >
                    BIO
                  </button>
                  <button 
                    onClick={() => setActiveTab("projects")}
                    className={`pb-2 text-[10px] tracking-[0.2em] font-bold transition-all ${activeTab === "projects" ? "text-white border-b border-white" : "text-[#333333] hover:text-[#555555]"}`}
                  >
                    PROJECTS
                  </button>
                </div>

                <div className="flex-1 min-h-[160px]">
                  {activeTab === "bio" ? (
                    <div className="tui-bio-section">
                      <div className="tui-label">BIO.EXE</div>
                      <div className="tui-bio-content">
                        <span id="typingText"></span>
                        <span id="typingTexts" className="hidden">i like my knives blunted &lt;&gt; i like to ageplay &lt;&gt; send me eth &lt;&gt; im a hentai freak</span>
                      </div>
                    </div>
                  ) : (
                    <Projects />
                  )}
                </div>
              </div>

              <div className="tui-sidebar">
                <MusicPlayer />
                <div className="tui-social-grid mt-auto">
                  <a href={discordProfileUrl} target="_blank" rel="noreferrer" className="tui-social-link" title="Discord">
                    {discordIcon}
                  </a>
                  <button onClick={() => setSelectedCrypto("eth")} className="tui-social-link" title="Ethereum">
                    {ethIcon}
                  </button>
                  <button onClick={() => setSelectedCrypto("btc")} className="tui-social-link" title="Bitcoin">
                    {btcIcon}
                  </button>
                  <button onClick={() => setSelectedCrypto("sol")} className="tui-social-link" title="Solana">
                    {solIcon}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Tilt>
      </main>
    </div>
  );
}

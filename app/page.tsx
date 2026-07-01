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
import InteractiveTerminal from "../components/InteractiveTerminal";

const DitheringBackground = dynamic(() => import("../components/DitheringBackground"), {
  ssr: false,
});

const discordIcon = (
  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="1.96 4.26 20.03 15.53">
    <path
      fill="currentColor"
      d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1a14.66 14.66 0 0 0-4.58 0a10.14 10.14 0 0 0-.53-1.1a16 16 0 0 0-4.13 1.3a17.33 17.33 0 0 0-3 11.59a16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83a3.39 3.39 0 0 0 .42-.33a11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84a12.41 12.41 0 0 0 1.08 1.78a16.44 16.44 0 0 0 5.06-2.59a17.22 17.22 0 0 0-3-11.59a16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2a1.93 1.93 0 0 1 1.8-2a1.93 1.93 0 0 1 1.8 2a1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2a1.93 1.93 0 0 1 1.8-2a1.92 1.92 0 0 1 1.8 2a1.92 1.92 0 0 1-1.8 2z"
    />
  </svg>
);

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

export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [discordProfileUrl, setDiscordProfileUrl] = useState("https://discord.com");
  const [discordHandle, setDiscordHandle] = useState("@blunted");
  const [discordAvatar, setDiscordAvatar] = useState("/images/profile/87fa4deb047cfdbeaa6166a03806a9a4.jpg");
  const [selectedCrypto, setSelectedCrypto] = useState<"eth" | "btc" | "sol" | null>(null);
  const [activeTab, setActiveTab] = useState<"bio" | "projects" | "socials" | "terminal">("bio");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
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
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    document.title = discordHandle;
  }, [discordHandle, isClient]);

  if (!isClient) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
      <svg 
        className="w-16 h-16 text-white" 
        viewBox="0 0 128 128" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M64 0C28.656 0 0 28.656 0 64C0 99.344 28.656 128 64 128C99.344 128 128 99.344 128 64C128 28.656 99.344 0 64 0ZM111.456 102.32L71.408 50.848V96H59.504V32H71.408L106.112 76.656C101.44 87.536 94.128 97.024 84.816 104.224L111.456 102.32ZM76.704 32H88.608V44.272L76.704 32Z" 
          fill="currentColor"
        />
      </svg>
      <div className="text-white font-mono text-xs tracking-[0.5em] animate-pulse uppercase">
        Initializing Client
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[var(--theme-back)] selection:bg-[var(--theme-accent)] selection:text-[var(--theme-back)]">
      <DiscordStatus />
      <StatusPoller />
      <TypingEffect activeTab={activeTab} />
      <Lockscreen onUnlock={() => setIsUnlocked(true)} />

      <CryptoModal 
        selectedCrypto={selectedCrypto} 
        onClose={() => setSelectedCrypto(null)} 
      />

      <DitheringBackground />

      <div className={`transition-all duration-1000 ${isUnlocked ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="console-container">
          <Tilt
            tiltMaxAngleX={1}
            tiltMaxAngleY={1}
            perspective={2000}
            transitionSpeed={1500}
            scale={1}
            gyroscope={true}
            className="w-full"
          >
            <div className="console-unit">
              {/* Header */}
              <header className="console-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-[#111111] p-0.5">
                    <img src={discordAvatar} alt="user" className="w-full h-full object-cover grayscale brightness-100" />
                  </div>
                  <div>
                    <h1 className="tui-username text-sm mb-0">{discordHandle}</h1>
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#888888] tui-status-dot"></span>
                      <span id="currentStatus" className="text-[6px] font-bold tracking-[0.2em] uppercase text-[#888888]">Connecting...</span>
                    </div>
                  </div>
                </div>
                <ViewCounter />
              </header>

              {/* Internal Nav */}
              <nav className="console-nav">
                <button 
                  onClick={() => setActiveTab("bio")}
                  className={`console-nav-btn ${activeTab === "bio" ? "active" : ""}`}
                >
                  01 BIO
                </button>
                <button 
                  onClick={() => setActiveTab("projects")}
                  className={`console-nav-btn ${activeTab === "projects" ? "active" : ""}`}
                >
                  02 PROJ
                </button>
                <button 
                  onClick={() => setActiveTab("socials")}
                  className={`console-nav-btn ${activeTab === "socials" ? "active" : ""}`}
                >
                  03 SOCL
                </button>
                <button 
                  onClick={() => setActiveTab("terminal")}
                  className={`console-nav-btn ${activeTab === "terminal" ? "active" : ""}`}
                >
                  04 TERM
                </button>
              </nav>

              {/* Fixed Height Main Area */}
              <main className="console-body">
                <div className="pt-6 h-full">
                  <div className={activeTab === "bio" ? "block" : "hidden"}>
                    <div className="space-y-10">
                      <section>
                        <div className="tui-label">SYSTEM BIO</div>
                        <p className="text-[12px] leading-relaxed text-[#555555] font-medium tracking-wide">
                          <span id="typingText"></span>
                          <span id="typingTexts" className="hidden">i like my knives blunted &lt;&gt; Owner of @grudge.lol &lt;&gt; Owned some com servers &lt;&gt; Not a comboy &lt;&gt; Kinda popular &lt;&gt; send me eth</span>
                        </p>
                      </section>

                      <section className="pt-6">
                        <MusicPlayer />
                      </section>
                    </div>
                  </div>


                  <div className={activeTab === "projects" ? "block" : "hidden"}>
                    <Projects />
                  </div>

                  <div className={activeTab === "socials" ? "block" : "hidden"}>
                    <section className="mb-8">
                      <div className="tui-label">CONTACT & SOCIALS</div>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { name: "TELEGRAM", val: "@wwersec", link: "https://t.me/wwersec", icon: telegramIcon },
                          { name: "EMAIL", val: "imited@conversations.im", link: "mailto:imited@conversations.im", icon: emailIcon }
                        ].map((s) => (
                          <a 
                            key={s.name}
                            href={s.link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2.5 bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <div className="text-white opacity-30 scale-75 group-hover:opacity-100 transition-opacity">
                                {s.icon}
                              </div>
                              <span className="text-[8px] font-bold text-[#666666] group-hover:text-white transition-colors">{s.name}</span>
                            </div>
                            <span className="text-[7px] font-mono text-[#888888] group-hover:text-[#888888]">{s.val}</span>
                          </a>
                        ))}
                      </div>
                    </section>

                    <section>
                      <div className="tui-label">WALLET ADDRESSES</div>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { name: "ETH", addr: "0xF631fd9773740056cd116AA1364E894B448C5CF0", color: "#627EEA", icon: ethIcon },
                          { name: "BTC", addr: "bc1pnu4rw22fqz5v3y6tvmx9ject7pwfayc0mr28ecdn6w3sx6xdrjmsh5tw5k", color: "#F7931A", icon: btcIcon },
                          { name: "SOL", addr: "3mG96WjgDNaj1R8XkxifheoBsoPisVTKwDHFo4ErMeRy", color: "#14F195", icon: solIcon }
                        ].map((c) => (
                          <div 
                            key={c.name}
                            onClick={() => {
                              navigator.clipboard.writeText(c.addr);
                              alert(`${c.name} Address Copied`);
                            }}
                            className="flex items-center justify-between p-2.5 bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <div style={{ color: c.color }} className="opacity-30 scale-75 group-hover:opacity-100 transition-opacity">
                                {c.icon}
                              </div>
                              <span className="text-[8px] font-bold text-[#666666] group-hover:text-white transition-colors">{c.name}</span>
                            </div>
                            <span className="text-[7px] font-mono text-[#888888] group-hover:text-[#888888]">{c.addr.substring(0, 15)}...</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className={activeTab === "terminal" ? "block h-full" : "hidden h-full"}>
                    <InteractiveTerminal onExit={() => setActiveTab("bio")} />
                  </div>
                </div>
              </main>

              {/* Footer */}
              <footer className="console-footer">
                <div className="flex items-center gap-4">
                  <div className="flex gap-3">
                    <button onClick={() => setSelectedCrypto("eth")} className="void-social-link scale-75" title="Ethereum">{ethIcon}</button>
                    <button onClick={() => setSelectedCrypto("btc")} className="void-social-link scale-75" title="Bitcoin">{btcIcon}</button>
                    <button onClick={() => setSelectedCrypto("sol")} className="void-social-link scale-75" title="Solana">{solIcon}</button>
                  </div>
                </div>

                <div className="text-[6px] font-bold tracking-[0.2em] text-[#555555] hidden sm:block">
                  ENCRYPTION: AES 256
                </div>
              </footer>
            </div>
          </Tilt>
        </div>
      </div>









    </div>
  );
}

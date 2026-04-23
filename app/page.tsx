"use client";

import { useEffect, useState } from "react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import DiscordStatus from "../components/DiscordStatus";
import MusicPlayer from "../components/MusicPlayer";
import TypingEffect from "../components/TypingEffect";
import Lockscreen from "../components/Lockscreen";
import StatusPoller from "../components/StatusPoller";
import CryptoModal from "../components/CryptoModal";

const discordIcon = (
  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="1.96 4.26 20.03 15.53">
    <path
      fill="currentColor"
      d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1a14.66 14.66 0 0 0-4.58 0a10.14 10.14 0 0 0-.53-1.1a16 16 0 0 0-4.13 1.3a17.33 17.33 0 0 0-3 11.59a16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83a3.39 3.39 0 0 0 .42-.33a11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84a12.41 12.41 0 0 0 1.08 1.78a16.44 16.44 0 0 0 5.06-2.59a17.22 17.22 0 0 0-3-11.59a16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2a1.93 1.93 0 0 1 1.8-2a1.93 1.93 0 0 1 1.8 2a1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2a1.93 1.93 0 0 1 1.8-2a1.92 1.92 0 0 1 1.8 2a1.92 1.92 0 0 1-1.8 2z"
    />
  </svg>
);

const ethIcon = (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.944 17.97L4.58 13.62L11.944 24L19.308 13.62L11.944 17.97Z" fill="currentColor"/>
    <path d="M11.944 0L4.58 12.22L11.944 16.57L19.308 12.22L11.944 0Z" fill="currentColor"/>
  </svg>
);

const btcIcon = (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.556.358 9.105 1.956 2.67 8.455-1.25 14.905.353c6.45 1.59 10.346 8.09 8.733 14.551zm-6.763-4.752c.31-2.065-1.262-3.174-3.41-3.914l.696-2.793-1.7-.424-.678 2.718c-.446-.11-.904-.214-1.353-.319l.682-2.735-1.7-.424-.696 2.79c-.37-.08-.733-.163-1.085-.252l.001-.005-2.343-.585-.452 1.815s1.261.29 1.235.308c.688.172.812.628.791 1.002l-.804 3.225c.047.011.109.028.176.053l-.177-.044-1.127 4.516c-.084.21-.297.525-.775.4l-1.235-.308-.844 1.892 2.213.554c.412.103.816.21 1.21.31l-.703 2.827 1.699.424.697-2.795c.464.126.914.246 1.354.36l-.693 2.782 1.7.424.704-2.822c2.9.548 5.087.327 6.007-2.298.741-2.112-.037-3.33-1.564-4.13.791-.532 1.236-1.42 1.055-2.884zm-3.056 6.304c-.526 2.115-4.088.973-5.243.685l.935-3.75c1.155.288 4.84.858 4.308 3.065zm.53-6.341c-.48 1.925-3.441.947-4.403.708l.85-3.407c.96.239 4.039.687 3.553 2.699z"/>
  </svg>
);

const solIcon = (
  <svg className="h-6 w-6" viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M64.6 237.9c2.4 2.4 5.7 3.7 9.2 3.7h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7c-2.4-2.4-5.7-3.7-9.2-3.7H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7zM64.6 75.9c2.4 2.4 5.7 3.7 9.2 3.7h317.4c5.8 0 8.7-7 4.6-11.1L333.1 5.8C330.7 3.4 327.4 2 323.9 2H6.5C0.7 2-2.2 9 1.9 13.1l62.7 62.8zM333.1 154.7c-2.4-2.4-5.7-3.7-9.2-3.7H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.7 9.2 3.7h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="currentColor"/>
  </svg>
);

export default function Page() {
  const [discordProfileUrl, setDiscordProfileUrl] = useState("https://discord.com");
  const [discordHandle, setDiscordHandle] = useState("@blunted");
  const [selectedCrypto, setSelectedCrypto] = useState<"eth" | "btc" | "sol" | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/discord-user", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { profileUrl?: string; username?: string; displayName?: string }) => {
        if (!active) return;
        if (typeof data.profileUrl === "string" && data.profileUrl.length > 0) {
          setDiscordProfileUrl(data.profileUrl);
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
    const titleText = discordHandle;
    const revealSpeed = 120;
    const settleDelay = 1400;
    let revealIndex = 0;
    let running = true;
    let intervalId: number | null = null;
    let timeoutId: number | null = null;

    const startReveal = () => {
      document.title = "";
      intervalId = window.setInterval(() => {
        revealIndex += 1;
        document.title = titleText.slice(0, revealIndex);

        if (revealIndex >= titleText.length) {
          if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
          }

          timeoutId = window.setTimeout(() => {
            if (!running) return;
            revealIndex = 0;
            startReveal();
          }, settleDelay);
        }
      }, revealSpeed);
    };

    startReveal();

    return () => {
      running = false;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      document.title = titleText;
    };
  }, [discordHandle]);

  return (
    <>
      <DiscordStatus />
      <StatusPoller />
      <TypingEffect />
      <Lockscreen />
      
      <CryptoModal 
        selectedCrypto={selectedCrypto} 
        onClose={() => setSelectedCrypto(null)} 
      />

      <div className="relative min-h-[100dvh] w-screen overflow-hidden">
        <img src="/images/backgrounds/fc5326b1cd1fc66c636f1d4996789481.jpg" alt="" className="background-image" aria-hidden="true" />
        <div className="fixed inset-0 bg-black/60" />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-12">
          <Tilt
            tiltMaxAngleX={7}
            tiltMaxAngleY={7}
            perspective={1000}
            transitionSpeed={1500}
            scale={1.01}
            gyroscope={true}
            className="w-full max-w-[860px]"
          >
            <div id="container" className="profile-card w-full opacity-0 transition-opacity duration-1000">
              <div className="profile-layout">
                <div className="profile-main">
                  <div className="profile-header">
                    <div className="profile-header-left">
                      <div className="profile-avatar-wrap relative rounded-full">
                        <img src="/images/profile/profile.gif" alt="Profile" className="profile-avatar rounded-full" />
                        <img
                          src="/images/ui/animated.png"
                          alt=""
                          className="avatar-decoration"
                          aria-hidden="true"
                        />                      </div>
                      <div className="profile-title">
                        <motion.h1 
                          animate={{
                            backgroundPosition: ["200% center", "-200% center"],
                          }}
                          transition={{
                            duration: 3,
                            ease: "linear",
                            repeat: Infinity,
                          }}
                          className="profile-name discord-username bg-[length:200%_100%] bg-gradient-to-r from-[#ffffff] via-[#666666] to-[#ffffff] bg-clip-text text-transparent"
                        >
                          {discordHandle}
                        </motion.h1>
                        <div className="profile-status">
                          <img src="/images/ui/offline.png" alt="" className="discord-status-icon" aria-hidden="true" />
                          <span id="currentStatus" className="discord-status-text">Offline</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="my-8 border border-[#2a2a2a] bg-[#080808] p-8 shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                    <div className="text-sm leading-relaxed text-[#cccccc]">
                      <span id="typingText"></span>
                      <span id="typingTexts" className="hidden">i like my knives blunted &lt;&gt; i like to ageplay &lt;&gt; send me eth &lt;&gt; im a hentai freak</span>
                    </div>
                  </div>

                  <div className="social-row">
                    <a
                      href={discordProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="social-link"
                      title="Discord"
                    >
                      {discordIcon}
                    </a>
                    <button
                      onClick={() => setSelectedCrypto('eth')}
                      className="social-link"
                      title="Ethereum"
                      type="button"
                    >
                      {ethIcon}
                    </button>
                    <button
                      onClick={() => setSelectedCrypto('btc')}
                      className="social-link"
                      title="Bitcoin"
                      type="button"
                    >
                      {btcIcon}
                    </button>
                    <button
                      onClick={() => setSelectedCrypto('sol')}
                      className="social-link"
                      title="Solana"
                      type="button"
                    >
                      {solIcon}
                    </button>
                  </div>
                </div>

                <div className="profile-player">
                  <MusicPlayer />
                </div>
              </div>
            </div>
          </Tilt>
        </div>
      </div>
    </>
  );
}

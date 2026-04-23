"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import DiscordStatus from "../components/DiscordStatus";
import MusicPlayer from "../components/MusicPlayer";
import TypingEffect from "../components/TypingEffect";
import Lockscreen from "../components/Lockscreen";
import StatusPoller from "../components/StatusPoller";

const discordIcon = (
  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="1.96 4.26 20.03 15.53">
    <path
      fill="currentColor"
      d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1a14.66 14.66 0 0 0-4.58 0a10.14 10.14 0 0 0-.53-1.1a16 16 0 0 0-4.13 1.3a17.33 17.33 0 0 0-3 11.59a16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83a3.39 3.39 0 0 0 .42-.33a11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84a12.41 12.41 0 0 0 1.08 1.78a16.44 16.44 0 0 0 5.06-2.59a17.22 17.22 0 0 0-3-11.59a16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2a1.93 1.93 0 0 1 1.8-2a1.93 1.93 0 0 1 1.8 2a1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2a1.93 1.93 0 0 1 1.8-2a1.92 1.92 0 0 1 1.8 2a1.92 1.92 0 0 1-1.8 2z"
    />
  </svg>
);

export default function Page() {
  const [discordProfileUrl, setDiscordProfileUrl] = useState("https://discord.com");
  const [discordHandle, setDiscordHandle] = useState("@blunted");

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
                      <span id="typingTexts" className="hidden">i like my knives blunted</span>
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

"use client";

import { useEffect } from "react";
import AntiInspect from "./AntiInspect";
import BadgeAnim from "./BadgeAnim";
import ContainerMusicAnim from "./ContainerMusicAnim";
import ContainerTilt from "./ContainerTilt";
import CurSnow from "./CurSnow";
import DiscordStatus from "./DiscordStatus";
import DiscordUserImage from "./DiscordUserImage";
import PlayerController from "./PlayerController";
import PopupController from "./PopupController";
import RowAnimations from "./RowAnimations";
import StatusPoller from "./StatusPoller";
import TitleAnimator from "./TitleAnimator";
import TypingEffect from "./TypingEffect";

export default function ClientEffects() {
  useEffect(() => {
    // Favicon Shimmer
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let hue = 0;
    const interval = setInterval(() => {
      ctx.clearRect(0, 0, 32, 32);
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fill();
      
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = canvas.toDataURL("image/x-icon");
      if (!link.parentNode) document.getElementsByTagName('head')[0].appendChild(link);
      
      hue = (hue + 10) % 360;
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AntiInspect />
      <BadgeAnim />
      <ContainerMusicAnim />
      <CurSnow />
      <DiscordStatus />
      <DiscordUserImage />
      <PlayerController />
      <PopupController />
      <RowAnimations />
      <StatusPoller />
      <TitleAnimator />
      <TypingEffect />
    </>
  );
}

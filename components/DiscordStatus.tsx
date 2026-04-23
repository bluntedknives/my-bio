"use client";

import { useEffect } from "react";

const STATUS_COLORS: Record<string, string> = {
  online: "#3ba55d",
  idle: "#f0b232",
  dnd: "#ed4245",
  offline: "#747f8d",
};
const STATUS_LABELS: Record<string, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};
const STATUS_ICONS: Record<string, string> = {
  online: "/images/ui/online.png",
  idle: "/images/ui/idle.png",
  dnd: "/images/ui/dnd.png",
  offline: "/images/ui/offline.png",
};

type LanyardResponse = {
  status?: string;
  username?: string;
  displayName?: string;
};

export default function DiscordStatus() {
  useEffect(() => {
    const updateProfile = () => {
      fetch("/api/discord-user", { cache: "no-store" })
        .then((response) => response.json())
        .then((payload: LanyardResponse) => {
          const username = payload.username?.trim() || payload.displayName?.trim() || "";
          const handle = username ? `@${username}` : "";
          const status = payload.status ?? "offline";

          const statusTargets = document.querySelectorAll<HTMLElement>(".discordStatus, .discord-status-dot");
          statusTargets.forEach((node) => {
            if (node instanceof HTMLImageElement) {
              node.src = STATUS_ICONS[status] ?? STATUS_ICONS.offline;
              return;
            }
            node.style.background = STATUS_COLORS[status] ?? STATUS_COLORS.offline;
          });

          const statusIconTargets = document.querySelectorAll<HTMLImageElement>(".discord-status-icon");
          statusIconTargets.forEach((node) => {
            node.src = STATUS_ICONS[status] ?? STATUS_ICONS.offline;
          });

          const statusTextTargets = document.querySelectorAll<HTMLElement>(".discord-status-text");
          statusTextTargets.forEach((node) => {
            node.textContent = STATUS_LABELS[status] ?? STATUS_LABELS.offline;
          });

          const nameTargets = document.querySelectorAll<HTMLElement>(".username, .discord-username");
          nameTargets.forEach((el) => {
            el.textContent = handle;
          });

          const handleTargets = document.querySelectorAll<HTMLElement>(".profile-username");
          handleTargets.forEach((el) => {
            el.textContent = username;
          });
        })
        .catch((error) => {
          const statusElement = document.querySelector<HTMLElement>(".status-debugging");
          if (statusElement) {
            statusElement.textContent = `Connection error: ${error.message}`;
            statusElement.style.color = "red";
          }
        });
    };

    updateProfile();
    const intervalId = window.setInterval(updateProfile, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}

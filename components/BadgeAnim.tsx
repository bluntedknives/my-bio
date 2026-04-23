"use client";

import { useEffect } from "react";

type Cleanup = () => void;

type BadgeClassMap = [string, string][];

const BADGE_CLASS_MAP: BadgeClassMap = [
  ["dev", "Developer"],
  ["staff", "Staff"],
  ["certif", "Certified"],
  ["premium", "Premium"],
  ["bughunter", "Bug Hunter"],
  ["earlysupporter", "Early Supporter"],
  ["fire", "ζξζ ι ζξζ"],
  ["graphic", "Graphic Designer"],
  ["imagehost", "Image Host"],
  ["og", "OG"],
  ["sweet", "Candy"],
  ["patrick", "St. Patrick"],
];

function getBadgeTooltipText(badge: Element) {
  for (const [className, text] of BADGE_CLASS_MAP) {
    if (badge.classList.contains(className)) {
      return text;
    }
  }
  return "";
}

export default function BadgeAnim() {
  useEffect(() => {
    const cleanups: Cleanup[] = [];

    const setupTooltip = (badge: HTMLElement, tooltipText: string, topOffset: number, extraClass?: string) => {
      const tooltip = document.createElement("div");
      tooltip.className = extraClass ? `badge-tooltip ${extraClass}` : "badge-tooltip";
      tooltip.textContent = tooltipText;
      tooltip.style.visibility = "hidden";
      tooltip.style.opacity = "0";
      document.body.appendChild(tooltip);

      const show = () => {
        const badgeRect = badge.getBoundingClientRect();
        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "0";
        tooltip.style.transform = "translate(-50%, 10px) scale(0.8)";
        tooltip.style.left = `${badgeRect.left + badgeRect.width / 2}px`;
        tooltip.style.top = `${badgeRect.top - topOffset}px`;

        requestAnimationFrame(() => {
          tooltip.style.opacity = "0.9";
          tooltip.style.transform = "translate(-50%, -30px) scale(1)";
        });
      };

      const hide = () => {
        tooltip.style.opacity = "0";
        tooltip.style.transform = "translate(-50%, 10px) scale(0.8)";
        setTimeout(() => {
          tooltip.style.visibility = "hidden";
        }, 300);
      };

      badge.addEventListener("mouseenter", show);
      badge.addEventListener("mouseleave", hide);

      cleanups.push(() => {
        badge.removeEventListener("mouseenter", show);
        badge.removeEventListener("mouseleave", hide);
        tooltip.remove();
      });
    };

    const badges = Array.from(document.querySelectorAll<HTMLElement>(".profileBadge"));
    badges.forEach((badge) => {
      const tooltipText = getBadgeTooltipText(badge);
      if (!tooltipText) return;
      setupTooltip(badge, tooltipText, 10);
    });

    const discordBadges = Array.from(document.querySelectorAll<HTMLElement>(".discordUserBadge[data-tooltip]"));
    discordBadges.forEach((badge) => {
      const tooltipText = badge.getAttribute("data-tooltip");
      if (!tooltipText) return;
      setupTooltip(badge, tooltipText, 7, "discord-tooltip");
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

export default function PopupController() {
  useEffect(() => {
    const popup = document.getElementById("redirect-popup");
    const popupCancel = document.getElementById("popup-cancel");
    const popupConfirm = document.getElementById("popup-confirm");
    const popupMessage = document.getElementById("popup-message");

    if (!popup || !popupCancel || !popupConfirm || !popupMessage) return;

    let currentLink = "";
    let currentPlatform = "";

    const linkHandlers: Array<() => void> = [];

    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a#trigger-popup"));
    links.forEach((link) => {
      const handler = (event: MouseEvent) => {
        event.preventDefault();
        currentLink = link.getAttribute("href") || "";
        currentPlatform = link.getAttribute("data-type") || "";
        popupMessage.textContent = `You will be redirected to ${currentPlatform}. Do you want to continue?`;
        popup.classList.add("active");
      };

      link.addEventListener("click", handler);
      linkHandlers.push(() => link.removeEventListener("click", handler));
    });

    const handleCancel = () => {
      popup.classList.remove("active");
    };

    const handleConfirm = () => {
      if (currentLink) {
        window.open(currentLink, "_blank");
      }
      popup.classList.remove("active");
    };

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === popup) {
        popup.classList.remove("active");
      }
    };

    popupCancel.addEventListener("click", handleCancel);
    popupConfirm.addEventListener("click", handleConfirm);
    popup.addEventListener("click", handleBackdropClick);

    return () => {
      linkHandlers.forEach((cleanup) => cleanup());
      popupCancel.removeEventListener("click", handleCancel);
      popupConfirm.removeEventListener("click", handleConfirm);
      popup.removeEventListener("click", handleBackdropClick);
    };
  }, []);

  return null;
}

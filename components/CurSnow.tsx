"use client";

import { useEffect } from "react";

export default function CurSnow() {
  useEffect(() => {
    const star: HTMLDivElement[] = [];
    const starX: number[] = [];
    const starY: number[] = [];
    const starRemainingTicks: Array<number | null> = [];
    const tiny: HTMLDivElement[] = [];
    const tinyX: number[] = [];
    const tinyY: number[] = [];
    const tinyRemainingTicks: Array<number | null> = [];

    const sparkles = 7;
    const sparkleLifetime = 30;
    const sparkleDistance = 10000;
    const starSize = 10;
    const starColors = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFDDD"];

    let docHeight = document.documentElement.scrollHeight;
    let docWidth = document.documentElement.scrollWidth;
    let sparklesEnabled: boolean | null = null;
    const starOpacity = 0.9;
    const glowEnabled = true;

    let sparkleIntervalId: number | null = null;
    let animationTimerId: number | null = null;

    const twinkleStyle = document.createElement("style");
    twinkleStyle.type = "text/css";
    twinkleStyle.textContent = `
@keyframes twinkle {
    0% { opacity: ${starOpacity}; }
    50% { opacity: ${starOpacity * 0.4}; }
    100% { opacity: ${starOpacity}; }
}
`;
    document.head.appendChild(twinkleStyle);

    const sparkleDestroy = () => {
      let elem: HTMLDivElement | undefined;
      while (tiny.length) {
        elem = tiny.pop();
        if (elem) document.body.removeChild(elem);
      }
      while (star.length) {
        elem = star.pop();
        if (elem) document.body.removeChild(elem);
      }
    };

    const sparkleInit = () => {
      for (let i = 0; i < sparkles; i += 1) {
        const tinyDiv = document.createElement("div");
        tinyDiv.style.position = "absolute";
        tinyDiv.style.height = "3px";
        tinyDiv.style.width = "3px";
        tinyDiv.style.overflow = "hidden";
        tinyDiv.style.visibility = "hidden";
        tinyDiv.style.zIndex = "999";
        tinyDiv.style.borderRadius = "50%";

        if (tiny[i]) {
          document.body.removeChild(tiny[i]);
        }

        document.body.appendChild(tinyDiv);
        tiny[i] = tinyDiv;
        tinyRemainingTicks[i] = null;

        const starDiv = document.createElement("div");
        starDiv.style.position = "absolute";
        starDiv.style.height = `${starSize}px`;
        starDiv.style.width = `${starSize}px`;
        starDiv.style.overflow = "visible";
        starDiv.style.visibility = "hidden";
        starDiv.style.zIndex = "999";

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("height", `${starSize}px`);
        svg.setAttribute("width", `${starSize}px`);
        svg.setAttribute("viewBox", "0 0 511.45 511.45");
        svg.style.overflow = "visible";

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute(
          "d",
          "M502.842,225.679c14.769-14.769,6.892-40.369-13.785-43.323l-119.138-17.723 c-7.877-0.985-15.754-6.892-18.708-13.785L298.042,42.54c-8.862-18.708-36.431-18.708-45.292,0L199.58,150.848 c-3.938,7.877-10.831,12.8-18.708,13.785L60.749,182.356c-20.677,2.954-29.538,28.554-13.785,43.323l85.662,83.692 c5.908,5.908,8.862,13.785,6.892,22.646l-20.677,118.154c-1.969,14.769,6.892,26.585,19.692,29.538 c0.985-2.954,2.954-5.908,6.892-6.892c41.354-9.846,73.846-35.446,107.323-61.046c6.892-5.908,13.785,0.985,14.769,7.877 c5.908-1.969,12.8-0.985,18.708,1.969l106.338,56.123c18.708,9.846,40.369-5.908,36.431-26.585l-20.677-118.154 c-0.985-7.877,0.985-16.738,6.892-22.646L502.842,225.679z"
        );

        svg.appendChild(path);
        starDiv.appendChild(svg);

        if (star[i]) {
          document.body.removeChild(star[i]);
        }

        document.body.appendChild(starDiv);
        star[i] = starDiv;
        starRemainingTicks[i] = null;
      }
    };

    const sparkle = (enable: boolean | null = null) => {
      if (enable === null) {
        sparklesEnabled = !sparklesEnabled;
      } else {
        sparklesEnabled = Boolean(enable);
      }

      if (sparklesEnabled && star.length < sparkles) {
        sparkleInit();
      }
    };

    const updateStar = (index: number) => {
      if (starRemainingTicks[index] === null) return false;

      starRemainingTicks[index] = (starRemainingTicks[index] ?? 0) - 1;

      if (starRemainingTicks[index] === 0) {
        starToTiny(index);
        return false;
      }

      if (starRemainingTicks[index] === sparkleLifetime) {
        star[index].style.opacity = `${starOpacity * 0.7}`;
      }

      if (starRemainingTicks[index] % 5 === 0) {
        star[index].style.opacity = `${starOpacity * (0.7 + Math.random() * 0.3)}`;
      }

      if ((starRemainingTicks[index] ?? 0) > 0) {
        starY[index] += 0.5 + Math.random();
        starX[index] += (index % 5 - 2) / 6;

        const currentRotation = parseFloat(star[index].style.transform.replace("rotate(", "").replace("deg)", "") || "0");
        const newRotation = currentRotation + (Math.random() - 0.5) * 2;
        star[index].style.transform = `rotate(${newRotation}deg)`;

        if (starY[index] + starSize < docHeight && starX[index] + starSize < docWidth) {
          star[index].style.top = `${starY[index]}px`;
          star[index].style.left = `${starX[index]}px`;
          return true;
        }
      }

      starRemainingTicks[index] = null;
      star[index].style.left = "0px";
      star[index].style.top = "0px";
      star[index].style.visibility = "hidden";
      return false;
    };

    const updateTiny = (index: number) => {
      if (tinyRemainingTicks[index] === null) return false;

      tinyRemainingTicks[index] = (tinyRemainingTicks[index] ?? 0) - 1;

      if (tinyRemainingTicks[index] === sparkleLifetime) {
        tiny[index].style.width = "1px";
        tiny[index].style.height = "1px";
        tiny[index].style.opacity = `${starOpacity * 0.5}`;
      }

      if ((tinyRemainingTicks[index] ?? 0) > 0) {
        tinyY[index] += 0.7 + Math.random();
        tinyX[index] += (index % 4 - 2) / 5;

        if (tinyY[index] + 3 < docHeight && tinyX[index] + 3 < docWidth) {
          tiny[index].style.top = `${tinyY[index]}px`;
          tiny[index].style.left = `${tinyX[index]}px`;
          return true;
        }
      }

      tinyRemainingTicks[index] = null;
      tiny[index].style.top = "0px";
      tiny[index].style.left = "0px";
      tiny[index].style.visibility = "hidden";
      return false;
    };

    const starToTiny = (index: number) => {
      if (starRemainingTicks[index] === null) return;

      const starPath = star[index].querySelector("path");
      const starColor = starPath ? starPath.getAttribute("fill") || "#FFFFFF" : "#FFFFFF";

      if (starY[index] + starSize / 2 < docHeight && starX[index] + starSize / 2 < docWidth) {
        tinyRemainingTicks[index] = sparkleLifetime * 2;
        tinyY[index] = starY[index] + starSize / 2;
        tiny[index].style.top = `${tinyY[index]}px`;
        tinyX[index] = starX[index] + starSize / 2;
        tiny[index].style.left = `${tinyX[index]}px`;
        tiny[index].style.width = "2px";
        tiny[index].style.height = "2px";
        tiny[index].style.backgroundColor = starColor;

        if (glowEnabled) {
          tiny[index].style.boxShadow = `0 0 3px ${starColor}`;
        }

        tiny[index].style.opacity = `${starOpacity * 0.8}`;
        star[index].style.visibility = "hidden";
        tiny[index].style.visibility = "visible";
      }

      starRemainingTicks[index] = null;
      star[index].style.left = "0px";
      star[index].style.top = "0px";
      star[index].style.visibility = "hidden";
    };

    const createStar = (x: number, y: number, probability = 1) => {
      if (x + starSize >= docWidth || y + starSize >= docHeight) return;
      if (Math.random() > probability) return;

      const getRandomColor = () => starColors[Math.floor(Math.random() * starColors.length)];

      let minLifetime: number | null = sparkleLifetime * 2 + 1;
      let minIndex = NaN;
      for (let i = 0; i < sparkles; i += 1) {
        if (!starRemainingTicks[i]) {
          minLifetime = null;
          minIndex = i;
          break;
        }
        if ((starRemainingTicks[i] ?? 0) < (minLifetime ?? 0)) {
          minLifetime = starRemainingTicks[i] ?? 0;
          minIndex = i;
        }
      }

      if (minLifetime) {
        starToTiny(minIndex);
      }

      if (minIndex >= 0) {
        starRemainingTicks[minIndex] = sparkleLifetime * 2;
        starX[minIndex] = x;
        star[minIndex].style.left = `${x}px`;
        starY[minIndex] = y;
        star[minIndex].style.top = `${y}px`;

        const scale = 0.5 + Math.random() * 0.5;
        const svg = star[minIndex].firstChild as SVGElement | null;
        if (svg) {
          (svg as SVGElement).style.transform = `scale(${scale})`;
        }

        const color = getRandomColor();
        const path = star[minIndex].querySelector("path");
        if (path) path.setAttribute("fill", color);

        if (glowEnabled) {
          star[minIndex].style.filter = `drop-shadow(0 0 3px ${color})`;
        }

        star[minIndex].style.animation = `twinkle ${1 + Math.random()}s infinite alternate`;
        star[minIndex].style.opacity = `${starOpacity}`;
        star[minIndex].style.visibility = "visible";
        star[minIndex].style.transform = `rotate(${Math.random() * 360}deg)`;

        return minIndex;
      }
      return undefined;
    };

    const animateSparkles = (fps = 60) => {
      const intervalMilliseconds = 1000 / fps;
      let alive = 0;

      for (let i = 0; i < star.length; i += 1) {
        alive += Number(updateStar(i));
      }

      for (let i = 0; i < tiny.length; i += 1) {
        alive += Number(updateTiny(i));
      }

      if (alive === 0 && !sparklesEnabled) {
        sparkleDestroy();
      }

      animationTimerId = window.setTimeout(() => animateSparkles(fps), intervalMilliseconds);
    };

    const handleResize = () => {
      for (let i = 0; i < sparkles; i += 1) {
        if (star[i]) {
          starRemainingTicks[i] = null;
          star[i].style.left = "0px";
          star[i].style.top = "0px";
          star[i].style.visibility = "hidden";
        }

        if (tiny[i]) {
          tinyRemainingTicks[i] = null;
          tiny[i].style.top = "0px";
          tiny[i].style.left = "0px";
          tiny[i].style.visibility = "hidden";
        }
      }

      docHeight = document.documentElement.scrollHeight;
      docWidth = document.documentElement.scrollWidth;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!sparklesEnabled || event.buttons) return;
      const distance = Math.sqrt(event.movementX ** 2 + event.movementY ** 2) || 1;
      const deltaX = (event.movementX * sparkleDistance * 2) / distance;
      const deltaY = (event.movementY * sparkleDistance * 2) / distance;
      const probability = distance / sparkleDistance;
      let cumulativeX = 0;

      let mouseY = event.pageY;
      let mouseX = event.pageX;

      if (distance > 5) {
        for (let i = 0; i < 3; i += 1) {
          const offsetX = (Math.random() - 0.5) * 20;
          const offsetY = (Math.random() - 0.5) * 20;
          createStar(mouseX + offsetX, mouseY + offsetY, 0.7);
        }
      }

      while (Math.abs(cumulativeX) < Math.abs(event.movementX)) {
        createStar(mouseX, mouseY, probability);

        const delta = Math.random();
        mouseX -= deltaX * delta;
        mouseY -= deltaY * delta;
        cumulativeX += deltaX * delta;
      }
    };

    const initSparkles = () => {
      docHeight = document.documentElement.scrollHeight;
      docWidth = document.documentElement.scrollWidth;

      animateSparkles();
      if (sparklesEnabled === null) {
        sparkle(true);
      }
    };

    if (document.readyState === "complete") {
      initSparkles();
    } else {
      window.addEventListener("load", initSparkles, { once: true });
    }

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousemove", handleMouseMove);

    sparkleIntervalId = window.setInterval(() => {
      if (sparklesEnabled) {
        const x = Math.random() * docWidth;
        const y = Math.random() * docHeight;
        createStar(x, y, 0.3);
      }
    }, 500);

    return () => {
      window.removeEventListener("load", initSparkles);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousemove", handleMouseMove);
      if (sparkleIntervalId) window.clearInterval(sparkleIntervalId);
      if (animationTimerId) window.clearTimeout(animationTimerId);
      sparkleDestroy();
      twinkleStyle.remove();
    };
  }, []);

  return null;
}

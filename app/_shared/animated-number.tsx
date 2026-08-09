"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimatedNumber({
  value,
  duration = 900,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    // Respecta preferinta de reducere a miscarii -- sare direct la valoare.
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    startRef.current = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic -- porneste rapid, incetineste spre final
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}

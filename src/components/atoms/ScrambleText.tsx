"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";

interface ScrambleTextProps {
  text: string;
  className?: string;
  triggerOnMount?: boolean;
  speed?: number; // ms per frame
}

export function ScrambleText({
  text,
  className,
  triggerOnMount = true,
  speed = 40,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text); // SSR互換：初期は必ずtextを表示
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iterRef = useRef(0);

  const scramble = useCallback(() => {
    if (frameRef.current) clearTimeout(frameRef.current);
    iterRef.current = 0;

    const totalFrames = text.length * 6;

    const tick = () => {
      const iter = iterRef.current;
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            const lockAt = i * 6;
            if (iter >= lockAt + 4) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      iterRef.current++;
      if (iterRef.current <= totalFrames) {
        frameRef.current = setTimeout(tick, speed);
      } else {
        setDisplay(text);
      }
    };

    tick();
  }, [text, speed]);

  useEffect(() => {
    if (triggerOnMount) {
      const t = setTimeout(scramble, 200);
      return () => clearTimeout(t);
    }
  }, [scramble, triggerOnMount]);

  useEffect(() => {
    return () => {
      if (frameRef.current) clearTimeout(frameRef.current);
    };
  }, []);

  return (
    <span
      className={className}
      onMouseEnter={scramble}
      style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}
    >
      {display || text}
    </span>
  );
}

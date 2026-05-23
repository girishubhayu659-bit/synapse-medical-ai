"use client";

import { useEffect, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

export default function ScrambleText({ 
  text, 
  delay = 0, 
  className = "" 
}: { 
  text: string; 
  delay?: number; 
  className?: string;
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 1. Tell React the component is safely mounted in the browser
    setIsMounted(true);
    
    let iteration = 0;
    let interval: NodeJS.Timeout;

    const startAnimation = () => {
      clearInterval(interval);
      interval = setInterval(() => {
        setDisplayText((prev) =>
          text.split("")
            .map((char, index) => {
              if (index < iteration) return text[index];
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );
        if (iteration >= text.length) clearInterval(interval);
        iteration += 1 / 3; // Speed of deciphering
      }, 30);
    };

    // 2. Wait for any delay, then start scrambling
    const timeout = setTimeout(startAnimation, delay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [text, delay]);

  // THE HYDRATION FIX: 
  // If we are on the server, just render the plain, boring text. 
  // This guarantees the server and client match 100% of the time.
  if (!isMounted) {
    return <span className={className}>{text}</span>;
  }

  // Once safely in the browser, render the cool animated text!
  return <span className={className}>{displayText}</span>;
}
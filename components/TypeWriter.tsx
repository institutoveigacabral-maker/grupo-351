"use client";

import { useEffect, useState } from "react";

interface Props {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

export function TypeWriter({
  words,
  className = "",
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseTime = 2000,
}: Props) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[index];

    if (!isDeleting && text === current) {
      const pause = setTimeout(() => setIsDeleting(true), pauseTime);
      return () => clearTimeout(pause);
    }

    if (isDeleting && text === "") {
      queueMicrotask(() => {
        setIsDeleting(false);
        setIndex((i) => (i + 1) % words.length);
      });
      return;
    }

    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          // Delete by word: find the last space before current position
          const lastSpace = current.lastIndexOf(" ", text.length - 2);
          setText(lastSpace > 0 ? current.slice(0, lastSpace) : "");
        } else {
          setText(current.slice(0, text.length + 1));
        }
      },
      isDeleting ? deletingSpeed * 2 : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, words, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className={className}>
      {text}
      <span className="animate-blink text-accent">|</span>
    </span>
  );
}

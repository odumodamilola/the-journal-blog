"use client";
import { useEffect, useState } from "react";
import { ArrowUp, Check, Link as LinkIcon, Share2 } from "lucide-react";

export function ReadingTools({ title }: { title: string }) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const article = document.getElementById("article-content");
        if (!article) return;
        const rect = article.getBoundingClientRect();
        setProgress(
          Math.min(
            1,
            Math.max(
              0,
              (window.innerHeight - rect.top) / Math.max(1, rect.height),
            ),
          ),
        );
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setMessage("Article link copied.");
    } catch {
      setMessage("Copy the article address from your browser's address bar.");
    }
  };
  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title, url: window.location.href });
      setMessage("Sharing completed.");
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        setMessage("Sharing is unavailable. Use Copy link instead.");
    }
  };
  return (
    <>
      <div
        className="reading-progress"
        aria-hidden="true"
        style={{ transform: `scaleX(${progress})` }}
      />
      <div className="article-tools">
        <button type="button" onClick={copy}>
          {copied ? (
            <Check size={15} aria-hidden="true" />
          ) : (
            <LinkIcon size={15} aria-hidden="true" />
          )}
          {copied ? "Link copied" : "Copy link"}
        </button>
        <button type="button" onClick={share}>
          <Share2 size={15} aria-hidden="true" />
          Share story
        </button>
        <a href="#article-top">
          <ArrowUp size={15} aria-hidden="true" />
          Back to top
        </a>
        <p role="status" className="sr-only">
          {message}
        </p>
      </div>
    </>
  );
}

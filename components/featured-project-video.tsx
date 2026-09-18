"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function FeaturedProjectVideo({ src, mobileSrc, poster, title }: { src: string; mobileSrc?: string; poster?: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 680px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && !video.paused) video.pause();
    }, { threshold: 0.2 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function play() {
    const video = videoRef.current;
    if (!video) return;
    setStarted(true);
    setLoading(true);
    setError(false);
    video.play().catch(() => { setLoading(false); setError(true); });
  }

  return <div className={`featured-video ${started ? "is-started" : ""}`}>
    <video
      ref={videoRef}
      src={isMobile && mobileSrc ? mobileSrc : src}
      poster={poster || undefined}
      controls={started}
      playsInline
      preload="metadata"
      aria-label={`${title} төслийн highlight видео`}
      onCanPlay={() => setLoading(false)}
      onWaiting={() => setLoading(true)}
      onPlaying={() => { setLoading(false); setError(false); }}
      onError={() => { setLoading(false); setError(true); }}
    />
    {!started && <button className="featured-video-play" type="button" onClick={play} aria-label={`${title} видеог тоглуулах`}><Play size={30} fill="currentColor" /></button>}
    {loading && <span className="featured-video-status" role="status">Видео ачаалж байна...</span>}
    {error && <span className="featured-video-status is-error" role="alert">Видео ачаалж чадсангүй. Дахин оролдоно уу.</span>}
  </div>;
}

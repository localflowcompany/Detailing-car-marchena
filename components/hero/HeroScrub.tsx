"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { HERO_POSTER_URL, initHeroScrub, wordThresholds } from "@/lib/heroScrub";

const HEADLINE_1 = "Esto no es un lavado.";
const HEADLINE_2 = "Es sacarle su máximo partido.";
const SUBTITLE = "Detailing profesional en Marchena.";
const BRAND = "DETAILING CAR MARCHENA";

function Split({ text, seed }: { text: string; seed: number }) {
  return (
    <span className="split">
      {wordThresholds(text, seed).map(({ w, th }, i) => (
        <span key={i}>
          {i > 0 && " "}
          <span className="w" style={{ "--th": th } as CSSProperties}>
            {w}
          </span>
        </span>
      ))}
    </span>
  );
}

function Badge() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/logo-boton-512.png" alt="" width={160} height={160} className="hero-badge" />
  );
}

export function HeroScrub() {
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heroPin = pinRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    const poster = posterRef.current;
    if (!heroPin || !stage || !video || !poster) return;
    return initHeroScrub({ heroPin, stage, video, poster, scrollCue: cueRef.current });
  }, []);

  return (
    <div className="hero-pin" ref={pinRef}>
      <div className="hero-stage" ref={stageRef}>
        <div className="hero-media">
          <div
            className="poster"
            ref={posterRef}
            style={{ backgroundImage: `url('${HERO_POSTER_URL}')` }}
          />
          <video ref={videoRef} aria-hidden="true" tabIndex={-1} muted playsInline preload="none" />
        </div>
        <div className="scrim-global" aria-hidden="true" />
        <div className="hero-bottom-fade" aria-hidden="true" />

        <div className="band band-punch" data-range="0.28,0.58">
          <h1 className="text-hero">
            <Split text={HEADLINE_1} seed={1000} />
          </h1>
        </div>

        <div className="band band-punch" data-range="0.58,0.80">
          <h2 className="text-hero">
            <Split text={HEADLINE_2} seed={1001} />
          </h2>
        </div>

        <div className="band band-rise band-brand" data-range="0.78,1.0">
          <Badge />
          <span className="text-eyebrow text-gold">
            <Split text={BRAND} seed={1002} />
          </span>
          <span className="text-body-sm text-muted seo-line">{SUBTITLE}</span>
        </div>

        <div className="scroll-cue text-label-tech" ref={cueRef}>
          Sigue bajando
        </div>

        <div className="static-hero">
          <h2 className="text-hero">{HEADLINE_1}</h2>
          <h2 className="text-hero">{HEADLINE_2}</h2>
          <div className="static-brand">
            <Badge />
            <span className="text-eyebrow text-gold">{BRAND}</span>
            <span className="text-body-sm text-muted seo-line">{SUBTITLE}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

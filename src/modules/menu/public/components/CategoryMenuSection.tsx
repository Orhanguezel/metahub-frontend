"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styled, { css, keyframes } from "styled-components";
import Link from "next/link";
import Image from "next/image";

import type { SupportedLocale } from "@/types/common";
import ItemCard from "./ItemCard";

/** Yeni: kategori kart tipi (opsiyonel) */
export type CategoryCard = {
  id: string;
  title: string;
  image: string;   // url/webp/thumbnail
  href?: string;   // opsiyonel yönlendirme
};

type Props = {
  id: string;
  title: string;
  items?: any[]; // <-- backward compatible (ürün grid’i)
  lang: SupportedLocale;
  t?: (k: string, d?: string) => string; // <-- optional (fallback aşağıda)
  isLoading?: boolean;

  /** Yeni: “Burger / Fries / Noodles ...” gibi kategori görselleri için */
  categoryCards?: CategoryCard[];
  /** px/sn – küçük ekranda otomatik biraz düşürülür */
  marqueeSpeed?: number;
};

export default function CategoryMenuSection({
  id,
  title,
  items,
  lang,
  t,
  isLoading = false,
  categoryCards = [],
  marqueeSpeed = 90,
}: Props) {
  // güvenli çeviri
  const tr = typeof t === "function" ? t : (k: string, d?: string) => d ?? String(k);
  // güvenli listeler
  const list = Array.isArray(items) ? items : [];
  const cats = (categoryCards || []).filter((c) => !!c?.image);

  /** ====== Sonsuz döngü ölçüm & animasyon ayarları ====== */
  const shellRef = useRef<HTMLDivElement>(null);
  const firstTrackRef = useRef<HTMLDivElement>(null);
  const [halfWidth, setHalfWidth] = useState(0);
  const [containerW, setContainerW] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState<"normal" | "reverse">("normal");

  // responsive hız
  const effectiveSpeed = useMemo(() => {
    if (typeof window === "undefined") return marqueeSpeed;
    return window.innerWidth < 700 ? Math.max(40, marqueeSpeed * 0.7) : marqueeSpeed;
  }, [marqueeSpeed]);

  // süre = şerit yarı genişliği / hız
  const durationSec = useMemo(() => {
    if (!halfWidth || !effectiveSpeed) return 20;
    return Math.max(8, halfWidth / effectiveSpeed);
  }, [halfWidth, effectiveSpeed]);

  // ölçüm
  useEffect(() => {
    const measure = () => {
      if (shellRef.current) setContainerW(shellRef.current.clientWidth);
      if (firstTrackRef.current) setHalfWidth(firstTrackRef.current.scrollWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (shellRef.current) ro.observe(shellRef.current);
    if (firstTrackRef.current) ro.observe(firstTrackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [cats.length]);

  // içerik konteyneri aşarsa loop
  const shouldLoop = !isLoading && cats.length > 2 && halfWidth > containerW + 16;

  const onPrev = useCallback(() => setDir("reverse"), []);
  const onNext = useCallback(() => setDir("normal"), []);

  return (
    <Section id={id} aria-busy={!!isLoading}>
      <Header>{title}</Header>

      {/* ====== Kategori Kartları — Sonsuz Döngü ====== */}
      {isLoading && cats.length === 0 && (
        <CarouselShell $loop={false}>
          <StaticBar>
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkel key={i} />
            ))}
          </StaticBar>
        </CarouselShell>
      )}

      {!isLoading && cats.length > 0 && (
        <CarouselShell
          ref={shellRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          $loop={shouldLoop}
          role="region"
          aria-label="Category carousel"
        >
          {shouldLoop && <FadeEdgeXLeft />}
          {shouldLoop && <FadeEdgeXRight />}

          {shouldLoop && (
            <NavBtn aria-label="Prev" $side="left" onClick={onPrev}>
              <MdArrowBackIosSVG viewBox="0 0 24 24"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></MdArrowBackIosSVG>
            </NavBtn>
          )}

          <Window>
            <Track
              $animate={shouldLoop}
              $duration={durationSec}
              $paused={paused}
              $dir={dir}
              style={{ ["--halfWidth" as any]: `${halfWidth}px` }}
            >
              <TrackInner ref={firstTrackRef}>
                {cats.map((c, idx) => (
                  <CatCard key={`a-${c.id}-${idx}`} href={c.href || "#"} tabIndex={0}>
                    <Thumb>
                      <Image src={c.image} alt={c.title} layout="fill" objectFit="cover" />
                    </Thumb>
                    <Label title={c.title}>{c.title}</Label>
                  </CatCard>
                ))}
              </TrackInner>

              {/* ikinci kopya → kesintisiz akış */}
              {shouldLoop && (
                <TrackInner aria-hidden>
                  {cats.map((c, idx) => (
                    <CatCard key={`b-${c.id}-${idx}`} href={c.href || "#"} tabIndex={-1}>
                      <Thumb>
                        <Image src={c.image} alt="" layout="fill" objectFit="cover" />
                      </Thumb>
                      <Label>{c.title}</Label>
                    </CatCard>
                  ))}
                </TrackInner>
              )}
            </Track>
          </Window>

          {shouldLoop && (
            <NavBtn aria-label="Next" $side="right" onClick={onNext}>
              <MdArrowForwardIosSVG viewBox="0 0 24 24"><path d="m8.59 16.59 1.41 1.41 6-6-6-6-1.41 1.41L13.17 12z"/></MdArrowForwardIosSVG>
            </NavBtn>
          )}
        </CarouselShell>
      )}

      {/* ====== Eski ürün grid’i (dokunmadık) ====== */}
      {isLoading && (
        <Grid>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skel key={i} />
          ))}
        </Grid>
      )}

      {!isLoading && list.length === 0 && <Empty>∅</Empty>}

      {!isLoading && list.length > 0 && (
        <Grid>
          {list.map((m, i) => (
            <ItemCard
              key={m?._id ?? m?.code ?? m?.slug ?? i}
              item={m}
              lang={lang}
              t={tr}
            />
          ))}
        </Grid>
      )}
    </Section>
  );
}

/* ================= styles ================= */

const Section = styled.section`
  margin: 18px 0;
`;

const Header = styled.h2`
  font-size: 18px;
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.title};
`;

/* ---------- Carousel Styles ---------- */

const marquee = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(calc(-1 * var(--halfWidth))); }
`;

const CarouselShell = styled.div<{ $loop: boolean }>`
  position: relative;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 12px ${({ $loop}) => ($loop ? 56 : 12)}px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 14px;
`;

const StaticBar = styled.div`
  display: flex;
  gap: 14px;
  width: 100%;
  overflow: hidden;
`;

const Window = styled.div`
  width: 100%;
  overflow: hidden;
`;

const Track = styled.div<{
  $animate: boolean;
  $duration: number;
  $paused: boolean;
  $dir: "normal" | "reverse";
}>`
  --halfWidth: 1200px;
  display: inline-flex;
  gap: 16px;
  align-items: center;
  will-change: transform;

  ${({ $animate, $duration, $paused, $dir }) =>
    $animate
      ? css`
          animation: ${marquee} ${$duration}s linear infinite;
          animation-direction: ${$dir};
          animation-play-state: ${$paused ? "paused" : "running"};
        `
      : css`
          animation: none;
        `}
`;

const TrackInner = styled.div`
  display: inline-flex;
  gap: 16px;
  align-items: center;
`;

const CatCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: clamp(180px, 22vw, 240px);
  height: 120px;

  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1.5px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 0 2px 14px 0 rgba(40, 117, 194, 0.07);

  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const Thumb = styled.div`
  position: relative;
  width: 56px;
  height: 56px;
  margin-bottom: 6px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    image-rendering: -webkit-optimize-contrast;
  }
`;

const Label = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FadeEdgeXLeft = styled.div`
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 56px;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.backgroundSecondary} 0%,
    transparent 100%
  );
  z-index: 1;
`;
const FadeEdgeXRight = styled(FadeEdgeXLeft)`
  left: auto; right: 0;
  transform: scaleX(-1);
`;

const NavBtn = styled.button<{ $side?: "left" | "right" }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => $side === "left" && css`left: 8px;`}
  ${({ $side }) => $side === "right" && css`right: 8px;`}
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.circle};
  width: 44px; height: 44px;
  display: grid; place-items: center;
  box-shadow: 0 2px 10px 0 ${({ theme }) => theme.colors.primaryTransparent};
  cursor: pointer;
  z-index: 2;
  transition: background 0.16s, color 0.14s, box-shadow 0.16s, border 0.16s;
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
    box-shadow: 0 6px 24px 0 ${({ theme }) => theme.colors.primaryTransparent};
    border-color: ${({ theme }) => theme.colors.primary};
    opacity: ${({ theme }) => theme.opacity.hover};
  }
`;

/* inline svg ikonlar (react-icons yerine hafif) */
const MdArrowBackIosSVG = styled.svg`
  width: 22px; height: 22px; fill: currentColor;
`;
const MdArrowForwardIosSVG = styled.svg`
  width: 22px; height: 22px; fill: currentColor;
`;

/* ---------- Grid (eski) ---------- */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 14px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Skel = styled.div`
  height: 140px;
  background: ${({ theme }) => theme.colors.skeleton};
  border-radius: 10px;
`;

const CardSkel = styled(Skel)`
  width: clamp(180px, 22vw, 240px);
  height: 120px;
`;

const Empty = styled.div`
  opacity: 0.6;
  padding: 12px 0;
`;

"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styled, { css, keyframes } from "styled-components";
import Link from "next/link";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { getMultiLang } from "@/types/common";
import type { SupportedLocale } from "@/types/common";
import type { IMenuCategory } from "@/modules/menu/types/menucategory";

type CatRef = { category: string; order?: number; isFeatured?: boolean };

type Props = {
  categories: CatRef[];
  catDict: Map<string, IMenuCategory>;
  t: (k: string, d?: string) => string;
  lang: SupportedLocale;
  isLoading?: boolean;
  /** id -> anchor eşlemesi. (Opsiyonel, route kullanıyoruz.) */
  anchorMap?: Map<string, string>;
  /** /menu/category/:slug sayfasına branch query’si ile gitmek için (opsiyonel) */
  branchId?: string;
  /** px/sn – küçük ekranda otomatik biraz düşürülür */
  speed?: number;
};

export default function CategoryNav({
  categories,
  catDict,
  lang,
  isLoading,
  branchId,
  speed = 120, // 🔼 default hız artırıldı
}: Props) {
  /* --- veri: label + href (ham liste) --- */
  const rawCats = useMemo(() => {
    return (categories || []).map((c) => {
      const id = String(c.category);
      const obj = catDict.get(id);

      const label = obj
        ? getMultiLang(obj.name as any, lang) || obj.slug || obj.code || id
        : id;

      // ✅ Kategori sayfasına git: slug varsa onu kullan, yoksa _id
      const targetSlug = (obj?.slug || "").trim() ? String(obj!.slug) : id;

      // (Opsiyonel) anchorMap yine de tutuluyor ama route öncelikli
    

      const href =
        branchId
          ? { pathname: `/menu/category/${encodeURIComponent(targetSlug)}`, query: { branch: branchId } }
          : `/menu/category/${encodeURIComponent(targetSlug)}`;

      return { id, label, href, isFeatured: !!c.isFeatured };
    });
  }, [categories, catDict, lang, branchId]);

  /* --- mükerrerleri ele (id + pathname + query signature) --- */
  const baseCats = useMemo(() => {
    const sig = (href: any) =>
      typeof href === "string"
        ? href
        : `${href?.pathname || ""}?${href?.query ? JSON.stringify(href.query) : ""}`;
    const seen = new Set<string>();
    const out: typeof rawCats = [];
    for (const c of rawCats) {
      const key = `${c.id}|${sig(c.href)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
    return out;
  }, [rawCats]);

  /* --- ölçüm --- */
  const shellRef = useRef<HTMLDivElement>(null);
  const firstTrackRef = useRef<HTMLDivElement>(null);
  const [halfWidth, setHalfWidth] = useState(0);
  const [containerW, setContainerW] = useState(0);

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
  }, [baseCats]);

  /* --- autoplay & yön --- */
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState<"normal" | "reverse">("normal");

  const effectiveSpeed = useMemo(() => {
    if (typeof window === "undefined") return speed;
    // küçük ekranda biraz yavaşlat
    return window.innerWidth < 700 ? Math.max(50, speed * 0.75) : speed;
  }, [speed]);

  const durationSec = useMemo(() => {
    if (!halfWidth || !effectiveSpeed) return 12; // 🔼 default süre kısaldı
    // süre = mesafe / hız
    return Math.max(6, halfWidth / effectiveSpeed);
  }, [halfWidth, effectiveSpeed]);

  // içerik konteyneri aşarsa loop
  const shouldLoop =
    !isLoading && halfWidth > containerW + 16 && baseCats.length > 2;

  const onPrev = useCallback(() => setDir("reverse"), []);
  const onNext = useCallback(() => setDir("normal"), []);

  return (
    <CarouselShell
      ref={shellRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="navigation"
      aria-label="Categories"
      $loop={shouldLoop}
    >
      {shouldLoop && (
        <>
          <FadeEdgeXLeft />
          <FadeEdgeXRight />
        </>
      )}

      {shouldLoop && (
        <NavBtn aria-label="Prev" $side="left" onClick={onPrev}>
          <MdArrowBackIos size={22} />
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
            {baseCats.map((c, idx) => (
              <Pill key={`a-${c.id}-${idx}`} href={c.href as any} prefetch>
                {c.label}
                {c.isFeatured && <span className="feat">★</span>}
              </Pill>
            ))}
          </TrackInner>

          {/* ikinci kopya: sadece loop’ta görünür */}
          {shouldLoop && (
            <TrackInner aria-hidden>
              {baseCats.map((c, idx) => (
                <Pill key={`b-${c.id}-${idx}`} href={c.href as any} tabIndex={-1} prefetch>
                  {c.label}
                  {c.isFeatured && <span className="feat">★</span>}
                </Pill>
              ))}
            </TrackInner>
          )}
        </Track>
      </Window>

      {shouldLoop && (
        <NavBtn aria-label="Next" $side="right" onClick={onNext}>
          <MdArrowForwardIos size={22} />
        </NavBtn>
      )}
    </CarouselShell>
  );
}

/* ================= styles ================= */

const BarBase = css`
  display: flex;
  gap: 10px;
  overflow: auto;
  padding: 10px 0;
`;
const PillBase = css`
  white-space: nowrap;
  border: 1px solid ${({ theme }) => theme.colors.borderHighlight};
  border-radius: 999px;
  padding: 10px 16px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.darkColor};
  background: ${({ theme }) => theme.colors.white};
  transition: transform 0.12s ease, background 0.12s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  .feat {
    margin-left: 6px;
    opacity: 0.8;
  }
`;

/* ---- marquee ---- */
const marquee = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(calc(-1 * var(--halfWidth))); }
`;

const CarouselShell = styled.div<{ $loop: boolean }>`
  position: relative;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 8px ${({ $loop }) => ($loop ? 56 : 8)}px; /* butonlar için boşluk */
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  /* loop yoksa klasik bar görünümü */
  ${({ $loop }) =>
    !$loop &&
    css`
      ${BarBase}
      a {
        ${PillBase}
      }
    `}
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
  --halfWidth: 1200px; /* JS ile güncellenir */
  display: inline-flex;
  gap: 12px;
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
          animation: none; /* static */
        `}
`;

const TrackInner = styled.div`
  display: inline-flex;
  gap: 12px;
  align-items: center;
`;

const Pill = styled(Link)`
  ${PillBase};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* içerik genişliği */
  min-width: clamp(140px, 22ch, 280px);
  max-width: 360px;

  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FadeEdgeXLeft = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 48px;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.backgroundSecondary} 0%,
    transparent 100%
  );
`;
const FadeEdgeXRight = styled(FadeEdgeXLeft)`
  left: auto;
  right: 0;
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
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  box-shadow: 0 2px 10px 0 ${({ theme }) => theme.colors.primaryTransparent};
  cursor: pointer;
  z-index: 2;
  transition: background 0.16s, color 0.14s, box-shadow 0.16s, border 0.16s;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
    box-shadow: 0 6px 24px 0 ${({ theme }) => theme.colors.primaryTransparent};
    border-color: ${({ theme }) => theme.colors.primary};
    opacity: ${({ theme }) => theme.opacity.hover};
  }
`;

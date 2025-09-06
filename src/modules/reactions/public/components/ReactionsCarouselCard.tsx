"use client";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { MdFavorite, MdBookmark, MdThumbUp, MdStarRate } from "react-icons/md";

import type { SupportedLocale } from "@/types/common";
import { getMultiLang } from "@/types/common";
import type { IMenuItem } from "@/modules/menu/types/menuitem";
import type { IMyReactionItem } from "@/modules/reactions/types";

import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/reactions/locales";
import { useEffect } from "react";

const normId = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if ((v as any).$oid) return String((v as any).$oid);
    if ((v as any)._id) return String((v as any)._id);
  }
  return String(v);
};

const titleFor = (item: IMenuItem, lang: SupportedLocale) =>
  getMultiLang(item?.name as any, lang) || item?.slug || item?.code || "";

const descFor = (item: IMenuItem, lang: SupportedLocale) =>
  getMultiLang(item?.description as any, lang) || "";

const hrefFor = (item: IMenuItem) =>
  `/menu/item/${encodeURIComponent(item.slug || item.code || normId((item as any)._id))}`;

const buildBadges = (myAll: IMyReactionItem[], targetId: string) => {
  const mine = (myAll || []).filter((r) => normId(r.targetId) === targetId);
  const emojis = new Set<string>();
  let like = false,
    fav = false,
    save = false;
  let rating: number | null = null;

  for (const r of mine) {
    if (r.kind === "LIKE") like = true;
    else if (r.kind === "FAVORITE") fav = true;
    else if (r.kind === "BOOKMARK") save = true;
    else if (r.kind === "EMOJI" && r.emoji) emojis.add(r.emoji);
    else if (r.kind === "RATING" && typeof r.value === "number") rating = r.value;
  }
  return { like, fav, save, emojis: Array.from(emojis), rating };
};

/* ---------- component ---------- */
export default function ReactionsCarouselCard({
  item,
  lang,
  myAll,
}: {
  item: IMenuItem;
  lang: SupportedLocale;
  myAll: IMyReactionItem[];
}) {
  const { t } = useI18nNamespace("reactions", translations);

  useEffect(() => {
    const handleResize = () => {};
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const id = normId((item as any)._id) || item.slug || item.code;
  const badges = buildBadges(myAll, id);
  const img = item?.images?.[0];
  const ttl = titleFor(item, lang);
  const dsc = descFor(item, lang);
  const href = hrefFor(item);

  return (
    <Card href={href}>
      <Thumb>
        {img?.thumbnail || img?.webp || img?.url ? (
          <Image
            src={img.thumbnail || img.webp || img.url}
            alt={ttl || "item"}
            fill
            sizes="(max-width: 700px) 94vw, 360px"
            style={{ objectFit: "cover" }}
            priority={false}
          />
        ) : (
          <Ph aria-hidden>🍽️</Ph>
        )}

        <Badges>
          {badges.like && (
            <Badge title={t("public.badge.like", "Beğendin")}>
              <MdThumbUp />
            </Badge>
          )}
          {badges.fav && (
            <Badge title={t("public.badge.favorite", "Favoriledin")}>
              <MdFavorite />
            </Badge>
          )}
          {badges.save && (
            <Badge title={t("public.badge.bookmark", "Kaydettin")}>
              <MdBookmark />
            </Badge>
          )}
          {typeof badges.rating === "number" && (
            <Rate title={t("public.badge.rating", { value: badges.rating })}>
              <MdStarRate />
              <strong>{badges.rating.toFixed(1)}</strong>
            </Rate>
          )}
          {badges.emojis.slice(0, 3).map((e) => (
            <Emoji key={e} title={t("public.badge.emoji", { emoji: e })}>
              {e}
            </Emoji>
          ))}
          {badges.emojis.length > 3 && (
            <Emoji title={t("public.badge.more", "Daha fazla")}>
              +{badges.emojis.length - 3}
            </Emoji>
          )}
        </Badges>
      </Thumb>

      <Body>
        <ItemTitle title={ttl}>{ttl}</ItemTitle>
        {!!dsc && <ItemDesc>{dsc}</ItemDesc>}
      </Body>
    </Card>
  );
}

/* ---------- styles (card) ---------- */

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  gap: 10px;

  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  text-decoration: none;
  color: inherit;

  /* perf & interaction */
  transform: translateZ(0);
  contain: layout paint;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.border};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Thumb = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  background: #f4f6f8;
  overflow: hidden;

  /* next/image wrapper spans */
  & > span {
    position: absolute !important;
    inset: 0 !important;
  }

  /* subtle overlay to improve badge/text contrast */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0));
  }
`;

const Ph = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: clamp(42px, 18vw, 100px);
  line-height: 1;
  color: #c8c8c8;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.08);
`;

const Badges = styled.div`
  position: absolute;
  left: 8px;
  bottom: 8px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  z-index: 2;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 12px;
  line-height: 1;

  /* better readability on photos */
  background: rgba(255, 255, 255, 0.85);
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  backdrop-filter: saturate(140%) blur(4px);

  svg {
    font-size: 14px;
  }
`;

const Emoji = styled(Badge)`
  font-size: 14px;
  padding: 3px 7px;
`;

const Rate = styled(Badge)`
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  strong {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
`;

const Body = styled.div`
  padding: 12px 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ItemTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 15px;
  line-height: 1.28;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemDesc = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.35;
  opacity: 0.85;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

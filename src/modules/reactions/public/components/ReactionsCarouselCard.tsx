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

/* helpers */
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
  let like = false, fav = false, save = false;
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

  const id = normId((item as any)._id) || item.slug || item.code;
  const badges = buildBadges(myAll, id);
  const img = item?.images?.[0];
  const ttl = titleFor(item, lang);
  const dsc = descFor(item, lang);
  const href = hrefFor(item);

  return (
    <Card as={Link} href={href}>
      <Thumb>
        {img?.thumbnail || img?.webp || img?.url ? (
          <Image
            src={img.thumbnail || img.webp || img.url}
            alt={ttl || "item"}
            fill
            sizes="(max-width: 600px) 85vw, 320px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Ph aria-hidden>—</Ph>
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
              <MdStarRate /> {badges.rating.toFixed(1)}
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
        {dsc && <ItemDesc>{dsc}</ItemDesc>}
      </Body>
    </Card>
  );
}
/* ------- styles (kart) ------- */

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  width: clamp(240px, 38vw, 320px);
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1.5px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: 0 2px 14px 0 rgba(40, 117, 194, 0.07);
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const Thumb = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const Ph = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #aaa;
`;

const Badges = styled.div`
  position: absolute;
  left: 8px;
  bottom: 8px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 4px 8px;
  font-size: 12px;
`;

const Emoji = styled(Badge)`
  font-size: 14px;
  padding: 3px 7px;
`;
const Rate = styled(Badge)`
  font-weight: 700;
`;

const Body = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ItemTitle = styled.h3`
  font-size: 15px;
  margin: 0;
  line-height: 1.28;
  color: ${({ theme }) => theme.colors.primary};
`;

const ItemDesc = styled.p`
  font-size: 12px;
  opacity: 0.85;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

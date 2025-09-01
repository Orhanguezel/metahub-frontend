"use client";

import styled from "styled-components";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { getMultiLang } from "@/types/common";
import type { SupportedLocale } from "@/types/common";
import type { IMenuItem, PriceChannel } from "@/modules/menu/types/menuitem";
import { findMinBasePrice } from "./utils/pricing";
import slugify from "@/lib/slug";
import { getLabelFor } from "@/modules/menu/constants/foodLabels";
import { useMenuitemReactions } from "@/hooks/useMenuitemReactions";

type Props = {
  item: IMenuItem;
  lang: SupportedLocale;
  t: (k: string, d?: string) => string;
  branchId?: string;
  channel?: PriceChannel;
};

export default function ItemCard({
  item,
  lang,
  t,
  branchId,
  channel = "delivery",
}: Props) {
  const title = useMemo(
    () =>
      getMultiLang(item?.name as any, lang) ||
      item?.slug ||
      item?.code ||
      "",
    [item, lang]
  );

  const desc = useMemo(
    () => getMultiLang(item?.description as any, lang) || "",
    [item, lang]
  );

  const img = item?.images?.[0];

  const price = useMemo(() => findMinBasePrice(item, channel), [item, channel]);

  const priceText =
    price &&
    new Intl.NumberFormat(lang, {
      style: "currency",
      currency: price.currency || "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price.amount);

  // URL parçası
  const slugPart =
    item.slug ?? (item.code ? item.code : slugify(title || (item as any)?._id || ""));
  const base = `/menu/item/${encodeURIComponent(slugPart)}`;
  const href = branchId ? `${base}?branch=${encodeURIComponent(branchId)}` : base;

  // 🔗 reactions
  const { summary } = useMenuitemReactions(String((item as any)._id || ""));

  return (
    <Card role="group" aria-label={title}>
      <Link href={href} aria-label={title} style={{ textDecoration: "none" }}>
        <Thumb title={title}>
          {img?.thumbnail || img?.webp || img?.url ? (
            <Image
              src={img.thumbnail || img.webp || img.url}
              alt={title || "item"}
              fill
              sizes="(max-width: 600px) 100vw, 33vw"
              style={{ objectFit: "cover" }}
              priority={false}
            />
          ) : (
            <Ph aria-hidden>—</Ph>
          )}
        </Thumb>
      </Link>

      <Body>
        <h3 title={title}>{title}</h3>
        {desc && <p className="desc">{desc}</p>}

        <Meta>
          {price ? (
            <span className="price">
              {t("fromPrice", "Başlangıç:")} {priceText}
            </span>
          ) : (
            <span className="muted">{t("noPrice", "Fiyat bilgisi yok")}</span>
          )}
          <DetailsLink href={href}>{t("details", "Detaylar")}</DetailsLink>
        </Meta>

        {/* mini reactions */}
        <RxMini>
          <span title={t("likes", "Beğeni")}>👍 {summary.likes}</span>
          <span title={t("favorites", "Favori")}>❤️ {summary.favorites}</span>
          <span title={t("bookmarks", "Kaydet")}>🔖 {summary.bookmarks}</span>
          {summary.ratingAvg != null && (
            <span title={t("rating", "Puan")}>
              ⭐ {summary.ratingAvg.toFixed(1)} ({summary.ratingCount})
            </span>
          )}
        </RxMini>

        {(item.allergens?.length || item.additives?.length) && (
          <FoodMeta role="note" aria-label="allergen-additive">
            {item.allergens?.length ? (
              <MetaGroup>
                <small className="label">{t("allergens", "Alerjenler")}:</small>
                <ChipRow>
                  {item.allergens.slice(0, 3).map((a) => {
                    const code = String(a.key).toUpperCase();
                    const titleText =
                      getMultiLang(a.value as any, lang) ||
                      getLabelFor("allergens", a.key, lang);
                    return (
                      <MiniChip key={`alg-${code}`} title={titleText}>
                        {code}
                      </MiniChip>
                    );
                  })}
                  {item.allergens.length > 3 && (
                    <MiniChip title={t("more", "Daha fazla")} aria-label="more">
                      +{item.allergens.length - 3}
                    </MiniChip>
                  )}
                </ChipRow>
              </MetaGroup>
            ) : null}

            {item.additives?.length ? (
              <MetaGroup>
                <small className="label">{t("additives", "Katkılar")}:</small>
                <ChipRow>
                  {item.additives.slice(0, 3).map((a) => {
                    const code = String(a.key);
                    const titleText =
                      getMultiLang(a.value as any, lang) ||
                      getLabelFor("additives", a.key, lang);
                    return (
                      <MiniChip key={`add-${code}`} title={titleText}>
                        {code}
                      </MiniChip>
                    );
                  })}
                  {item.additives.length > 3 && (
                    <MiniChip title={t("more", "Daha fazla")} aria-label="more">
                      +{item.additives.length - 3}
                    </MiniChip>
                  )}
                </ChipRow>
              </MetaGroup>
            ) : null}
          </FoodMeta>
        )}
      </Body>
    </Card>
  );
}

/* styled */
const Card = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.cardBackground};
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.cards.shadow};
  transition: transform .12s ease, box-shadow .12s ease;
  &:hover { transform: translateY(-2px); box-shadow: ${({ theme }) => theme.shadows.md}; }
`;

const Thumb = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  background: #fafafa;
  cursor: pointer;
`;

const Ph = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #aaa;
`;

const Body = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: ${({ theme }) => theme.colors.text};

  h3 {
    font-size: 14px;
    margin: 0;
    line-height: 1.3;
    color: ${({ theme }) => theme.colors.text};
  }

  .desc {
    font-size: 12px;
    opacity: .85;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const Meta = styled.div`
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  .price { font-weight: 700; color: ${({ theme }) => theme.colors.secondary}; }
  .muted { opacity: .6; }
`;

const DetailsLink = styled(Link)`
  padding: 6px 10px;
  border-radius: 10px;
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor: pointer;
  text-decoration: none;
`;

const RxMini = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xs};
  display: flex;
  gap: ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* --- subtle food meta (not focus) --- */
const FoodMeta = styled.div`
  margin-top: 6px;
  display: grid;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: .9;
`;
const MetaGroup = styled.div`
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  .label { opacity: .8; }
`;
const ChipRow = styled.div`
  display: inline-flex; gap: 4px; flex-wrap: wrap;
`;
const MiniChip = styled.span`
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 6px; border-radius: 999px;
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  font-size: 10px; line-height: 1; color: ${({ theme }) => theme.colors.text};
`;

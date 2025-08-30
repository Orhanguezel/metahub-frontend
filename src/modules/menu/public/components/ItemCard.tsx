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

  // URL parçası:
  // - slug varsa onu kullan
  // - yoksa code varsa AYNI haliyle kullan (by-code fallback)
  // - hiçbiri yoksa başlıktan slug üret
  const slugPart = item.slug ?? (item.code ? item.code : slugify(title || item._id || ""));

  // ✅ Detay route: /menu/item/[slug]
  const base = `/menu/item/${encodeURIComponent(slugPart)}`;
  const href = branchId ? `${base}?branch=${encodeURIComponent(branchId)}` : base;

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

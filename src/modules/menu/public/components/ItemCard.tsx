"use client";
import styled from "styled-components";
import Image from "next/image";
import { getMultiLang } from "@/types/common";
import type { SupportedLocale } from "@/types/common";
import { findMinBasePrice } from "./utils/pricing";

type Props = {
  item: any;
  lang: SupportedLocale;
  t: (k: string, d?: string) => string;
  branchId?: string;
  channel?: "delivery" | "pickup" | "dinein";
};

export default function ItemCard({
  item,
  lang,
  t,
  branchId: _branchId,
  channel: _channel,
}: Props) {
  // (şimdilik kullanılmıyorlar)
  void _branchId; void _channel;

  const title = getMultiLang(item?.name as any, lang) || item?.slug || item?.code || "";
  const desc  = getMultiLang(item?.description as any, lang) || "";
  const img   = item?.images?.[0];

  // util tek argüman alıyor
  const price = findMinBasePrice(item as any);

  const priceText =
    price &&
    new Intl.NumberFormat(lang, {
      style: "currency",
      currency: price.currency || "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price.amount);

  return (
    <Card>
      <Thumb>
        {img?.thumbnail || img?.webp || img?.url ? (
          <Image
            src={img.thumbnail || img.webp || img.url}
            alt={title || "item"}
            fill
            sizes="(max-width: 600px) 100vw, 33vw"
            style={{ objectFit: "cover" }}
            priority={false}
          />
        ) : <Ph aria-hidden>—</Ph>}
      </Thumb>

      <Body>
        <h3 title={title}>{title}</h3>
        {desc && <p className="desc">{desc}</p>}
        <div className="meta">
          {price ? (
            <span className="price">{t("fromPrice", "Başlangıç:")} {priceText}</span>
          ) : (
            <span className="muted">{t("noPrice", "Fiyat bilgisi yok")}</span>
          )}
        </div>
      </Body>
    </Card>
  );
}

const Card = styled.article`
  border:1px solid #eee;border-radius:12px;overflow:hidden;background:#fff;display:flex;flex-direction:column;
`;
const Thumb = styled.div`position:relative;aspect-ratio:16/9;background:#fafafa;`;
const Ph = styled.div`position:absolute;inset:0;display:grid;place-items:center;color:#aaa;`;
const Body = styled.div`
  padding:10px;display:flex;flex-direction:column;gap:6px;
  h3{font-size:14px;margin:0;line-height:1.3;}
  .desc{font-size:12px;opacity:.85;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
  .meta{display:flex;justify-content:space-between;align-items:center;}
  .price{font-weight:600;}
  .muted{opacity:.6;}
`;

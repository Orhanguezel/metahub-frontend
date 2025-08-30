"use client";

import styled from "styled-components";
import Image from "next/image";
import { useMemo, useState } from "react";
import { getMultiLang } from "@/types/common";
import type { SupportedLocale } from "@/types/common";
import type {
  IMenuItem,
  IMenuItemVariant,
  IMenuItemModifierGroup,
  IMenuItemModifierOption,
  PriceChannel,
} from "@/modules/menu/types/menuitem";
import AddToCartButton from "@/shared/AddToCartButton";
import {
  findMinBasePrice,
  formatMoney,
  getVariantBasePrice,
  getOptionBasePrice,
} from "./utils/pricing";

type Props = {
  item: IMenuItem;
  lang: SupportedLocale;
  t: (k: string, d?: string) => string;
  branchId?: string;
  channel?: PriceChannel;
};

export default function MenuItemDetail({
  item,
  lang,
  t,
  branchId,
  channel = "delivery",
}: Props) {
  const tl = (k: string, d?: string) => t(`labels.${k}`, d);

  // ---- default variant
  const defaultVariant = useMemo<IMenuItemVariant | undefined>(() => {
    const list = Array.isArray(item.variants) ? item.variants : [];
    return list.find((v) => v.isDefault) || list[0];
  }, [item.variants]);

  const [variantCode, setVariantCode] = useState<string | undefined>(defaultVariant?.code);
  const [qty, setQty] = useState(1);
  const [mods, setMods] = useState<Record<string, string[]>>({});

  // groups (sorted by order)
  const groups = useMemo<IMenuItemModifierGroup[]>(
    () =>
      [...(item.modifierGroups || [])].sort(
        (a, b) => (a.order ?? 1e9) - (b.order ?? 1e9)
      ),
    [item.modifierGroups]
  );

  const currentVariant: IMenuItemVariant | undefined = useMemo(
    () => (item.variants || []).find((v) => v.code === variantCode) || defaultVariant,
    [item.variants, variantCode, defaultVariant]
  );

  const priceCtx = useMemo(() => ({ outlet: branchId || null, when: new Date() }), [branchId]);

  const basePrice = useMemo(
    () =>
      currentVariant
        ? getVariantBasePrice(currentVariant, channel, priceCtx)
        : findMinBasePrice(item, channel, priceCtx),
    [currentVariant, item, channel, priceCtx]
  );

  // opsiyon toplamı
  const optionsTotal = useMemo(() => {
    let sum = 0;
    for (const g of groups) {
      const picked = mods[g.code] || [];
      for (const code of picked) {
        const opt = (g.options || []).find((o) => o.code === code);
        const p = opt ? getOptionBasePrice(opt, channel, priceCtx) : null;
        if (p?.amount != null) sum += Number(p.amount);
      }
    }
    return sum;
  }, [groups, mods, channel, priceCtx]);

  const totalEach = (basePrice?.amount || 0) + optionsTotal;
  const total = totalEach * qty;

  const canSubmit = useMemo(() => {
    for (const g of groups) {
      const picked = mods[g.code] || [];
      const count = picked.length;
      if (g.isRequired && (g.minSelect ?? 0) <= 0 && count === 0) return false;
      if (typeof g.minSelect === "number" && count < g.minSelect) return false;
      if (typeof g.maxSelect === "number" && count > g.maxSelect) return false;
    }
    return !!currentVariant && qty > 0 && !!basePrice;
  }, [groups, mods, qty, currentVariant, basePrice]);

  const title = getMultiLang(item.name as any, lang) || item.slug || item.code;
  const desc = getMultiLang(item.description as any, lang) || "";
  const img = item.images?.[0];

  const toggleOption = (g: IMenuItemModifierGroup, option: IMenuItemModifierOption) => {
    setMods((prev) => {
      const prevArr = prev[g.code] || [];
      const exists = prevArr.includes(option.code);
      let nextArr: string[] = prevArr;

      const max = typeof g.maxSelect === "number" ? g.maxSelect : undefined;

      if (!exists) {
        nextArr = max ? [...prevArr, option.code].slice(0, max) : [...prevArr, option.code];
      } else {
        nextArr = prevArr.filter((c) => c !== option.code);
      }
      return { ...prev, [g.code]: nextArr };
    });
  };

  const dietTags = [
    item.dietary?.vegetarian ? "🥦 Veg" : null,
    item.dietary?.vegan ? "🌱 Vegan" : null,
    item.dietary?.halal ? "🕌 Halal" : null,
    item.dietary?.glutenFree ? "🚫🌾 GF" : null,
  ].filter(Boolean) as string[];

  const catLabel = useMemo(() => {
    const c: any = item?.categories?.[0]?.category;
    if (!c) return null;
    if (typeof c === "string") return c;
    return getMultiLang(c?.name as any, lang) || c?.slug || c?.code || c?._id || null;
  }, [item?.categories, lang]);


  return (
    <PageWrap>
      <HeadRow>
        <Title>{title}</Title>
        <Actions>
          <span aria-label="rating">⭐⭐⭐⭐☆</span>
          <SmallText>({tl("reviews", "5 reviews")})</SmallText>
          <IconBtn title={t("favorite", "Favori")}>❤️</IconBtn>
          <IconBtn title={t("share", "Paylaş")}>↗</IconBtn>
        </Actions>
      </HeadRow>
      {desc ? <Lead>{desc}</Lead> : null}

      <Grid>
        <LeftCol>
          <Hero>
            {img?.thumbnail || img?.webp || img?.url ? (
              <Image
                src={img.thumbnail || img.webp || img.url}
                alt={title}
                fill
                sizes="(max-width: 1200px) 100vw, 720px"
                style={{ objectFit: "cover" }}
                priority={false}
              />
            ) : (
              <Ph aria-hidden>—</Ph>
            )}
          </Hero>

          {Array.isArray(item.variants) && item.variants.length > 0 && (
            <Block>
              <BlockTitle>{tl("variant", "Boyut / Varyant")}</BlockTitle>
              <VarGrid>
                {item.variants
                  .slice()
                  .sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9))
                  .map((v) => {
                    const vName = getMultiLang(v.name as any, lang) || v.code;
                    const p = getVariantBasePrice(v, channel, priceCtx);
                    const active = variantCode === v.code;
                    return (
                      <VarBtn
                        key={v.code}
                        $active={active}
                        onClick={() => setVariantCode(v.code)}
                        type="button"
                        title={vName}
                      >
                        <span className="v-title">{vName}</span>
                        <span className="v-price">
                          {p ? formatMoney(p, lang) : t("noPrice", "—")}
                        </span>
                      </VarBtn>
                    );
                  })}
              </VarGrid>
            </Block>
          )}

          {groups.length > 0 && (
            <Block>
              <BlockTitle>{tl("extras", "İlave / Seçenekler")}</BlockTitle>
              <Groups>
                {groups.map((g) => {
                  const picked = mods[g.code] || [];
                  return (
                    <Group key={g.code}>
                      <GHead>
                        <strong>{getMultiLang(g.name as any, lang) || g.code}</strong>
                        <small className="soft">
                          {[
                            g.isRequired ? t("required", "zorunlu") : "",
                            typeof g.minSelect === "number" ? `min ${g.minSelect}` : "",
                            typeof g.maxSelect === "number" ? `max ${g.maxSelect}` : "",
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </small>
                      </GHead>
                      <Options>
                        {g.options
                          .slice()
                          .sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9))
                          .map((o) => {
                            const label = getMultiLang(o.name as any, lang) || o.code;
                            const p = getOptionBasePrice(o, channel, priceCtx);
                            const on = picked.includes(o.code);
                            return (
                              <Opt key={o.code} $active={on}>
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={on}
                                    onChange={() => toggleOption(g, o)}
                                  />
                                  <span>{label}</span>
                                  <em>{p ? `+ ${formatMoney(p, lang)}` : ""}</em>
                                </label>
                              </Opt>
                            );
                          })}
                      </Options>
                    </Group>
                  );
                })}
              </Groups>
            </Block>
          )}
        </LeftCol>

        <RightCol>
          <SideCard>
            <SmallLabel>{tl("price", "Fiyat")}</SmallLabel>
            <BigPrice>{basePrice ? formatMoney(basePrice, lang) : t("noPrice", "—")}</BigPrice>

            {dietTags.length > 0 && (
              <DietRow>{dietTags.map((d, i) => <Diet key={i}>{d}</Diet>)}</DietRow>
            )}

            <Controls>
              <Qty>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={t("decrease", "Azalt")}>
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                />
                <button onClick={() => setQty((q) => q + 1)} aria-label={t("increase", "Arttır")}>
                  +
                </button>
              </Qty>

              <AddToCartButton
  productId={item._id}
  productType="menuitem"
  qty={qty}
  disabled={!canSubmit}
  menu={{
    variantCode,
    depositIncluded: true,
    modifiers: Object.entries(mods).flatMap(([groupCode, arr]) =>
      (arr || []).map((optionCode) => ({ groupCode, optionCode, quantity: 1 }))
    ),
  }}
  priceHint={basePrice ? {
    unitPrice: (basePrice?.amount || 0) + optionsTotal,
    currency: basePrice.currency,
    priceComponents: {
      base: basePrice.amount || 0,
      modifiersTotal: optionsTotal || 0,
      deposit: 0,
      currency: basePrice.currency,
    },
  } : undefined}
/>

            </Controls>

            {!canSubmit && <Hint>{tl("chooseRequired", "Lütfen zorunlu seçimleri tamamlayın.")}</Hint>}

            <TotalLine>
              <span>{tl("total", "Toplam")}:</span>
              <strong>{basePrice ? formatMoney({ ...basePrice, amount: total }, lang) : "—"}</strong>
            </TotalLine>

            {catLabel ? (
              <CatPillRow>
                <CatPill>🍔 {catLabel}</CatPill>
              </CatPillRow>
            ) : null}
          </SideCard>

          <QuickView>
            <QVTitle>{tl("quickView", "Hızlı Bakış")}</QVTitle>
            <QVGrid>
              <QVItem>🥗 {tl("freshFood", "Taze Ürün")}</QVItem>
              <QVItem>🚚 {tl("fastDelivery", "Hızlı Teslimat")}</QVItem>
            </QVGrid>
          </QuickView>
        </RightCol>
      </Grid>
    </PageWrap>
  );
}

/* styled (değişmedi) … */


/* =================== styled =================== */
const PageWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeadRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(24px, 3.2vw, 40px);
  line-height: 1.2;
`;

const Lead = styled.p`
  margin: 0 0 8px;
  opacity: 0.9;
  font-size: 16px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SmallText = styled.span`
  opacity: 0.8;
  font-size: 14px;
`;

const IconBtn = styled.button`
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: 1fr;
  }
`;

const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Hero = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;
const Ph = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #aaa;
`;

const SideCard = styled.div`
  position: sticky;
  top: 90px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SmallLabel = styled.div`
  text-transform: lowercase;
  opacity: 0.8;
  font-weight: 600;
`;

const BigPrice = styled.div`
  font-size: clamp(26px, 3vw, 34px);
  font-weight: 800;
`;

const DietRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
const Diet = styled.span`
  font-size: 12px;
  border-radius: 999px;
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
`;

const Controls = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
`;

const Qty = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  button {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.background};
    cursor: pointer;
  }
  input {
    width: 56px;
    text-align: center;
    padding: 6px 8px;
    border-radius: 10px;
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  }
`;

const Hint = styled.div`
  margin-top: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TotalLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
`;

const CatPillRow = styled.div`
  display: flex;
  gap: 8px;
`;
const CatPill = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  font-weight: 600;
`;

const QuickView = styled.div`
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 14px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const QVTitle = styled.h3`
  margin: 0 0 10px;
`;

const QVGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
  }
`;
const QVItem = styled.div`
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  font-weight: 600;
`;

/* shared blocks */
const Block = styled.section``;
const BlockTitle = styled.h4`
  margin: 0 0 8px;
`;

const VarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
`;

const VarBtn = styled.button<{ $active?: boolean }>`
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  ${({ theme, $active }) => `
    border: ${theme.borders.thin} ${$active ? theme.colors.primary : theme.colors.border};
    background: ${$active ? theme.colors.primaryLight : theme.colors.inputBackgroundLight};
  `}
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  .v-title { font-weight: 600; }
  .v-price { opacity: .85; font-size: .9em; }
`;

const Groups = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const Group = styled.div``;
const GHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  .soft { opacity: .7; }
`;
const Options = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 6px;
`;

const Opt = styled.div<{ $active?: boolean }>`
  ${({ theme, $active }) => `
    border: ${theme.borders.thin} ${$active ? theme.colors.primary : theme.colors.border};
    border-radius: 10px;
    padding: 8px 10px;
  `}
  label { display: flex; align-items: center; justify-content: space-between; gap: 8px; cursor: pointer; }
  input { margin-right: 6px; }
  em { opacity: .8; }
`;



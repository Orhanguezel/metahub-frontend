"use client";

import styled from "styled-components";
import Image from "next/image";
import { useMemo, useState, useCallback } from "react";
import { getMultiLang, type SupportedLocale } from "@/types/common";
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
import { getLabelFor } from "@/modules/menu/constants/foodLabels";
import { getUILang } from "@/i18n/getUILang";
import { buildDietChips } from "@/modules/menu/public/components/utils/buildDietChips";
import { useMenuitemReactions } from "@/hooks/useMenuitemReactions";

type Props = {
  item: IMenuItem;
  lang?: SupportedLocale; // opsiyonel: UI dili dinamik
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
  const L = useMemo<SupportedLocale>(() => getUILang(lang), [lang]);
  const tl = useCallback((k: string, d?: string) => t(`labels.${k}`, d), [t]);

  // ---- reactions
  const { summary, mine, toggle, toggleEmoji, rate } = useMenuitemReactions(
    String((item as any)._id || "")
  );
  const EMOJIS = ["👍", "🔥", "😍", "😋"];

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
    () => [...(item.modifierGroups || [])].sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9)),
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

  const title = getMultiLang(item.name as any, L) || item.slug || item.code;
  const desc = getMultiLang(item.description as any, L) || "";
  const img = item.images?.[0];

  // seçenek toggle
  const toggleOption = useCallback((g: IMenuItemModifierGroup, option: IMenuItemModifierOption) => {
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
  }, []);

  // beslenme ikonları
  const dietChips = useMemo(() => buildDietChips(item.dietary, t), [item.dietary, t]);

  const catLabel = useMemo(() => {
    const c: any = item?.categories?.[0]?.category;
    if (!c) return null;
    if (typeof c === "string") return c;
    return getMultiLang(c?.name as any, L) || c?.slug || c?.code || c?._id || null;
  }, [item?.categories, L]);

  const allergens = item.allergens ?? [];
  const additives = item.additives ?? [];
  const hasRegulatoryNotes = useMemo(
    () => (allergens.length + additives.length) > 0,
    [allergens.length, additives.length]
  );

  return (
    <PageWrap>
      <HeadRow>
        <Title>{title}</Title>
        <Actions>
          {summary.ratingAvg != null && (
            <SmallText title={t("rating", "Puan")}>
              ⭐ {summary.ratingAvg.toFixed(1)} ({summary.ratingCount})
            </SmallText>
          )}
          <RxBtn aria-pressed={mine.like} onClick={() => toggle("LIKE")} title={t("like", "Beğen")}>
            {mine.like ? "👍" : "👍🏻"}
          </RxBtn>
          <RxBtn aria-pressed={mine.favorite} onClick={() => toggle("FAVORITE")} title={t("favorite", "Favori")}>
            {mine.favorite ? "❤️" : "🤍"}
          </RxBtn>
          <RxBtn aria-pressed={mine.bookmark} onClick={() => toggle("BOOKMARK")} title={t("bookmark", "Kaydet")}>
            {mine.bookmark ? "🔖" : "📑"}
          </RxBtn>
        </Actions>
      </HeadRow>

      <RxBar>
        <div className="emojis">
          {EMOJIS.map((e) => (
            <Emoji key={e} $on={mine.emojis.has(e)} onClick={() => toggleEmoji(e)} title={`${e} ${summary.emojis[e] || 0}`}>
              <span>{e}</span>
              <small>{summary.emojis[e] || 0}</small>
            </Emoji>
          ))}
        </div>
        <Stars>
          {[1, 2, 3, 4, 5].map((v) => (
            <Star
              key={v}
              aria-pressed={mine.rating === v}
              onClick={() => rate(v as 1 | 2 | 3 | 4 | 5)}
              title={t("rate", "Puan ver")}
            >
              {(mine.rating ?? Math.round(summary.ratingAvg || 0)) >= v ? "★" : "☆"}
            </Star>
          ))}
        </Stars>
      </RxBar>

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
                {(item.variants || [])
                  .slice()
                  .sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9))
                  .map((v) => {
                    const vName = getMultiLang(v.name as any, L) || v.code;
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
                        <span className="v-price">{p ? formatMoney(p, L) : t("noPrice", "—")}</span>
                      </VarBtn>
                    );
                  })}
              </VarGrid>
            </Block>
          )}

          {/* Opsiyon grupları */}
          {groups.length > 0 && (
            <Block>
              <BlockTitle>{tl("extras", "İlave / Seçenekler")}</BlockTitle>
              <Groups>
                {groups.map((g) => {
                  const picked = mods[g.code] || [];
                  return (
                    <Group key={g.code}>
                      <GHead>
                        <strong>{getMultiLang(g.name as any, L) || g.code}</strong>
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
                        {(g.options || [])
                          .slice()
                          .sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9))
                          .map((o) => {
                            const label = getMultiLang(o.name as any, L) || o.code;
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
                                  <em>{p ? `+ ${formatMoney(p, L)}` : ""}</em>
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
            <BigPrice>{basePrice ? formatMoney(basePrice, L) : t("noPrice", "—")}</BigPrice>

            {dietChips.length > 0 && (
              <DietIconsRow>
                {dietChips.map((c) => (
                  <DietIcon key={c.key} title={c.label} aria-label={c.label}>
                    <span className="icon">{c.icon}</span>
                    <span className="txt">{c.label}</span>
                  </DietIcon>
                ))}
              </DietIconsRow>
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
                productId={(item as any)._id}
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
                priceHint={
                  basePrice
                    ? {
                        unitPrice: (basePrice?.amount || 0) + optionsTotal,
                        currency: basePrice.currency,
                        priceComponents: {
                          base: basePrice.amount || 0,
                          modifiersTotal: optionsTotal || 0,
                          deposit: 0,
                          currency: basePrice.currency,
                        },
                      }
                    : undefined
                }
              />
            </Controls>

            {!canSubmit && <Hint>{tl("chooseRequired", "Lütfen zorunlu seçimleri tamamlayın.")}</Hint>}

            <TotalLine>
              <span>{tl("total", "Toplam")}:</span>
              <strong>{basePrice ? formatMoney({ ...basePrice, amount: total }, L) : "—"}</strong>
            </TotalLine>

            {catLabel ? (
              <CatPillRow>
                <CatPill>🍔 {catLabel}</CatPill>
              </CatPillRow>
            ) : null}

            {hasRegulatoryNotes && (
              <FinePrint role="note" aria-label="allergens-additives">
                {allergens.length > 0 && (
                  <Line>
                    <b>{tl("allergens", "Alerjenler")}:</b>
                    <ChipRow>
                      {allergens.map((a, i) => {
                        const code = String(a.key).toUpperCase();
                        const titleText =
                          getMultiLang(a.value as any, L) ||
                          getLabelFor("allergens", a.key, L);
                        return (
                          <Chip key={`alg-${code}-${i}`} title={titleText} aria-label={titleText}>
                            {code}
                          </Chip>
                        );
                      })}
                    </ChipRow>
                  </Line>
                )}

                {additives.length > 0 && (
                  <Line>
                    <Dot>•</Dot>
                    <b>{tl("additives", "Katkı Maddeleri")}:</b>
                    <ChipRow>
                      {additives.map((a, i) => {
                        const code = String(a.key);
                        const titleText =
                          getMultiLang(a.value as any, L) ||
                          getLabelFor("additives", a.key, L);
                        return (
                          <Chip key={`add-${code}-${i}`} title={titleText} aria-label={titleText}>
                            {code}
                          </Chip>
                        );
                      })}
                    </ChipRow>
                  </Line>
                )}
              </FinePrint>
            )}
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

/* =================== styled (classicTheme uyumlu & responsive) =================== */
const PageWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const HeadRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.small} { align-items: center; }
`;

const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.title};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.h2};
  line-height: 1.2;
  ${({ theme }) => theme.media.small} { font-size: ${({ theme }) => theme.fontSizes.large}; }
  ${({ theme }) => theme.media.xsmall} { font-size: ${({ theme }) => theme.fontSizes.medium}; }
`;

const Lead = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacings.sm};
  opacity: 0.9;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textAlt};
  ${({ theme }) => theme.media.xsmall} { font-size: ${({ theme }) => theme.fontSizes.sm}; }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const SmallText = styled.span`
  opacity: 0.8;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const RxBtn = styled.button`
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transition.fast};
  &[aria-pressed="true"] { transform: scale(1.06); filter: saturate(1.2); }
`;

const RxBar = styled.div`
  margin: ${({ theme }) => theme.spacings.sm} 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.md};
  .emojis { display: flex; gap: ${({ theme }) => theme.spacings.sm}; flex-wrap: wrap; }
`;

const Emoji = styled.button<{ $on?: boolean }>`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 10px; border-radius: ${({ theme }) => theme.radii.pill};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme, $on }) => ($on ? theme.colors.primaryLight : theme.colors.inputBackgroundLight)};
  cursor: pointer;
  small { opacity: .8; }
`;

const Stars = styled.div`
  display: inline-flex; gap: 6px;
`;

const Star = styled.button`
  border: none; background: transparent; cursor: pointer; font-size: 20px; line-height: 1;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.small} { grid-template-columns: 1fr; }
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
  ${({ theme }) => theme.media.xsmall} { aspect-ratio: 4/3; }
`;

const Ph = styled.div`
  position: absolute; inset: 0; display: grid; place-items: center; color: #aaa;
`;

const SideCard = styled.div`
  position: sticky;
  top: 90px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.small} { position: static; }
`;

const SmallLabel = styled.div`
  text-transform: lowercase;
  opacity: 0.8;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const BigPrice = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
`;

const DietIconsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-top: 2px;
`;

const DietIcon = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  .icon { font-size: 18px; line-height: 1; }
  .txt { font-weight: ${({ theme }) => theme.fontWeights.semiBold}; font-size: ${({ theme }) => theme.fontSizes.xs}; }
  ${({ theme }) => theme.media.xsmall} {
    padding: 6px 8px;
    .txt { display: none; }
  }
`;

const Controls = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${({ theme }) => theme.spacings.md};
  align-items: center;
`;

const Qty = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  button {
    width: 36px; height: 36px;
    border-radius: ${({ theme }) => theme.radii.md};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.backgroundAlt};
    cursor: pointer;
    box-shadow: ${({ theme }) => theme.shadows.button};
  }
  input {
    width: 56px; text-align: center; padding: 6px 8px;
    border-radius: ${({ theme }) => theme.radii.md};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  }
  ${({ theme }) => theme.media.xsmall} {
    button { width: 32px; height: 32px; }
    input { width: 50px; }
  }
`;

const Hint = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TotalLine = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const CatPillRow = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacings.sm};
`;

const CatPill = styled.span`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const QuickView = styled.div`
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const QVTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacings.sm};
`;

const QVGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacings.sm};
  ${({ theme }) => theme.media.small} { grid-template-columns: 1fr; }
`;

const QVItem = styled.div`
  padding: ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const Block = styled.section``;

const BlockTitle = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacings.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
`;

const VarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacings.sm};
  ${({ theme }) => theme.media.xsmall} {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const VarBtn = styled.button<{ $active?: boolean }>`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.lg};
  cursor: pointer;
  ${({ theme, $active }) => `
    border: ${theme.borders.thin} ${$active ? theme.colors.primary : theme.colors.border};
    background: ${$active ? theme.colors.primaryLight : theme.colors.inputBackgroundLight};
  `}
  display: flex; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.spacings.sm};
  .v-title { font-weight: ${({ theme }) => theme.fontWeights.semiBold}; }
  .v-price { opacity: .85; font-size: ${({ theme }) => theme.fontSizes.xs}; }
`;

const Groups = styled.div`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.md};
`;

const Group = styled.div``;

const GHead = styled.div`
  display: flex; align-items: center; gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  .soft { opacity: .7; }
`;

const Options = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacings.xs};
  ${({ theme }) => theme.media.xsmall} {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
`;

const Opt = styled.div<{ $active?: boolean }>`
  ${({ theme, $active }) => `
    border: ${theme.borders.thin} ${$active ? theme.colors.primary : theme.colors.border};
    border-radius: ${theme.radii.md};
    padding: 8px 10px;
    background: ${theme.colors.cardBackground};
  `}
  label { display: flex; align-items: center; justify-content: space-between; gap: ${({ theme }) => theme.spacings.sm}; cursor: pointer; width: 100%; }
  input { margin-right: 6px; }
  em { opacity: .8; font-size: ${({ theme }) => theme.fontSizes.xs}; }
`;

/* ===== Alerjenler & Katkılar ===== */
const FinePrint = styled.div`
  margin-top: ${({ theme }) => theme.spacings.sm};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.xs};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Line = styled.div`
  display: flex; flex-wrap: wrap; align-items: center;
  gap: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
`;

const Dot = styled.span`
  opacity: .5;
`;

const ChipRow = styled.div`
  display: flex; flex-wrap: wrap; gap: ${({ theme }) => theme.spacings.xs};
`;

const Chip = styled.span`
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  font-size: 11px; line-height: 1; color: ${({ theme }) => theme.colors.text};
`;

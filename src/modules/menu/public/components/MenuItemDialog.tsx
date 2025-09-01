"use client";

import styled from "styled-components";
import { useMemo, useState } from "react";
import type { SupportedLocale } from "@/types/common";
import { getMultiLang } from "@/types/common";
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
import { useMenuitemReactions } from "@/hooks/useMenuitemReactions";

type Props = {
  item: IMenuItem;
  lang: SupportedLocale;
  t: (k: string, d?: string) => string;
  onClose: () => void;
  branchId?: string;
  channel?: PriceChannel;
};

export default function MenuItemDialog({
  item,
  lang,
  t,
  onClose,
  branchId,
  channel = "delivery",
}: Props) {
  void branchId;

  // reactions
  const { summary, mine, toggle, toggleEmoji, rate } = useMenuitemReactions(
    String((item as any)._id || "")
  );
  const EMOJIS = ["👍", "🔥", "😍", "😋"];

  // ---- default variant
  const defaultVariant = useMemo<IMenuItemVariant | undefined>(() => {
    const list = Array.isArray(item.variants) ? item.variants : [];
    return list.find((v) => v.isDefault) || list[0];
  }, [item.variants]);

  const [variantCode, setVariantCode] = useState<string | undefined>(
    defaultVariant?.code
  );
  const [qty, setQty] = useState(1);

  // modifierSelections: { [groupCode]: string[] }
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
    () =>
      (item.variants || []).find((v) => v.code === variantCode) ||
      defaultVariant,
    [item.variants, variantCode, defaultVariant]
  );

  const basePrice = useMemo(
    () =>
      currentVariant
        ? getVariantBasePrice(currentVariant, channel)
        : findMinBasePrice(item, channel),
    [currentVariant, item, channel]
  );

  const optionsTotal = useMemo(() => {
    let sum = 0;
    for (const g of groups) {
      const picked = mods[g.code] || [];
      for (const code of picked) {
        const opt = (g.options || []).find((o) => o.code === code);
        const p = opt ? getOptionBasePrice(opt, channel) : null;
        if (p) sum += p.amount;
      }
    }
    return sum;
  }, [groups, mods, channel]);

  const totalEach = (basePrice?.amount || 0) + optionsTotal;
  const total = totalEach * qty;

  const canSubmit = useMemo(() => {
    // required groups kontrolü + min/max uyum
    for (const g of groups) {
      const picked = mods[g.code] || [];
      const count = picked.length;
      if (g.isRequired && (g.minSelect ?? 0) <= 0 && count === 0) return false;
      if (typeof g.minSelect === "number" && count < g.minSelect) return false;
      if (typeof g.maxSelect === "number" && count > g.maxSelect) return false;
    }
    return !!currentVariant && qty > 0 && !!basePrice;
  }, [groups, mods, qty, currentVariant, basePrice]);

  const title =
    getMultiLang(item.name as any, lang) || item.slug || item.code;

  const toggleOption = (
    g: IMenuItemModifierGroup,
    option: IMenuItemModifierOption
  ) => {
    setMods((prev) => {
      const prevArr = prev[g.code] || [];
      const exists = prevArr.includes(option.code);
      let nextArr: string[] = prevArr;

      const max = typeof g.maxSelect === "number" ? g.maxSelect : undefined;

      if (!exists) {
        nextArr = max
          ? [...prevArr, option.code].slice(0, max)
          : [...prevArr, option.code];
      } else {
        nextArr = prevArr.filter((c) => c !== option.code);
      }
      return { ...prev, [g.code]: nextArr };
    });
  };

  return (
    <Overlay role="dialog" aria-modal="true" aria-label={title}>
      <Sheet>
        <Header>
          <H>{title}</H>
          <Close onClick={onClose} aria-label={t("close", "Kapat")}>
            ×
          </Close>
        </Header>

        {/* Varyantlar */}
        {Array.isArray(item.variants) && item.variants.length > 0 && (
          <Block>
            <BlockTitle>{t("variant", "Boyut / Varyant")}</BlockTitle>
            <VarGrid>
              {item.variants
                .slice()
                .sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9))
                .map((v) => {
                  const vName = getMultiLang(v.name as any, lang) || v.code;
                  const p = getVariantBasePrice(v, channel);
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

        {/* Opsiyon grupları */}
        {groups.length > 0 && (
          <Block>
            <BlockTitle>{t("extras", "İlave / Seçenekler")}</BlockTitle>
            <Groups>
              {groups.map((g) => {
                const picked = mods[g.code] || [];
                return (
                  <Group key={g.code}>
                    <GHead>
                      <strong>
                        {getMultiLang(g.name as any, lang) || g.code}
                      </strong>
                      <small className="soft">
                        {[
                          g.isRequired ? t("required", "zorunlu") : "",
                          typeof g.minSelect === "number"
                            ? `min ${g.minSelect}`
                            : "",
                          typeof g.maxSelect === "number"
                            ? `max ${g.maxSelect}`
                            : "",
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
                          const label =
                            getMultiLang(o.name as any, lang) || o.code;
                          const p = getOptionBasePrice(o, channel);
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
                                <em>
                                  {p ? `+ ${formatMoney(p, lang)}` : ""}
                                </em>
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

        {/* Reactions */}
        <Block>
          <RxRow>
            <Buttons>
              <RxSmall
                aria-pressed={mine.like}
                onClick={() => toggle("LIKE")}
                title={t("like", "Beğen")}
              >
                👍 {summary.likes}
              </RxSmall>
              <RxSmall
                aria-pressed={mine.favorite}
                onClick={() => toggle("FAVORITE")}
                title={t("favorite", "Favori")}
              >
                ❤️ {summary.favorites}
              </RxSmall>
              <RxSmall
                aria-pressed={mine.bookmark}
                onClick={() => toggle("BOOKMARK")}
                title={t("bookmark", "Kaydet")}
              >
                🔖 {summary.bookmarks}
              </RxSmall>
            </Buttons>
            <StarsMini>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => rate(v as 1 | 2 | 3 | 4 | 5)}
                  title={t("rate", "Puan ver")}
                >
                  {(mine.rating ?? Math.round(summary.ratingAvg || 0)) >= v
                    ? "★"
                    : "☆"}
                </button>
              ))}
            </StarsMini>
          </RxRow>
          <EmojiRow>
            {EMOJIS.map((e) => (
              <Em
                key={e}
                $on={mine.emojis.has(e)}
                onClick={() => toggleEmoji(e)}
                title={`${e} ${summary.emojis[e] || 0}`}
              >
                {e} <small>{summary.emojis[e] || 0}</small>
              </Em>
            ))}
          </EmojiRow>
        </Block>

        {/* Alt bar: adet + toplam + sepete ekle */}
        <Footer>
          <Qty>
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label={t("decrease", "Azalt")}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) =>
                setQty(Math.max(1, Number(e.target.value) || 1))
              }
            />
            <button
              onClick={() => setQty((q) => q + 1)}
              aria-label={t("increase", "Arttır")}
            >
              +
            </button>
          </Qty>

          <Total>
            <span>{t("total", "Toplam")}:</span>
            <strong>
              {basePrice
                ? formatMoney({ ...basePrice, amount: total }, lang)
                : "—"}
            </strong>
          </Total>

          <AddWrap>
            <AddToCartButton
              productId={(item as any)._id}
              productType="menuitem"
              disabled={!canSubmit}
            >
              {t("add", "Sepete Ekle")}
            </AddToCartButton>
          </AddWrap>
        </Footer>
      </Sheet>
    </Overlay>
  );
}

/* styled */
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  display:flex; align-items:flex-end; justify-content:center; z-index: 70;
`;
const Sheet = styled.div`
  width:min(920px, 100%); max-height: 92vh; overflow:auto;
  background:${({theme})=>theme.colors.cardBackground};
  border-radius: 18px 18px 0 0;
  padding: 16px; box-shadow:${({theme})=>theme.shadows.lg};
`;
const Header = styled.div`display:flex; justify-content:space-between; align-items:center; gap:8px;`;
const H = styled.h3`margin:0;`;
const Close = styled.button`font-size:22px; line-height:1; background:transparent; border:none; cursor:pointer;`;
const Block = styled.section`margin-top: 12px;`;
const BlockTitle = styled.h4`margin: 0 0 8px; font-size:${({theme})=>theme.fontSizes.base};`;
const VarGrid = styled.div`display:grid; grid-template-columns: repeat(auto-fill,minmax(180px,1fr)); gap:8px;`;

/* ✅ $active gerçekten kullanılıyor; lint temiz */
const VarBtn = styled.button<{ $active?: boolean }>`
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  ${({ theme, $active }) => `
    border: ${theme.borders.thin} ${$active ? theme.colors.primary : theme.colors.border};
    background: ${$active ? theme.colors.primaryLight : theme.colors.inputBackgroundLight};
  `}
  display:flex; align-items:center; justify-content:space-between; gap:8px;
  .v-title{ font-weight: 600; }
  .v-price{ opacity:.85; font-size: .9em; }
`;

const Groups = styled.div`display:flex; flex-direction:column; gap:12px;`;
const Group = styled.div``;
const GHead = styled.div`display:flex; align-items:center; gap:8px; margin-bottom:6px; .soft{opacity:.7;}`;
const Options = styled.div`display:grid; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); gap:6px;`;

/* ✅ $active burada da kullanılıyor */
const Opt = styled.div<{ $active?: boolean }>`
  ${({ theme, $active }) => `
    border: ${theme.borders.thin} ${$active ? theme.colors.primary : theme.colors.border};
    border-radius: 10px;
    padding: 8px 10px;
  `}
  label{ display:flex; align-items:center; justify-content:space-between; gap:8px; cursor:pointer; }
  input{ margin-right: 6px; }
  em{ opacity:.8; }
`;

/* Reactions mini bar */
const RxRow = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:8px;
`;
const Buttons = styled.div`display:flex; gap:8px; flex-wrap:wrap;`;
const RxSmall = styled.button`
  padding:6px 10px; border-radius:12px;
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.colors.inputBackgroundLight};
  cursor:pointer;
  &[aria-pressed="true"]{ background:${({theme})=>theme.colors.primaryLight}; }
`;
const StarsMini = styled.div`
  display:inline-flex; gap:4px;
  button{ border:none; background:transparent; cursor:pointer; font-size:18px; }
`;
const EmojiRow = styled.div`display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;`;
const Em = styled.button<{ $on?: boolean }>`
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme,$on})=>$on?theme.colors.primaryLight:theme.colors.inputBackgroundLight};
  border-radius:${({theme})=>theme.radii.pill};
  padding:4px 8px; cursor:pointer;
  small{ opacity:.8; }
`;

const Footer = styled.div`
  position: sticky; bottom: 0; padding-top: 12px; margin-top: 16px;
  display:grid; grid-template-columns: auto 1fr auto; gap:12px;
  background: ${({theme})=>theme.colors.cardBackground};
  border-top: ${({theme}) => theme.borders.thin} ${({theme})=>theme.colors.borderBright};
`;
const Qty = styled.div`
  display:inline-flex; align-items:center; gap:6px;
  button{ width:32px; height:32px; border-radius:8px; border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border}; background:${({theme})=>theme.colors.backgroundAlt}; }
  input{ width:56px; text-align:center; padding:6px 8px; border-radius:8px; border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder}; }
`;
const Total = styled.div`display:flex; align-items:center; gap:8px; font-size: 16px; font-weight: 600;`;
const AddWrap = styled.div`min-width: 180px;`;

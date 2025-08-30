"use client";

import { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import type { SupportedLocale } from "@/types/common";
import type { IMenu } from "@/modules/menu/types/menu";
import type { IMenuCategory } from "@/modules/menu/types/menucategory";
import type { IMenuItem } from "@/modules/menu/types/menuitem";
import { MenuHeader, CategoryNav, ItemCard } from "@/modules/menu";

type VM = {
  menu: IMenu;
  navCats: IMenu["categories"];
  sideCats: { id: string; label: string; count: number; isFeatured?: boolean; order: number }[];
  itemsByCategory: Map<string, IMenuItem[]>;
};

type Props = {
  vm: VM | null | undefined;
  uiLang: SupportedLocale;
  t: (k: string, d?: string) => string;
  isLoading: boolean;
  catDict: Map<string, IMenuCategory>;
};

export default function MenuSection({ vm, uiLang, t, isLoading, catDict }: Props) {
  const menu = vm?.menu ?? ({} as IMenu);

  // de-dupe + stabil sıralama
  const sideCats = useMemo(() => {
    const out: NonNullable<VM["sideCats"]> = [];
    const seen = new Set<string>();
    for (const c of vm?.sideCats ?? []) {
      const sig = `${c.id}|${c.label}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      out.push(c);
    }
    return out.sort((a, b) => (a.order - b.order) || a.label.localeCompare(b.label));
  }, [vm?.sideCats]);

  const firstSelectable =
    sideCats.find((c) => c.count > 0)?.id || sideCats[0]?.id || null;

  const [activeCat, setActiveCat] = useState<string | null>(firstSelectable);
  useEffect(() => { setActiveCat(firstSelectable); }, [firstSelectable]);

  // 🔧 FIX: itemsByCategory için ayrı useMemo
  const itemsByCategory = useMemo(
    () => vm?.itemsByCategory ?? new Map<string, IMenuItem[]>(),
    [vm?.itemsByCategory]
  );

  const currentItems = useMemo(
    () => (activeCat ? (itemsByCategory.get(activeCat) || []) : []),
    [activeCat, itemsByCategory]
  );

  const total = currentItems.length;

  return (
    <section>
      <Hero>
        <MenuHeader menu={menu} t={t} lang={uiLang} isLoading={!!isLoading} />
        <div className="crumbs">Home / Menu</div>
      </Hero>

      <TopBar>
        <CategoryNav
          categories={vm?.navCats ?? []}
          catDict={catDict}
          t={t}
          lang={uiLang}
          isLoading={!!isLoading}
          anchorMap={new Map()}
        />
      </TopBar>

      <MainArea>
        <SidePanel>
          <PanelTitle>{t("categories", "Categories")}</PanelTitle>
          {sideCats.length === 0 ? (
            <EmptyBox>{t("noCategories", "Kategori yok")}</EmptyBox>
          ) : (
            <CatList role="listbox" aria-label="Categories">
              {sideCats.map((c, idx) => {
                const active = c.id === activeCat;
                return (
                  <li key={`${c.id}-${idx}`}>
                    <button
                      type="button"
                      className={active ? "row active" : "row"}
                      onClick={() => setActiveCat(c.id)}
                    >
                      <span className="dot" aria-hidden />
                      <span className="label">{c.label}</span>
                      <span className="count">{c.count}</span>
                    </button>
                  </li>
                );
              })}
            </CatList>
          )}
        </SidePanel>

        <RightCol>
          <Toolbar>
            <span className="results">
              {total > 0
                ? `Showing 1–${total} of ${total} results`
                : t("noItems", "Gösterilecek ürün bulunamadı.")}
            </span>
            <select aria-label="Sort" defaultValue="default">
              <option value="default">{t("defaultSorting", "Default sorting")}</option>
            </select>
          </Toolbar>

          <ItemGrid>
            {currentItems.map((it, idx) => (
              <ItemCard
                key={`${it._id ?? it.code ?? it.slug ?? "item"}-${idx}`}
                item={it}
                lang={uiLang}
                t={t}
              />
            ))}
          </ItemGrid>
        </RightCol>
      </MainArea>
    </section>
  );
}

/* styles (değişmedi) */
const Hero = styled.header`
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.secondary} 0%,
    ${({ theme }) => theme.colors.secondaryDark} 100%
  );
  color: ${({ theme }) => theme.colors.textAlt};
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: clamp(24px, 6vw, 60px);
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  .crumbs{ opacity: .9; font-weight: 500; margin-top: 4px; }
`;

const TopBar = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.textAlt};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: sticky; top: 0; z-index: ${({ theme }) => theme.zIndex.dropdown};
`;

const MainArea = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.small} { grid-template-columns: 1fr; }
`;

const SidePanel = styled.aside`
  position: sticky; top: 86px;
  align-self: start;
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.small} { position: static; }
`;

const PanelTitle = styled.h3`
  margin: 0 0 12px;
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.darkColor};
`;

const EmptyBox = styled.div`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  color: ${({ theme }) => theme.colors.darkColor};
  opacity: .8;
`;

const CatList = styled.ul`
  list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px;
  .row{
    width: 100%;
    display: grid; grid-template-columns: 20px 1fr auto; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: ${({ theme }) => theme.radii.md};
    border: ${({ theme }) => theme.borders.thin} transparent;
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
    color: ${({ theme }) => theme.colors.darkColor};
    cursor: pointer; transition: background ${({ theme }) => theme.transition.fast};
    .dot{ width: 10px; height: 10px; border-radius: 50%; background: ${({ theme }) => theme.colors.secondary}; }
    .count{ opacity: .65; font-weight: 600; }
  }
  .row:hover{ background: ${({ theme }) => theme.colors.hoverBackground}; }
  .row.active{
    background: ${({ theme }) => theme.colors.secondaryTransparent};
    border-color: ${({ theme }) => theme.colors.borderHighlight};
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.colors.borderHighlight};
  }
`;

const RightCol = styled.div` min-width: 0; `;

const Toolbar = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.darkColor};
  .results{ font-weight: 600; }
  select{
    height: 40px; padding: 0 10px;
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.darkColor};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
    border-radius: ${({ theme }) => theme.radii.md};
    box-shadow: ${({ theme }) => theme.shadows.xs};
  }
`;

const ItemGrid = styled.div`
  display: grid; gap: ${({ theme }) => theme.spacings.md};
  grid-template-columns: repeat(3, minmax(0,1fr));
  ${({ theme }) => theme.media.tablet} { grid-template-columns: repeat(2, minmax(0,1fr)); }
  ${({ theme }) => theme.media.small} { grid-template-columns: 1fr; }
  article{ border-color: ${({ theme }) => theme.colors.border}; box-shadow: ${({ theme }) => theme.shadows.sm}; }
`;

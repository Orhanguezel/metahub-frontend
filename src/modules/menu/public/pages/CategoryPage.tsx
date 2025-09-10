"use client";

import { useMemo, useCallback } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";
import { getMultiLang, type SupportedLocale } from "@/types/common";
import { getUILang } from "@/i18n/getUILang";

import { useAppSelector } from "@/store/hooks";
import type { IMenuCategory } from "@/modules/menu/types/menucategory";
import type { IMenuItem } from "@/modules/menu/types/menuitem";
import type { IMenu } from "@/modules/menu/types/menu";
import { ItemCard, MenuHeader, CategoryNav } from "@/modules/menu";
import { selectMenuItemsPublic } from "@/modules/menu/slice/menuitemSlice";
import { selectMenusPublic } from "@/modules/menu/slice/menuSlice";

/* ---------------- helpers ---------------- */
const asId = (v: any): string =>
  typeof v === "string" ? v : v?.$oid || v?._id || v?.id || String(v || "");

const slugOf = (c?: IMenuCategory | null): string =>
  (c?.slug && String(c.slug).trim()) || (c?._id ? asId(c._id) : "");

/* ---------------- props ---------------- */
type Props = {
  params?: { slug?: string };
  searchParams?: { branch?: string };
};

/* ---------------- page ---------------- */
export default function CategoryPage({ params, searchParams }: Props) {
  const { t, i18n } = useI18nNamespace("menu", translations);
  const uiLang: SupportedLocale = useMemo(
    () => getUILang(i18n?.language),
    [i18n?.language]
  );

  const slug = (params?.slug ?? "").toLowerCase();
  const branchId = searchParams?.branch;

  // store (parent fetch ediyor)
  const categories = useAppSelector((s) => s.menucategory?.publicList ?? []) as IMenuCategory[];
  const categoriesLoading = !!useAppSelector((s) => s.menucategory?.loading);

  const items = useAppSelector(selectMenuItemsPublic) as IMenuItem[];

  const menus = useAppSelector(selectMenusPublic) as IMenu[];
  const menusLoading = !!useAppSelector((s) => s.menu?.loading);

  const activeMenus = useMemo(
    () => (menus || []).filter((m) => m?.isPublished !== false && m?.isActive !== false),
    [menus]
  );

  // slug hem _id hem slug ile eşleşsin
  const currentCategory = useMemo<IMenuCategory | null>(() => {
    if (!slug) return null;
    const byId = categories.find((c) => asId(c._id) === slug);
    if (byId) return byId;
    return categories.find((c) => (c.slug || "").toLowerCase() === slug) || null;
  }, [categories, slug]);

  const cid = useMemo(() => (currentCategory ? asId(currentCategory._id) : ""), [currentCategory]);

  // Kategori hangi menüdeyse o menüyü host kabul et → /menu ile tutarlılık
  const currentMenu = useMemo<IMenu | null>(() => {
    if (!activeMenus.length) return null;
    if (cid) {
      const host = activeMenus.find((m) =>
        (m.categories || []).some((lnk) => asId(lnk.category) === cid)
      );
      if (host) return host;
    }
    return activeMenus[0] || null; // fallback
  }, [activeMenus, cid]);

  const menuLoading = menusLoading || !currentMenu;

  // ----- NAV & SIDEBAR veri modeli (yalnızca currentMenu.categories) -----
  const catDict = useMemo(
    () => new Map<string, IMenuCategory>((categories || []).map((c) => [asId(c._id), c])),
    [categories]
  );

  const menuCatLinks = useMemo(() => {
    const links = (currentMenu?.categories || [])
      .map((lnk) => ({ category: asId(lnk.category), isFeatured: !!lnk.isFeatured, order: lnk.order ?? 0 }))
      .sort((a, b) => (a.order - b.order));
    // unique by id
    const seen = new Set<string>();
    return links.filter((l) => (seen.has(l.category) ? false : (seen.add(l.category), true)));
  }, [currentMenu]);

  const menuCatIds = useMemo(() => new Set(menuCatLinks.map((l) => String(l.category))), [menuCatLinks]);

  // branch filtresi
  const matchBranch = useCallback((it: IMenuItem) => {
    if (!branchId) return true;
    const anyPriceMatches = (arr?: any[]) => {
      const list = Array.isArray(arr) ? arr : [];
      if (!list.length) return true;
      const anyHasOutlet = list.some((p) => p && "outlet" in p);
      if (!anyHasOutlet) return true;
      return list.some((p) => !p?.outlet || String(p.outlet) === String(branchId));
    };
    const variantOk = (it?.variants || []).some((v) => anyPriceMatches(v?.prices));
    const optionsOk = (it?.modifierGroups || []).some((g) =>
      (g?.options || []).some((o) => anyPriceMatches(o?.prices))
    );
    const noPriceStruct =
      !(it?.variants || []).some((v) => Array.isArray(v?.prices) && v.prices.length) &&
      !(it?.modifierGroups || []).some((g) =>
        (g?.options || []).some((o) => Array.isArray(o?.prices) && o.prices.length)
      );
    return noPriceStruct || variantOk || optionsOk;
  }, [branchId]);

  // Menü kapsamındaki ürünler ve kategoriye göre grupla
  const { itemsByCategory, sideCats } = useMemo(() => {
    const relevant = (items || [])
      .filter((it) => it?.isActive !== false && it?.isPublished !== false)
      .filter(matchBranch)
      .filter((it) => (it?.categories || []).some((c) => menuCatIds.has(asId((c as any)?.category ?? c))));

    const byCat = new Map<string, IMenuItem[]>();
    for (const it of relevant) {
      const itCats = (it?.categories || []).map((c) => asId((c as any)?.category ?? c));
      for (const cid of itCats) {
        if (!menuCatIds.has(cid)) continue;
        if (!byCat.has(cid)) byCat.set(cid, []);
        byCat.get(cid)!.push(it);
      }
    }

    const sc = menuCatLinks.map((lnk) => {
      const id = lnk.category;
      const cat = catDict.get(id);
      const label = cat ? (getMultiLang(cat.name as any, uiLang) || cat.slug || cat.code || id) : id;
      const count = (byCat.get(id) || []).length;
      return { id, label, count, isFeatured: lnk.isFeatured, order: lnk.order };
    });

    return { itemsByCategory: byCat, sideCats: sc };
  }, [items, menuCatIds, menuCatLinks, catDict, uiLang,matchBranch]);

  // aktif kategori = route’taki kategori; değilse menüde ilk dolu kategori
  const activeCatId = useMemo(() => {
    if (cid && menuCatIds.has(cid)) return cid;
    const firstWithItems = sideCats.find((c) => c.count > 0)?.id;
    return firstWithItems || sideCats[0]?.id || "";
  }, [cid, menuCatIds, sideCats]);

  const currentItems = useMemo(() => itemsByCategory.get(activeCatId) || [], [itemsByCategory, activeCatId]);

  // başlık
  const categoryTitle = useMemo(() => {
    if (!currentCategory) return t("category.notFound", { defaultValue: "Kategori bulunamadı" });
    return (
      getMultiLang((currentCategory.name as any) || {}, uiLang) ||
      currentCategory.slug ||
      currentCategory.code ||
      asId(currentCategory._id)
    );
  }, [currentCategory, uiLang, t]);

  // t helper
  const t2 = (k: string, d?: string) => t(k, { defaultValue: d });

  return (
    <PageWrap>
      {/* ====== HERO (kırmızı gradient) + MenuHeader ====== */}
      <Hero>
        <MenuHeader menu={currentMenu} t={t2} lang={uiLang} isLoading={menuLoading} />
        <div className="crumbs">Home / Menu</div>
      </Hero>

      {/* ====== CATEGORY NAV (Marquee) – menü bağlamı ====== */}
      <TopBar>
        <CategoryNav
          categories={menuCatLinks}
          catDict={catDict}
          t={t2}
          lang={uiLang}
          isLoading={categoriesLoading || menuLoading}
          branchId={branchId}
        />
      </TopBar>

      {/* ====== ANA ALAN: Sidebar + Grid ====== */}
      <MainArea>
        <SidePanel>
          <PanelTitle>{t2("categories", "Categories")}</PanelTitle>
          {sideCats.length === 0 ? (
            <EmptyBox>{t2("noCategories", "Kategori yok")}</EmptyBox>
          ) : (
            <CatList role="listbox" aria-label="Categories">
              {sideCats.map((c) => {
                const cat = catDict.get(c.id);
                const target = slugOf(cat);
                const href =
                  branchId
                    ? { pathname: `/menu/category/${encodeURIComponent(target)}`, query: { branch: branchId } }
                    : `/menu/category/${encodeURIComponent(target)}`;
                const active = c.id === activeCatId;
                return (
                  <li key={c.id}>
                    <CatLink href={href} className={active ? "row active" : "row"}>
                      <span className="dot" aria-hidden />
                      <span className="label">{c.label}</span>
                      <span className="count">{c.count}</span>
                    </CatLink>
                  </li>
                );
              })}
            </CatList>
          )}
        </SidePanel>

        <RightCol>
          <HeaderArea>
            <Title>{categoryTitle}</Title>
            <Meta>
              {currentCategory
                ? t("category.itemCount", { defaultValue: "{{count}} ürün", count: currentItems.length })
                : t("category.notFoundShort", { defaultValue: "Kategori bulunamadı" })}
            </Meta>
          </HeaderArea>

          {currentItems.length > 0 ? (
            <Grid>
              {currentItems.map((it) => (
                <ItemCard key={it._id} item={it} lang={uiLang} t={(k, d) => t(k, { defaultValue: d })} />
              ))}
            </Grid>
          ) : (
            <Empty>{t("category.noItems", { defaultValue: "Bu kategoride ürün yok." })}</Empty>
          )}
        </RightCol>
      </MainArea>
    </PageWrap>
  );
}

/* ---------------- styles ---------------- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.background};
  min-height: 60dvh;
`;

/* /menu’deki kırmızı hero ile aynı hissiyat */
const Hero = styled.header`
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryDark} 100%);
  color: ${({ theme }) => theme.colors.textAlt};
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: clamp(18px, 4vw, 36px);
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};

  .crumbs{
    position: relative; z-index: 2;
    opacity: .9; font-weight: 500; margin-top: 8px;
    color: ${({ theme }) => theme.colors.white};
    text-shadow: 0 1px 6px rgba(0,0,0,0.35);
  }
`;

const TopBar = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.textAlt};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderHighlight};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: sticky; top: 8px; z-index: ${({ theme }) => theme.zIndex.dropdown};
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
  padding: ${({ theme }) => theme.spacings.md};
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

const CatLink = styled(Link)` text-decoration: none; display: block; `;

const RightCol = styled.div` min-width: 0; `;

const HeaderArea = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h1`
  margin: 0 0 6px 0;
  font-size: clamp(18px, 2.4vw, 28px);
  color: ${({ theme }) => theme.colors.darkColor};
`;

const Meta = styled.div`
  opacity: 0.8;
  color: ${({ theme }) => theme.colors.text};
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
  grid-template-columns: repeat(3, minmax(0, 1fr));
  ${({ theme }) => theme.media.tablet} { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  ${({ theme }) => theme.media.small} { grid-template-columns: 1fr; }

  article {
    border-color: ${({ theme }) => theme.colors.border};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const Empty = styled.div`
  padding: ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  color: ${({ theme }) => theme.colors.darkColor};
`;

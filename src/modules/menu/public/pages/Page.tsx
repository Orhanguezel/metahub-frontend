"use client";

import { useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";
import { getMultiLang } from "@/types/common";
import { getUILang } from "@/i18n/getUILang";
import type { SupportedLocale } from "@/types/common";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMenusPublic } from "@/modules/menu/slice/menuSlice";
import { fetchMenuCategoriesPublic } from "@/modules/menu/slice/menucategorySlice";
import {
  fetchMenuItemsPublic,
  selectMenuItemsPublic, // <-- selector'u kullan
} from "@/modules/menu/slice/menuitemSlice";
import { MenuHeader, CategoryNav, CategorySection } from "@/modules/menu";

/* helpers */
const asId = (v: any): string =>
  typeof v === "string" ? v : v?.$oid || v?._id || v?.id || String(v || "");

const slugify = (s: string) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* tipler (lite) */
type MenuItemLite = {
  _id?: string;
  slug?: string;
  code?: string;
  name?: any;
  description?: any;
  images?: any[];
  categories?: Array<{ category: any }>;
  variants?: any[];
  modifierGroups?: any[];
  isActive?: boolean;
  isPublished?: boolean;
};

type MenuCategoryLinkPublic = {
  category: string;
  order?: number;
  isFeatured?: boolean;
};

type MenuPublic = {
  _id: string;
  slug?: string;
  code?: string;
  categories?: MenuCategoryLinkPublic[];
};

type PageProps = {
  params?: { slug?: string };
  searchParams?: { branch?: string };
};

export default function Page({ params, searchParams }: PageProps) {
  const menuSlug = params?.slug?.toLowerCase();
  const branchId = searchParams?.branch;

  const { t, i18n } = useI18nNamespace("menu", translations);
  const uiLang: SupportedLocale = useMemo(
    () => getUILang(i18n?.language),
    [i18n?.language]
  );
  const tt = useMemo(
    () => (k: string, d?: string) => t(k, { defaultValue: d }),
    [t]
  );

  const dispatch = useAppDispatch();

  // store
  const menus = useAppSelector((s) => s.menu?.publicList ?? []) as MenuPublic[];
  const categories = useAppSelector((s) => s.menucategory?.publicList ?? []);
  const items = useAppSelector(selectMenuItemsPublic) as unknown as MenuItemLite[]; // <-- publicList’i okur

  const loadingMenu = !!useAppSelector((s) => s.menu?.loading);
  const loadingCats = !!useAppSelector((s) => s.menucategory?.loading);
  const loadingItems = !!useAppSelector((s) => s.menuitem?.loading);
  const errorItems = useAppSelector((s) => s.menuitem?.error as string | null);

  const isLoading = loadingMenu || loadingCats || loadingItems;

  useEffect(() => {
    dispatch(fetchMenusPublic({}) as any);
    dispatch(fetchMenuCategoriesPublic({}) as any);
    dispatch(fetchMenuItemsPublic({}) as any); // <-- public list
  }, [dispatch]);

  // aktif + publish
  const menusActive = useMemo(
    () => (menus || []).filter((m: any) => m?.isPublished !== false && m?.isActive !== false),
    [menus]
  );

  // slug filtresi
  const menusToShow = useMemo(() => {
    if (!menuSlug) return menusActive;
    return menusActive.filter((m: any) => String(m?.slug || "").toLowerCase() === menuSlug);
  }, [menusActive, menuSlug]);

  // kategori sözlüğü
  const catDict = useMemo(() => {
    const m = new Map<string, any>();
    for (const c of categories || []) m.set(asId((c as any)?._id), c);
    return m;
  }, [categories]);

  // branch filtresi
  const filterByBranch = useCallback((it: MenuItemLite) => {
    if (!branchId) return true;

    const matchInPrices = (arr?: any[]) => {
      const list = Array.isArray(arr) ? arr : [];
      if (!list.length) return true;
      const anyHasOutlet = list.some((p) => p && "outlet" in p);
      if (!anyHasOutlet) return true;
      return list.some((p) => !p?.outlet || String(p.outlet) === String(branchId));
    };

    const variantOk = (it?.variants || []).some((v: any) => matchInPrices(v?.prices));
    const optionsOk = (it?.modifierGroups || []).some((g: any) =>
      (g?.options || []).some((o: any) => matchInPrices(o?.prices))
    );

    const noPriceStruct =
      !(it?.variants || []).some((v: any) => Array.isArray(v?.prices) && v.prices.length) &&
      !(it?.modifierGroups || []).some((g: any) =>
        (g?.options || []).some((o: any) => Array.isArray(o?.prices) && o.prices.length)
      );

    return noPriceStruct || variantOk || optionsOk;
  }, [branchId]);

  /* görünüm */
  const viewData = useMemo(() => {
    return menusToShow.map((menu: MenuPublic) => {
      // 1) menü kategori linkleri
      const menuCatLinks: MenuCategoryLinkPublic[] = [...(menu?.categories || [])]
        .map((l) => ({ ...l, category: asId((l as any)?.category) }))
        .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
      const menuCatIds = new Set(menuCatLinks.map((c) => String(c.category)));

      // 2) bu menü için ilgili item'lar
      const relevantItems = (items || []).filter((it) => {
        if (it?.isActive === false || it?.isPublished === false) return false;
        if (!filterByBranch(it)) return false;
        const itCats = (it?.categories || []).map((c: any) => asId(c?.category ?? c));
        return itCats.some((cid) => menuCatIds.has(String(cid)));
      });

      // 3) item'lardan gelen extra kategori id’leri
      const itemCatIds = new Set<string>();
      for (const it of relevantItems) {
        for (const c of it?.categories || []) itemCatIds.add(asId((c as any)?.category ?? c));
      }
      const extraIds = [...itemCatIds].filter((id) => !menuCatIds.has(id));
      extraIds.sort((a, b) => {
        const A = catDict.get(a), B = catDict.get(b);
        const la = A ? (getMultiLang(A.name as any, uiLang) || A.slug || A.code || a) : a;
        const lb = B ? (getMultiLang(B.name as any, uiLang) || B.slug || B.code || b) : b;
        return la.localeCompare(lb);
      });

      // 4) göst. kategori id’leri
      const sectionIds: string[] = [...menuCatIds, ...extraIds];

      // 5) nav (tekil)
      const seen = new Set<string>();
      const navCats: { category: string; order?: number; isFeatured?: boolean }[] = [];
      for (const c of menuCatLinks) {
        const id = String(c.category);
        if (!seen.has(id)) { seen.add(id); navCats.push(c); }
      }
      for (const id of extraIds) {
        if (!seen.has(id)) {
          seen.add(id);
          navCats.push({ category: id, order: Number.MAX_SAFE_INTEGER, isFeatured: false });
        }
      }

      // 6) kategori -> ürün
      const itemsByCategory = new Map<string, MenuItemLite[]>();
      const allowed = new Set(sectionIds);

      for (const it of relevantItems) {
        const itCats = (it?.categories || []).map((c: any) => asId(c?.category ?? c));
        for (const cid of itCats) {
          if (!allowed.has(cid)) continue;
          if (!itemsByCategory.has(cid)) itemsByCategory.set(cid, []);
          itemsByCategory.get(cid)!.push(it);
        }
      }

      for (const arr of itemsByCategory.values()) {
        arr.sort((a, b) => {
          const la = getMultiLang(a.name as any, uiLang) || a.slug || a.code || "";
          const lb = getMultiLang(b.name as any, uiLang) || b.slug || b.code || "";
          return la.localeCompare(lb);
        });
      }

      // 7) anchor map
      const anchorMap = new Map<string, string>();
      const used = new Set<string>();
      for (const cid of sectionIds) {
        const cat = catDict.get(cid);
        const base =
          cat?.slug ||
          cat?.code ||
          (cat ? slugify(getMultiLang(cat.name as any, uiLang) || "") : "") ||
          cid;
        let anchor = `cat-${base}`;
        if (used.has(anchor)) {
          const suffix = String(cid).slice(-4);
          anchor = `cat-${base}-${suffix}`;
        }
        used.add(anchor);
        anchorMap.set(cid, anchor);
      }

      const noCategoryHasItems = sectionIds.every(
        (cid) => (itemsByCategory.get(cid) || []).length === 0
      );

      return { menu, navCats, sectionIds, itemsByCategory, anchorMap, noCategoryHasItems };
    });
  }, [menusToShow, items, catDict, uiLang, filterByBranch]);

  return (
    <Wrap>
      {errorItems && <ErrorBox>{errorItems}</ErrorBox>}

      {viewData.map(({ menu, navCats, sectionIds, itemsByCategory, anchorMap, noCategoryHasItems }) => (
        <section key={menu._id} style={{ marginBottom: 32 }}>
          <MenuHeader menu={menu as any} t={tt} lang={uiLang} isLoading={!!isLoading} />

          <CategoryNav
            categories={navCats}
            catDict={catDict}
            t={tt}
            lang={uiLang}
            isLoading={!!isLoading}
            anchorMap={anchorMap}
          />

          <div style={{ marginTop: 16 }} />

          {sectionIds.map((cid) => {
            const cat   = catDict.get(cid);
            const list  = itemsByCategory.get(cid) || [];
            const title = cat ? (getMultiLang(cat.name as any, uiLang) || cat.slug || cat.code) : tt("unknownCategory", "Kategori");
            const anchorId = anchorMap.get(cid) ?? `cat-${cid}`;
            return (
              <CategorySection
                key={`${menu._id}-${anchorId}`}
                id={anchorId}
                title={title}
                items={list as any[]}
                lang={uiLang}
                t={tt}
                isLoading={!!isLoading}
              />
            );
          })}

          {!isLoading && noCategoryHasItems && (
            <Empty>{tt("noItems", "Gösterilecek ürün bulunamadı.")}</Empty>
          )}
        </section>
      ))}
    </Wrap>
  );
}

/* styles */
const Wrap = styled.div`max-width:960px;margin:0 auto;padding:16px;`;
const Empty = styled.div`opacity:.7;text-align:center;padding:40px 0;`;
const ErrorBox = styled.div`
  margin: 8px 0 16px;
  padding: 10px 12px;
  border-radius: 8px;
  background:#fee; color:#900; border:1px solid #f5c2c2;
`;

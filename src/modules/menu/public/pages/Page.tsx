"use client";

import { useMemo, useCallback } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";
import { getMultiLang } from "@/types/common";
import { getUILang } from "@/i18n/getUILang";
import type { SupportedLocale } from "@/types/common";

import { useAppSelector } from "@/store/hooks";
import {
  selectMenuItemsPublic,
} from "@/modules/menu/slice/menuitemSlice";

import {MenuSection} from "@/modules/menu";

import type { IMenu } from "@/modules/menu/types/menu";
import type { IMenuCategory } from "@/modules/menu/types/menucategory";
import type { IMenuItem } from "@/modules/menu/types/menuitem";

/* helpers */
const asId = (v: any): string =>
  typeof v === "string" ? v : v?.$oid || v?._id || v?.id || String(v || "");

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

  // store
  const menus = useAppSelector((s) => s.menu?.publicList ?? []) as IMenu[];
  const categories = useAppSelector((s) => s.menucategory?.publicList ?? []) as IMenuCategory[];
  const items = useAppSelector(selectMenuItemsPublic) as IMenuItem[];

  const loadingMenu = !!useAppSelector((s) => s.menu?.loading);
  const loadingCats = !!useAppSelector((s) => s.menucategory?.loading);
  const loadingItems = !!useAppSelector((s) => s.menuitem?.loading);
  const errorItems = useAppSelector((s) => s.menuitem?.error as string | null);

  const isLoading = loadingMenu || loadingCats || loadingItems;

  // aktif + publish
  const menusActive = useMemo(
    () => (menus || []).filter((m) => m?.isPublished !== false && m?.isActive !== false),
    [menus]
  );

  // slug filtresi
  const menusToShow = useMemo(() => {
    if (!menuSlug) return menusActive;
    return menusActive.filter((m) => String(m?.slug || "").toLowerCase() === menuSlug);
  }, [menusActive, menuSlug]);

  // kategori sözlüğü
  const catDict = useMemo(() => {
    const m = new Map<string, IMenuCategory>();
    for (const c of categories || []) m.set(asId(c._id), c);
    return m;
  }, [categories]);

  // branch filtresi
  const filterByBranch = useCallback((it: IMenuItem) => {
    if (!branchId) return true;

    const matchInPrices = (arr?: any[]) => {
      const list = Array.isArray(arr) ? arr : [];
      if (!list.length) return true;
      const anyHasOutlet = list.some((p) => p && "outlet" in p);
      if (!anyHasOutlet) return true;
      return list.some((p) => !p?.outlet || String(p.outlet) === String(branchId));
    };

    const variantOk = (it?.variants || []).some((v) => matchInPrices(v?.prices));
    const optionsOk = (it?.modifierGroups || []).some((g) =>
      (g?.options || []).some((o) => matchInPrices(o?.prices))
    );

    const noPriceStruct =
      !(it?.variants || []).some((v) => Array.isArray(v?.prices) && v.prices.length) &&
      !(it?.modifierGroups || []).some((g) =>
        (g?.options || []).some((o) => Array.isArray(o?.prices) && o.prices.length)
      );

    return noPriceStruct || variantOk || optionsOk;
  }, [branchId]);

  /* view model — hooks yok */
  type SideCat = { id: string; label: string; count: number; isFeatured?: boolean; order: number };
  type ViewModel = {
    menu: IMenu;
    navCats: IMenu["categories"];
    sideCats: SideCat[];
    itemsByCategory: Map<string, IMenuItem[]>;
  };

  const viewModels = useMemo<ViewModel[]>(() => {
    return menusToShow.map((menu) => {
      const menuCatLinks = [...(menu?.categories || [])]
        .map((l) => ({ ...l, category: asId(l.category) }))
        .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

      const menuCatIds = new Set(menuCatLinks.map((c) => String(c.category)));

      // ilgili item’lar
      const relevantItems = (items || []).filter((it) => {
        if (it?.isActive === false || it?.isPublished === false) return false;
        if (!filterByBranch(it)) return false;
        const itCats = (it?.categories || []).map((c) => asId(c?.category ?? c));
        return itCats.some((cid) => menuCatIds.has(String(cid)));
      });

      // kategori -> ürün
      const itemsByCategory = new Map<string, IMenuItem[]>();
      for (const it of relevantItems) {
        const itCats = (it?.categories || []).map((c) => asId(c?.category ?? c));
        for (const cid of itCats) {
          if (!menuCatIds.has(cid)) continue;
          if (!itemsByCategory.has(cid)) itemsByCategory.set(cid, []);
          itemsByCategory.get(cid)!.push(it);
        }
      }

      // sol panel listesi
      const sideCats: SideCat[] = menuCatLinks
        .map((lnk) => {
          const id = String(lnk.category);
          const obj = catDict.get(id);
          const label = obj ? (getMultiLang(obj.name as any, uiLang) || obj.slug || obj.code || id) : id;
          const count = (itemsByCategory.get(id) || []).length;
          return { id, label, count, isFeatured: lnk.isFeatured, order: lnk.order ?? 0 };
        })
        .sort((a, b) => (a.order - b.order) || a.label.localeCompare(b.label));

      return { menu, navCats: menuCatLinks, sideCats, itemsByCategory };
    });
  }, [menusToShow, items, catDict, uiLang, filterByBranch]);

  return (
    <PageBg>
      <Container>
        {errorItems && <ErrorBox>{errorItems}</ErrorBox>}

        {viewModels.map((vm) => (
          <MenuSection
            key={vm.menu._id}
            vm={vm}
            uiLang={uiLang}
            t={tt}
            isLoading={isLoading}
            catDict={catDict}
          />
        ))}
      </Container>
    </PageBg>
  );
}

/* wrapper styles */
const PageBg = styled.div`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100dvh;
`;
const Container = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.lg};
`;
const ErrorBox = styled.div`
  margin: 8px 0 16px; padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.darkColor};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.danger};
`;

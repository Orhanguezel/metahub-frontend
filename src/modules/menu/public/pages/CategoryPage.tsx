"use client";

import { useMemo } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";
import { getMultiLang, type SupportedLocale } from "@/types/common";
import { getUILang } from "@/i18n/getUILang";

import { useAppSelector } from "@/store/hooks";
import type { IMenuCategory } from "@/modules/menu/types/menucategory";
import type { IMenuItem } from "@/modules/menu/types/menuitem";
import { ItemCard } from "@/modules/menu";
import { selectMenuItemsPublic } from "@/modules/menu/slice/menuitemSlice";

/* ---------------- helpers ---------------- */
const asId = (v: any): string =>
  typeof v === "string" ? v : v?.$oid || v?._id || v?.id || String(v || "");

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

  const slug = params?.slug?.toLowerCase() ?? "";
  const branchId = searchParams?.branch;

  // store’dan oku (parent fetch ediyor)
  const categories = useAppSelector((s) => s.menucategory?.publicList ?? []) as IMenuCategory[];
  const items = useAppSelector(selectMenuItemsPublic) as IMenuItem[];

  // slug hem _id hem slug alanına göre eşleşsin
  const currentCategory = useMemo(() => {
    const byId = categories.find((c) => asId(c._id) === slug);
    if (byId) return byId;
    return categories.find((c) => (c.slug || "").toLowerCase() === slug) || null;
  }, [categories, slug]);

  // kategori başlığı
  const categoryTitle = useMemo(() => {
    if (!currentCategory) return t("category.notFound", { defaultValue: "Kategori bulunamadı" });
    return (
      getMultiLang((currentCategory.name as any) || {}, uiLang) ||
      currentCategory.slug ||
      currentCategory.code ||
      asId(currentCategory._id)
    );
  }, [currentCategory, uiLang, t]);

  // opsiyonel: branch filtresi (fiyatlarda outlet varsa eşleşenleri bırak)
  const matchBranch = (it: IMenuItem) => {
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
  };

  // kategoriye ait ürünleri çıkar
  const categoryItems = useMemo(() => {
    if (!currentCategory) return [];
    const cid = asId(currentCategory._id);
    return (items || [])
      .filter((it) => it?.isActive !== false && it?.isPublished !== false)
      .filter(matchBranch)
      .filter((it) => (it?.categories || []).some((c) => asId((c as any)?.category ?? c) === cid));
      //eslint-disable-next-line
  }, [items, currentCategory, branchId]);

  return (
    <PageWrap>
      <HeaderArea>
        <Title>{categoryTitle}</Title>
        <Meta>
          {currentCategory
            ? t("category.itemCount", { defaultValue: "{{count}} ürün", count: categoryItems.length })
            : t("category.notFoundShort", { defaultValue: "Kategori bulunamadı" })}
        </Meta>
      </HeaderArea>

      {currentCategory ? (
        categoryItems.length > 0 ? (
          <Grid>
            {categoryItems.map((it) => (
              <ItemCard key={it._id} item={it} lang={uiLang} t={(k, d) => t(k, { defaultValue: d })} />
            ))}
          </Grid>
        ) : (
          <Empty>{t("category.noItems", { defaultValue: "Bu kategoride ürün yok." })}</Empty>
        )
      ) : (
        <Empty>{t("category.chooseAnother", { defaultValue: "Farklı bir kategori deneyin." })}</Empty>
      )}
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

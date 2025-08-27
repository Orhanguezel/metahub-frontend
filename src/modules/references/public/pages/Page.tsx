"use client";

import styled, { keyframes } from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/references";
import { Skeleton, ErrorMessage } from "@/shared";
import type { SupportedLocale } from "@/types/common";
import type { IReferences } from "@/modules/references/types";
import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";

/* --- props --- */
type PageProps = {
  /** /references/category/[slug] ise gelir; /references kökte undefined */
  categorySlug?: string;
  /** server'dan çözülen p/ps */
  initialSearch?: { p?: string; ps?: string };
};

/* --- types --- */
type MinReferencesCategory = {
  _id: string;
  name: Record<string, string>;
  slug?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type TabItem = { key: string; label: string; slug: string };

const PAGE_SIZE_OPTIONS = [8, 12, 16, 24, 36] as const;

const getPageItems = (total: number, current: number) => {
  const items: (number | "...")[] = [];
  const push = (v: number | "...") => items.push(v);
  const windowSize = 1;
  const start = Math.max(2, current - windowSize);
  const end = Math.min(total - 1, current + windowSize);
  if (total <= 7) { for (let i = 1; i <= total; i++) push(i); return items; }
  push(1);
  if (start > 2) push("...");
  for (let i = start; i <= end; i++) push(i);
  if (end < total - 1) push("...");
  push(total);
  return items;
};

export default function ReferencesPage({ categorySlug, initialSearch }: PageProps) {
  const { i18n, t } = useI18nNamespace("references", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const router = useRouter();

  const rawReferences = useAppSelector((s) => s.references.references);
  const references = useMemo(() => rawReferences || [], [rawReferences]);
  const loading = useAppSelector((s) => s.references.loading);
  const error = useAppSelector((s) => s.references.error);

  /* i18n bundle */
  useEffect(() => {
    Object.entries(translations).forEach(([lng, resources]) => {
      if (!i18n.hasResourceBundle(lng, "references")) {
        i18n.addResourceBundle(lng, "references", resources, true, true);
      }
    });
  }, [i18n]);

  /* kategoriler */
  const categories = useMemo<MinReferencesCategory[]>(() => {
    const map = new Map<string, MinReferencesCategory>();
    references.forEach((ref) => {
      const cat = ref.category;
      if (!cat) return;
      if (typeof cat === "string") {
        if (!map.has(cat)) {
          map.set(cat, { _id: cat, name: {}, isActive: true, createdAt: "", updatedAt: "" });
        }
      } else if (cat._id) {
        map.set(cat._id, {
          _id: cat._id,
          name: cat.name || {},
          slug: (cat as any).slug,
          isActive: (cat as any).isActive ?? true,
          createdAt: (cat as any).createdAt ?? "",
          updatedAt: (cat as any).updatedAt ?? "",
        });
      }
    });
    return Array.from(map.values());
  }, [references]);

  /* group by */
  const grouped = useMemo(() => {
    const result: Record<string, IReferences[]> = {};
    references.forEach((ref) => {
      const catId = typeof ref.category === "string" ? ref.category : ref.category?._id || "none";
      if (!result[catId]) result[catId] = [];
      result[catId].push(ref);
    });
    return result;
  }, [references]);

  const noCategory = grouped["none"] || [];

  /* slug haritası */
  const { tabs, slugToId } = useMemo(() => {
    const byId = categories.filter((cat) => grouped[cat._id]?.length);
    const taken = new Set<string>();
    const slugToId = new Map<string, string>();
    const makeUnique = (base: string, id: string) => {
      let s = base || "kategori";
      if (taken.has(s)) s = `${s}-${id.slice(-6)}`;
      taken.add(s);
      return s;
    };

    const tabs: TabItem[] = [];
    byId.forEach((c) => {
      const rawName = c.name?.en || c.name?.tr || c.name?.de || Object.values(c.name || {})[0] || c._id;
      const base = c.slug ? c.slug : slugify(rawName);
      const uniq = makeUnique(base, c._id);
      slugToId.set(uniq, c._id);
      tabs.push({ key: c._id, label: c.name?.[lang] || c.name?.en || "Untitled", slug: uniq });
    });

    if (noCategory.length) {
      slugToId.set("none", "none");
      tabs.push({ key: "none", label: t("references.no_category", "No Category"), slug: "none" });
    }
    return { tabs, slugToId };
  }, [categories, grouped, lang, t, noCategory.length]);

  /* aktif slug */
  const incomingSlug = categorySlug;            // sadece CATEGORY route’da dolu
  const [activeSlug, setActiveSlug] = useState<string | undefined>(incomingSlug);
  useEffect(() => {
    const firstSlug = tabs[0]?.slug;
    setActiveSlug(incomingSlug || firstSlug);   // /references kökte URL değiştirmeden ilk tab seçili
  }, [incomingSlug, tabs]);

  const activeCategoryId = activeSlug ? slugToId.get(activeSlug) : undefined;

  /* p/ps (server’dan) */
  const pageParam = Math.max(1, Number(initialSearch?.p || 1));
  const psParam = Math.max(1, Number(initialSearch?.ps || 12));
  const initialPageSize = PAGE_SIZE_OPTIONS.includes(psParam as any) ? psParam : 12;

  const [page, setPage] = useState<number>(pageParam);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  useEffect(() => { setPage(Math.max(1, pageParam || 1)); }, [activeCategoryId, pageParam]);
  useEffect(() => { setPageSize(initialPageSize); }, [initialPageSize]);

  const filteredRefs = useMemo(
    () => (activeCategoryId ? grouped[activeCategoryId] || [] : []),
    [activeCategoryId, grouped]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRefs.length / pageSize));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const pageItems = useMemo(() => getPageItems(totalPages, page), [totalPages, page]);
  const pagedRefs = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredRefs.slice(start, end);
  }, [filteredRefs, page, pageSize]);

  /* URL builder – KATEGORİ route’una gider */
  const buildHref = useCallback(
    (slug: string, p = 1, ps = pageSize) => {
      const sp = new URLSearchParams();
      if (p > 1) sp.set("p", String(p));
      if (ps !== 12) sp.set("ps", String(ps));
      const q = sp.toString();
      return { pathname: `/references/category/${slug}`, query: q ? `?${q}` : "" };
    },
    [pageSize]
  );

  const inCategory = !!categorySlug; // sadece kategori route’unda URL güncelle

  const replaceUrl = (slug: string, p = page, ps = pageSize) => {
    if (!inCategory) return; // kökte URL değiştirme
    const href = buildHref(slug, p, ps);
    router.replace(`${href.pathname}${href.query}`);
  };

  /* render */
  if (loading) {
    return (
      <PageWrapper>
        <SkeletonGrid>{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}</SkeletonGrid>
      </PageWrapper>
    );
  }
  if (error) {
    return (
      <PageWrapper>
        <ErrorMessage message={error} />
      </PageWrapper>
    );
  }
  if (!references.length) {
    return (
      <PageWrapper>
        <Empty>{t("page.noReferences", "No references available.")}</Empty>
      </PageWrapper>
    );
  }

  return (
    <ModernSection id="refs-top">
      {/* Tabs -> SEO slug’lı Link; kökte de çalışır */}
      <TabsWrapper>
        {tabs.map((tab) => {
          const hrefObj = buildHref(tab.slug, 1, pageSize);
          const href = `${hrefObj.pathname}${hrefObj.query}`;
          return (
            <Link
              key={tab.key}
              href={href}   // ABSOLUTE path => /references/category/<slug>?...
              onClick={() => {
                setActiveSlug(tab.slug);
                setPage(1);
              }}
            >
              <TabButton type="button" $active={activeSlug === tab.slug}>
                {tab.label}
              </TabButton>
            </Link>
          );
        })}
      </TabsWrapper>

      {/* Toolbar */}
      <Toolbar>
        <div />
        <Counter>
          {filteredRefs.length
            ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredRefs.length)} / ${filteredRefs.length}`
            : "0 / 0"}
        </Counter>
        <PerPage>
          <label htmlFor="perpage">{t("page.perPage", "Sayfa başına")}:</label>
          <select
            id="perpage"
            value={pageSize}
            onChange={(e) => {
              const ps = parseInt(e.target.value, 10) || 12;
              setPageSize(ps);
              setPage(1);
              if (activeSlug) replaceUrl(activeSlug, 1, ps);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </PerPage>
      </Toolbar>

      <LogoGrid>
        {pagedRefs.length === 0 ? (
          <Empty>{t("references.empty_in_category", "No references in this category.")}</Empty>
        ) : (
          pagedRefs
            .filter((item: IReferences) => item.images?.[0]?.url)
            .map((item: IReferences) => (
              <LogoCard key={item._id}>
                <div className="logo-img-wrap">
                  <Image
                    src={item.images[0].url}
                    alt={item.title?.[lang] || "Logo"}
                    fill
                    sizes="(max-width: 600px) 70vw, (max-width: 900px) 30vw, 140px"
                    style={{ objectFit: "contain" }}
                    loading="lazy"
                  />
                </div>
              </LogoCard>
            ))
        )}
      </LogoGrid>

      {/* Pagination */}
      {filteredRefs.length > pageSize && activeSlug && (
        <Pagination aria-label={t("page.pagination", "Pagination")}>
          <PageBtn
            type="button"
            disabled={page <= 1}
            onClick={() => {
              const np = Math.max(1, page - 1);
              setPage(np);
              replaceUrl(activeSlug, np, pageSize);
            }}
          >
            ‹ {t("page.prev", "Prev")}
          </PageBtn>

          {pageItems.map((it, idx) =>
            it === "..." ? (
              <Ellipsis key={`e-${idx}`}>…</Ellipsis>
            ) : (
              <PageNum
                key={it}
                $active={it === page}
                type="button"
                onClick={() => {
                  const np = it as number;
                  setPage(np);
                  replaceUrl(activeSlug, np, pageSize);
                }}
              >
                {it}
              </PageNum>
            )
          )}

          <PageBtn
            type="button"
            disabled={page >= totalPages}
            onClick={() => {
              const np = Math.min(totalPages, page + 1);
              setPage(np);
              replaceUrl(activeSlug, np, pageSize);
            }}
          >
            {t("page.next", "Next")} ›
          </PageBtn>
        </Pagination>
      )}
    </ModernSection>
  );
}

/* --- styles --- */

const ModernSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.sm};
  background: ${({ theme }) => theme.colors.achievementBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  @media (max-width: 900px) { padding: ${({ theme }) => theme.spacings.xl} ${({ theme }) => theme.spacings.xs}; }
  @media (max-width: 600px) { padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.xs}; border-radius: ${({ theme }) => theme.radii.lg}; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-14px);}
  to { opacity: 1; transform: translateY(0);}
`;

const TabsWrapper = styled.div`
  display: flex; flex-wrap: wrap; gap: .8rem 1.4rem; margin-bottom: 1rem; justify-content: center;
  animation: ${fadeIn} .7s cubic-bezier(0.37,0,0.63,1);
`;

const Toolbar = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacings.xs};
    > * { justify-self: stretch; }
  }
`;

const Counter = styled.div`
  justify-self: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const PerPage = styled.div`
  display: inline-flex; align-items: center; gap: ${({ theme }) => theme.spacings.xs};
  label { color: ${({ theme }) => theme.colors.textSecondary}; font-size: ${({ theme }) => theme.fontSizes.sm}; }
  select {
    padding: .35rem .55rem;
    border-radius: ${({ theme }) => theme.radii.md};
    border: 1px solid ${({ theme }) => theme.colors.inputBorder};
    background: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  position: relative; padding: .65rem 1.45rem; border: none; border-radius: 24px;
  background: ${({ $active, theme }) => $active ? `linear-gradient(100deg, ${theme.colors.achievementGradientStart}, ${theme.colors.achievementGradientEnd})` : theme.colors.background};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text)};
  font-weight: 700; font-size: 1.04rem; letter-spacing: .02em; cursor: pointer;
  box-shadow: ${({ $active, theme }) => $active ? `0 4px 22px 0 ${theme.colors.achievementGradientStart}29` : "0 2px 6px 0 rgba(40,40,50,0.05)"};
  border: 2px solid ${({ $active, theme }) => ($active ? theme.colors.achievementGradientStart : theme.colors.border)};
  transition: background .18s, color .18s, box-shadow .24s, transform .15s;
  outline: none; transform: ${({ $active }) => ($active ? "scale(1.08)" : "scale(1)")};
  &:hover,&:focus-visible{ background: ${({ theme }) => `linear-gradient(95deg, ${theme.colors.achievementGradientStart}, ${theme.colors.achievementGradientEnd})`}; color:#fff; box-shadow:0 7px 22px 0 ${({ theme }) => theme.colors.achievementGradientStart}36; transform:scale(1.12); }
`;

const LogoGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem; align-items: stretch;
  @media (max-width: 900px){ gap: 1.3rem 1rem; }
  @media (max-width: 600px){ grid-template-columns: 1fr 1fr; gap: 1rem .8rem; }
  @media (max-width: 430px){ grid-template-columns: 1fr; gap: .9rem 0; }
`;

const LogoCard = styled.div`
  background: linear-gradient(110deg, #fafdff 60%, #e7f5ff 100%);
  border-radius: 22px; border: 1.8px solid ${({ theme }) => theme.colors.achievementGradientStart}19;
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex; align-items: center; justify-content: center;
  min-height: 140px; padding: 1.1rem .6rem; position: relative;
  transition: box-shadow .22s cubic-bezier(.4,.12,.42,1.15), transform .16s cubic-bezier(.36,.04,.56,1.07), border .15s, background .15s;
  will-change: transform, box-shadow; cursor: pointer;

  .logo-img-wrap{
    position: relative;
    width: 140px;
    aspect-ratio: 14 / 9;
    overflow: hidden;
    @media (max-width: 600px){ width: 110px; }
    @media (max-width: 430px){ width: 82vw; }
  }

  &:hover,&:focus-visible{
    box-shadow: 0 12px 32px 0 ${({ theme }) => theme.colors.achievementGradientStart}25;
    border-color: ${({ theme }) => theme.colors.achievementGradientEnd};
    background: linear-gradient(110deg, #f1fbff 45%, #d1f1fd 100%);
    transform: scale(1.05) translateY(-3px);
    z-index: 2;
  }
`;

const Pagination = styled.nav`
  margin-top: ${({ theme }) => theme.spacings.lg};
  display: flex; gap: ${({ theme }) => theme.spacings.xs};
  flex-wrap: wrap; align-items: center; justify-content: center;
`;

const PageBtn = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  &:disabled { opacity: .5; cursor: not-allowed; }
`;

const PageNum = styled(PageBtn)<{ $active?: boolean }>`
  font-weight: ${({ $active, theme }) => ($active ? theme.fontWeights.bold : theme.fontWeights.medium)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.backgroundAlt)};
  color: ${({ $active }) => ($active ? "#fff" : "inherit")};
  border-color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
`;

const Ellipsis = styled.span`
  padding: 8px 10px; color: ${({ theme }) => theme.colors.textSecondary};
`;

const SkeletonGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 2.3rem 2.2rem;
`;

const Empty = styled.p`
  text-align: center; color: ${({ theme }) => theme.colors.textSecondary}; font-size: 1.13em; margin: 2.5rem 0 1.5rem 0;
`;

const PageWrapper = styled.div`
  padding: 2rem; background: ${({ theme }) => theme.colors.contentBackground};
  border-radius: ${({ theme }) => theme.radii.md}; box-shadow: ${({ theme }) => theme.shadows.sm};
  max-width: 1200px; margin: 0 auto;
`;

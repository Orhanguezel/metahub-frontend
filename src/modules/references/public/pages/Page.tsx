"use client";

import styled, { keyframes } from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/references";
import { Skeleton, ErrorMessage } from "@/shared";
import type { SupportedLocale } from "@/types/common";
import type { IReferences } from "@/modules/references/types";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";

/* --- types --- */
type MinReferencesCategory = {
  _id: string;
  name: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/* --- helpers --- */
const PAGE_SIZE_OPTIONS = [8, 12, 16, 24, 36] as const;

const parseHash = (): { tab?: string; p?: number; ps?: number } => {
  if (typeof window === "undefined") return {};
  const raw = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(raw);
  const tab = params.get("tab") || undefined;
  const p = params.get("p");
  const ps = params.get("ps");
  return {
    tab,
    p: p ? Math.max(1, Number(p) || 1) : undefined,
    ps: ps ? Math.max(1, Number(ps) || 12) : undefined,
  };
};

const setHash = (tab: string, p: number, ps: number) => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  params.set("tab", tab);
  params.set("p", String(p));
  params.set("ps", String(ps));
  const next = `#${params.toString()}`;
  if (window.location.hash !== next) {
    window.history.replaceState(null, "", next);
  }
};

/* compact sayfa butonları: 1 … 4 5 [6] 7 8 … 20  */
const getPageItems = (total: number, current: number) => {
  const items: (number | "...")[] = [];
  const push = (v: number | "...") => items.push(v);
  const windowSize = 1;
  const start = Math.max(2, current - windowSize);
  const end = Math.min(total - 1, current + windowSize);

  if (total <= 7) {
    for (let i = 1; i <= total; i++) push(i);
    return items;
  }
  push(1);
  if (start > 2) push("...");
  for (let i = start; i <= end; i++) push(i);
  if (end < total - 1) push("...");
  push(total);
  return items;
};

export default function ReferencesPage() {
  const { i18n, t } = useI18nNamespace("references", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const rawReferences = useAppSelector((state) => state.references.references);
  const references = useMemo(() => rawReferences || [], [rawReferences]);
  const loading = useAppSelector((state) => state.references.loading);
  const error = useAppSelector((state) => state.references.error);

  /* i18n bundle’ları */
  useEffect(() => {
    Object.entries(translations).forEach(([lng, resources]) => {
      if (!i18n.hasResourceBundle(lng, "references")) {
        i18n.addResourceBundle(lng, "references", resources, true, true);
      }
    });
  }, [i18n]);

  /* --- kategoriler --- */
  const categories = useMemo<MinReferencesCategory[]>(() => {
    const map = new Map<string, MinReferencesCategory>();
    references.forEach((ref) => {
      const cat = ref.category;
      if (!cat) return;
      if (typeof cat === "string") {
        if (!map.has(cat)) {
          map.set(cat, {
            _id: cat,
            name: {},
            isActive: true,
            createdAt: "",
            updatedAt: "",
          });
        }
      } else if (cat._id) {
        map.set(cat._id, {
          _id: cat._id,
          name: cat.name || {},
          isActive: (cat as any).isActive ?? true,
          createdAt: (cat as any).createdAt ?? "",
          updatedAt: (cat as any).updatedAt ?? "",
        });
      }
    });
    return Array.from(map.values());
  }, [references]);

  const grouped = useMemo(() => {
    const result: Record<string, IReferences[]> = {};
    references.forEach((ref) => {
      const catId =
        typeof ref.category === "string"
          ? ref.category
          : ref.category?._id || "none";
      if (!result[catId]) result[catId] = [];
      result[catId].push(ref);
    });
    return result;
  }, [references]);

  const noCategory = grouped["none"] || [];

  const sortedCategories = useMemo(
    () => categories.filter((cat) => grouped[cat._id]?.length),
    [categories, grouped]
  );

  const tabs = useMemo(
    () => [
      ...sortedCategories.map((cat) => ({
        key: cat._id,
        label: cat.name?.[lang] || "Untitled",
      })),
      ...(noCategory.length
        ? [
            {
              key: "none",
              label: t("references.no_category", "No Category"),
            },
          ]
        : []),
    ],
    [sortedCategories, noCategory.length, lang, t]
  );

  /* --- aktif tab, sayfa ve sayfa boyutu (hash senkron) --- */
  const [activeTab, setActiveTab] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // ilk yükleme: hash oku
  useEffect(() => {
    const { tab, p, ps } = parseHash();
    if (tabs.length === 0) return;

    const first = tabs[0].key;
    const nextTab = tab && tabs.some((t) => t.key === tab) ? tab : first;

    const total = (grouped[nextTab] || []).length;
    const initialPs = PAGE_SIZE_OPTIONS.includes((ps as any)) ? (ps as number) : 12;
    const maxP = Math.max(1, Math.ceil(total / initialPs));
    const nextP = Math.min(Math.max(1, p || 1), maxP);

    setActiveTab(nextTab);
    setPageSize(initialPs);
    setPage(nextP);
  }, [tabs, grouped]);

  // tab değişince sayfa clamp + hash
  useEffect(() => {
    if (!activeTab) return;
    const total = (grouped[activeTab] || []).length;
    const maxP = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, maxP);
    if (safePage !== page) setPage(safePage);
    setHash(activeTab, safePage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, grouped, pageSize, page]);

  // sayfa veya sayfaBoyutu değişince hash ve scroll
  useEffect(() => {
    if (!activeTab) return;
    setHash(activeTab, page, pageSize);
  }, [page, pageSize, activeTab]);

  /* --- filtre + sayfalama --- */
  const filteredRefs = useMemo(() => grouped[activeTab] || [], [activeTab, grouped]);

  const totalPages = Math.max(1, Math.ceil(filteredRefs.length / pageSize));
  const pageItems = useMemo(() => getPageItems(totalPages, page), [totalPages, page]);

  const pagedRefs = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredRefs.slice(start, end);
  }, [filteredRefs, page, pageSize]);

  /* --- render --- */
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
      <TabsWrapper>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            $active={activeTab === tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            type="button"
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsWrapper>

      {/* Toolbar: per-page + sayım */}
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
                  {/* fill + contain + overflow hidden -> taşma yok */}
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
      {filteredRefs.length > pageSize && (
        <Pagination aria-label={t("page.pagination", "Pagination")}>
          <PageBtn
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage(it as number)}
              >
                {it}
              </PageNum>
            )
          )}

          <PageBtn
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

/* Toolbar */
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
    aspect-ratio: 14 / 9;     /* 140x90 oranı */
    overflow: hidden;         /* taşma yok */
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

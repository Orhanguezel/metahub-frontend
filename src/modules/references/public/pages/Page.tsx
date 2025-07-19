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

// Minimum ReferencesCategory type'ı (dummy için)
type MinReferencesCategory = {
  _id: string;
  name: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function ReferencesPage() {
  const { i18n, t } = useI18nNamespace("references", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const rawReferences = useAppSelector((state) => state.references.references);
  const references = useMemo(() => rawReferences || [], [rawReferences]);
  const loading = useAppSelector((state) => state.references.loading);
  const error = useAppSelector((state) => state.references.error);

  // i18n yüklemesi (gerekirse)
  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "references")) {
      i18n.addResourceBundle(lng, "references", resources, true, true);
    }
  });

  // Kategorileri referanslardan topla (uniq)
  const categories = useMemo<MinReferencesCategory[]>(() => {
    const map = new Map<string, MinReferencesCategory>();
    references.forEach((ref) => {
      const cat = ref.category;
      if (!cat) return;
      if (typeof cat === "string") {
        map.set(cat, {
          _id: cat,
          name: {},
          isActive: true,
          createdAt: "",
          updatedAt: "",
        });
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

  // Çok dilli yardımcı
  const getMultiLang = useCallback(
    (obj?: Record<string, string>) =>
      obj?.[lang] || obj?.["en"] || Object.values(obj || {})[0] || "—",
    [lang]
  );

  // Kategorilere göre grupla
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

  // Kategorisiz olanlar
  const noCategory = grouped["none"] || [];

  // Sadece referanslı kategoriler
  const sortedCategories = useMemo(
    () => categories.filter((cat) => grouped[cat._id]?.length),
    [categories, grouped]
  );

  const tabs = useMemo(() => [
    ...sortedCategories.map((cat) => ({
      key: cat._id,
      label: getMultiLang(cat.name),
    })),
    ...(noCategory.length
      ? [
          {
            key: "none",
            label: t("references.no_category", "No Category"),
          },
        ]
      : []),
  ], [sortedCategories, getMultiLang, noCategory.length, t]);


  // Başlangıçta ilk tab otomatik seçilsin (useEffect ile)
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (tabs.length > 0) {
      setActiveTab((prev) => tabs.some((tab) => tab.key === prev) ? prev : tabs[0].key);
    }
  }, [tabs]);

  // Filtrelenmiş referanslar
  const filteredRefs = useMemo(() => {
    return grouped[activeTab] || [];
  }, [activeTab, grouped]);

  // --- Render ---
  if (loading) {
    return (
      <PageWrapper>
        <SkeletonGrid>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </SkeletonGrid>
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
    <ModernSection>
      <TabsWrapper>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            $active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsWrapper>
      <LogoGrid>
        {filteredRefs.length === 0 ? (
          <Empty>
            {t("references.empty_in_category", "No references in this category.")}
          </Empty>
        ) : (
          filteredRefs
            .filter((item: IReferences) => item.images?.[0]?.url)
            .map((item: IReferences) => (
              <LogoCard key={item._id}>
                <div className="logo-img-wrap">
                  <Image
                    src={item.images[0].url}
                    alt={getMultiLang(item.title) || "Logo"}
                    width={132}
                    height={88}
                    style={{ objectFit: "contain", width: "100%", height: "auto" }}
                    loading="lazy"
                  />
                </div>
              </LogoCard>
            ))
        )}
      </LogoGrid>
    </ModernSection>
  );
}

// --- Styles ---

const ModernSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.sm};
  background: ${({ theme }) => theme.colors.achievementBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  @media (max-width: 900px) {
    padding: ${({ theme }) => theme.spacings.xl} ${({ theme }) => theme.spacings.xs};
  }
  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.xs};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-14px);}
  to { opacity: 1; transform: translateY(0);}
`;

const TabsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem 1.4rem;
  margin-bottom: 2.9rem;
  justify-content: center;
  animation: ${fadeIn} 0.7s cubic-bezier(0.37, 0, 0.63, 1);
`;

const TabButton = styled.button<{ $active: boolean }>`
  position: relative;
  padding: 0.65rem 1.45rem;
  border: none;
  border-radius: 24px;
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(100deg, ${theme.colors.achievementGradientStart}, ${theme.colors.achievementGradientEnd})`
      : theme.colors.background};
  color: ${({ $active, theme }) =>
    $active ? "#fff" : theme.colors.text};
  font-weight: 700;
  font-size: 1.04rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: ${({ $active, theme }) =>
    $active
      ? `0 4px 22px 0 ${theme.colors.achievementGradientStart}29`
      : "0 2px 6px 0 rgba(40,40,50,0.05)"};
  border: 2px solid
    ${({ $active, theme }) =>
      $active
        ? theme.colors.achievementGradientStart
        : theme.colors.border};
  transition: background 0.18s, color 0.18s, box-shadow 0.24s, transform 0.15s;
  outline: none;
  transform: ${({ $active }) => ($active ? "scale(1.08)" : "scale(1)")};
  &:hover,
  &:focus-visible {
    background: ${({ theme }) =>
      `linear-gradient(95deg, ${theme.colors.achievementGradientStart}, ${theme.colors.achievementGradientEnd})`};
    color: #fff;
    box-shadow: 0 7px 22px 0 ${({ theme }) => theme.colors.achievementGradientStart}36;
    transform: scale(1.12);
  }
`;

const LogoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2.3rem 2.2rem;
  align-items: stretch;
  @media (max-width: 900px) {
    gap: 1.3rem 1rem;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
    gap: 1rem 0.8rem;
  }
  @media (max-width: 430px) {
    grid-template-columns: 1fr;
    gap: 0.9rem 0;
  }
`;

const LogoCard = styled.div`
  background: linear-gradient(110deg, #fafdff 60%, #e7f5ff 100%);
  border-radius: 22px;
  border: 1.8px solid ${({ theme }) => theme.colors.achievementGradientStart}19;
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  min-width: 150px;
  padding: 1.1rem 0.3rem;
  position: relative;
  transition:
    box-shadow 0.22s cubic-bezier(0.4, 0.12, 0.42, 1.15),
    transform 0.16s cubic-bezier(0.36,0.04,0.56,1.07),
    border 0.15s,
    background 0.15s;
  will-change: transform, box-shadow;
  cursor: pointer;

  .logo-img-wrap {
    width: 140px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    @media (max-width: 600px) {
      width: 96px;
      height: 62px;
    }
    @media (max-width: 430px) {
      width: 82vw;
      height: auto;
    }
  }

  &:hover,
  &:focus-visible {
    box-shadow: 0 12px 32px 0 ${({ theme }) => theme.colors.achievementGradientStart}25;
    border-color: ${({ theme }) => theme.colors.achievementGradientEnd};
    background: linear-gradient(110deg, #f1fbff 45%, #d1f1fd 100%);
    transform: scale(1.09) translateY(-4px);
    z-index: 2;
  }

  img {
    transition: transform 0.24s cubic-bezier(0.3, 0.52, 0.42, 0.97);
    will-change: transform;
    max-width: 92%;
    max-height: 80px;
  }

  &:hover img,
  &:focus-visible img {
    transform: scale(1.11) rotate(-2deg);
    filter: drop-shadow(0 0 12px rgba(44,153,218,0.13));
  }
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2.3rem 2.2rem;
`;

const Empty = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.13em;
  margin: 2.5rem 0 1.5rem 0;
`;
const PageWrapper = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.contentBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  max-width: 1200px;
  margin: 0 auto;
`;
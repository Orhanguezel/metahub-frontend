"use client";

import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/skill";
import { Skeleton, ErrorMessage } from "@/shared";
import type { SupportedLocale } from "@/types/common";
import type { ISkill } from "@/modules/skill/types";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";

type MinSkillCategory = {
  _id: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function SkillSection() {
  const { i18n, t } = useI18nNamespace("skill", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const rawSkill = useAppSelector((state) => state.skill.skill);
  const skill = useMemo(() => rawSkill || [], [rawSkill]);
  const loading = useAppSelector((state) => state.skill.loading);
  const error = useAppSelector((state) => state.skill.error);

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "skill")) {
      i18n.addResourceBundle(lng, "skill", resources, true, true);
    }
  });

  // Kategorileri referanslardan topla (uniq)
  const categories = useMemo<MinSkillCategory[]>(() => {
    const map = new Map<string, MinSkillCategory>();
    skill.forEach((ref: ISkill) => {
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
          description: (cat as any).description || {},
          isActive: (cat as any).isActive ?? true,
          createdAt: (cat as any).createdAt ?? "",
          updatedAt: (cat as any).updatedAt ?? "",
        });
      }
    });
    return Array.from(map.values());
  }, [skill]);

  // Skill'leri kategorilere grupla
  const grouped = useMemo(() => {
    const result: Record<string, ISkill[]> = {};
    skill.forEach((ref: ISkill) => {
      const catId =
        typeof ref.category === "string"
          ? ref.category
          : ref.category?._id || "none";
      if (!result[catId]) result[catId] = [];
      result[catId].push(ref);
    });
    return result;
  }, [skill]);

  const noCategory = grouped["none"] || [];

  const sortedCategories = useMemo(
    () => categories.filter((cat) => grouped[cat._id]?.length),
    [categories, grouped]
  );

  const tabs = useMemo(
    () => [
      ...sortedCategories.map((cat) => ({
        key: cat._id,
        label: cat.name?.[lang] || cat.name?.en || t("skill.unknown_category", "Kategori"),
        desc: cat.description?.[lang] || cat.description?.en || "",
      })),
      ...(noCategory.length
        ? [
            {
              key: "none",
              label: t("skill.no_category", "Kategorisiz"),
              desc: "",
            },
          ]
        : []),
    ],
    [sortedCategories, noCategory, lang, t]
  );

  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (tabs.length > 0) {
      setActiveTab((prev) =>
        tabs.some((tab) => tab.key === prev) ? prev : tabs[0].key
      );
    }
  }, [tabs]);

  // Filtrelenmiş & görselli (logolu) referanslar
  const filteredRefs = useMemo(() => {
    return (grouped[activeTab] || []).filter((item: ISkill) => item.images?.[0]?.url);
  }, [activeTab, grouped]);

  // Aktif tab'ın adı ve açıklaması
  const currentTab = useMemo(() => tabs.find((tab) => tab.key === activeTab), [tabs, activeTab]);
  const sectionTitle = currentTab?.label || t("page.skill.title", "Yeteneklerim");
  const sectionDesc =
    currentTab?.desc ||
    t("page.skill.desc", "Web, backend, devops ve daha fazlası...");

  // --- Render ---
  if (loading) {
    return (
      <Section>
        <SectionHead>
          <MinorTitle>{t("page.skill.minorTitle", "YETENEKLER")}</MinorTitle>
          <MainTitle>{t("page.skill.title", "Yeteneklerim")}</MainTitle>
          <Desc>{t("page.skill.desc", "Web, backend, devops ve daha fazlası...")}</Desc>
        </SectionHead>
        <SkeletonGrid>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </SkeletonGrid>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <SectionHead>
          <MinorTitle>{t("page.skill.minorTitle", "YETENEKLER")}</MinorTitle>
          <MainTitle>{t("page.skill.title", "Yeteneklerim")}</MainTitle>
        </SectionHead>
        <ErrorMessage message={error} />
      </Section>
    );
  }

  if (!skill.length) {
    return (
      <Section>
        <SectionHead>
          <MinorTitle>{t("page.skill.minorTitle", "YETENEKLER")}</MinorTitle>
          <MainTitle>{t("page.skill.title", "Yeteneklerim")}</MainTitle>
        </SectionHead>
        <Empty>{t("page.noSkill", "Hiç yetenek bulunamadı.")}</Empty>
      </Section>
    );
  }

  return (
    <Section
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.66 }}
      viewport={{ once: true }}
    >
      <SectionHead>
        <MinorTitle>{t("page.skill.minorTitle", "YETENEKLER")}</MinorTitle>
        <MainTitle>{sectionTitle}</MainTitle>
        <Desc>{sectionDesc}</Desc>
      </SectionHead>
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
            {t("skill.empty_in_category", "Bu kategoride yetenek yok.")}
          </Empty>
        ) : (
          filteredRefs.map((item: ISkill) => (
            <LogoCard key={item._id}>
              <LogoImgWrap>
                <Image
                  src={item.images[0].url}
                  alt={item.title?.[lang] || item.title?.en || "Skill"}
                  width={92}
                  height={72}
                  style={{ objectFit: "contain", width: "80px", height: "72px" }}
                  loading="lazy"
                />
                <LogoTooltip className="logo-tooltip">
                  {(item.summary?.[lang] || item.summary?.en || "").slice(0, 90)}
                </LogoTooltip>
              </LogoImgWrap>
              <LogoTitle>
                {item.title?.[lang] || item.title?.en || "Skill"}
              </LogoTitle>
            </LogoCard>
          ))
        )}
      </LogoGrid>
    </Section>
  );
}

// --- THEME-ADAPTED STYLES ---

const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xxl};
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  box-sizing: border-box;
  @media (max-width: 900px) {
    padding: ${({ theme }) => theme.spacings.xl} 0;
  }
  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacings.lg} 0 ${({ theme }) => theme.spacings.xl} 0;
  }
`;

const SectionHead = styled.div`
  width: 100%;
  margin: 0 0 2.2rem 0;
  padding-left: ${({ theme }) => theme.spacings.xl};
  box-sizing: border-box;
  text-align: left;

  @media (max-width: 900px) {
    padding-left: ${({ theme }) => theme.spacings.md};
  }
  @media (max-width: 600px) {
    padding-left: ${({ theme }) => theme.spacings.sm};
    margin-bottom: 1.1rem;
    text-align: center;
  }
`;

const MinorTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.21em;
`;

const MainTitle = styled.h2`
  font-size: clamp(2.2rem, 3.3vw, 2.7rem);
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin: 0 0 0.23em 0;
  letter-spacing: -0.01em;
  line-height: 1.13;
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.7;
  margin-bottom: 0.7rem;
  max-width: 510px;
  opacity: 0.93;
  padding-right: 2vw;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-16px);}
  to { opacity: 1; transform: translateY(0);}
`;

const TabsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem 1.1rem;
  margin: 0 0 1.9rem 0;
  justify-content: center;
  animation: ${fadeIn} 0.7s cubic-bezier(0.37, 0, 0.63, 1);
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.48em 1.32em;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: ${({ $active, theme }) => $active ? theme.borders.thick : theme.borders.thin} ${({ theme }) => theme.colors.achievementGradientEnd};
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(100deg, ${theme.colors.achievementGradientStart} 50%, ${theme.colors.achievementGradientEnd} 100%)`
      : theme.colors.backgroundAlt};
  color: ${({ $active, theme }) =>
    $active ? "#fff" : theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  letter-spacing: 0.02em;
  box-shadow: ${({ $active, theme }) =>
    $active
      ? `0 3px 14px 0 ${theme.colors.achievementGradientEnd}1a`
      : "0 1px 3px 0 rgba(25,214,227,0.03)"};
  cursor: pointer;
  outline: none;
  transition:
    background 0.18s,
    color 0.18s,
    box-shadow 0.22s,
    transform 0.15s,
    border 0.12s;
  transform: ${({ $active }) => ($active ? "scale(1.07)" : "scale(1)")};
  &:hover,
  &:focus-visible {
    background: linear-gradient(
      105deg,
      ${({ theme }) => theme.colors.achievementGradientEnd},
      ${({ theme }) => theme.colors.achievementGradientStart}
    );
    color: #fff;
    box-shadow: 0 7px 18px 0 ${({ theme }) => theme.colors.achievementGradientEnd}18;
    transform: scale(1.10);
  }
`;

const LogoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
  gap: 1.1rem 1rem;
  align-items: stretch;
  width: 100%;
  justify-items: center;

  @media (max-width: 900px) {
    gap: 0.8rem 0.7rem;
  }
  @media (max-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.32rem 0.35rem;
  }
  @media (max-width: 400px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.21rem 0.21rem;
  }
`;

const LogoCard = styled.div`
  background: linear-gradient(120deg, #22344a 55%, #19d6e3 100%);
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1.5px solid ${({ theme }) => theme.colors.achievementGradientEnd}11;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 122px;
  min-width: 125px;
  padding: 0.38rem 0.04rem 0.31rem 0.04rem;
  position: relative;
  transition:
    box-shadow 0.21s cubic-bezier(0.4, 0.12, 0.42, 1.15),
    transform 0.13s cubic-bezier(0.36,0.04,0.56,1.07),
    border 0.12s,
    background 0.11s;
  will-change: transform, box-shadow;
  cursor: pointer;
  overflow: visible;

  &:hover,
  &:focus-visible {
    box-shadow: 0 8px 22px 0 ${({ theme }) => theme.colors.achievementGradientEnd}1a;
    border-color: ${({ theme }) => theme.colors.achievementGradientEnd};
    background: linear-gradient(110deg, #1b2838 38%, #19d6e3 90%);
    transform: scale(1.08) translateY(-2px);
    z-index: 2;
    
    .logo-tooltip {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }
  }
`;

const LogoImgWrap = styled.div`
  width: 56px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.18rem;
  position: relative;
  @media (max-width: 600px) {
    width: 42px;
    height: 28px;
  }
`;

const LogoTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-family: ${({ theme }) => theme.fonts.main};
  color: ${({ theme }) => theme.colors.textAlt};
  text-align: center;
  margin-top: 0.08em;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.01em;
  opacity: 0.87;
  user-select: text;
`;

// Tooltip hover açıklama
const LogoTooltip = styled.div`
  position: absolute;
  left: 50%;
  top: 110%;
  transform: translateX(-50%) translateY(10px);
  min-width: 140px;
  max-width: 200px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 0.54em 0.93em;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-family: ${({ theme }) => theme.fonts.body};
  opacity: 0;
  pointer-events: none;
  z-index: 10;
  white-space: pre-line;
  line-height: 1.43;
  transition: all 0.18s;
  text-align: left;

  @media (max-width: 600px) {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    min-width: 90px;
    max-width: 140px;
    padding: 0.32em 0.44em;
  }
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
  gap: 1.1rem 1rem;
`;

const Empty = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.12em;
  margin: 1.1rem 0 0.7rem 0;
`;


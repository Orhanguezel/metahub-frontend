"use client";

import styled from "styled-components";
import Link from "next/link";
import translations from "@/modules/skill/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage, SeeAllBtn } from "@/shared";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";

// --- Lokal yardımcılar ---
const getTitle = (item: any, lang: SupportedLocale) =>
  item?.title?.[lang] || item?.title?.en || Object.values(item?.title || {})[0] || "";

const getSummary = (item: any, lang: SupportedLocale) =>
  item?.summary?.[lang] ||
  (item?.content?.[lang] ? item.content[lang].slice(0, 120) + "…" : "");

const getLocaleStringFromLang = (lang: SupportedLocale) => {
  switch (lang) {
    case "tr":
      return "tr-TR";
    case "de":
      return "de-DE";
    case "en":
      return "en-US";
    default:
      return lang;
  }
};

export default function SkillSection() {
  const { i18n, t } = useI18nNamespace("skill", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { skill, loading, error } = useAppSelector((state) => state.skill);

  if (loading) {
    return (
      <Section>
        <SkillGrid>
          <Left>
            <Skeleton />
            <Skeleton />
          </Left>
          <Right>
            <Skeleton />
            <Skeleton />
          </Right>
        </SkillGrid>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <SkillGrid>
          <ErrorMessage message={error} />
        </SkillGrid>
      </Section>
    );
  }

  if (!Array.isArray(skill) || skill.length === 0) {
    return (
      <Section>
        <SkillGrid>
          <Left>
            <MainTitle>{t("page.skill.title", "Bizden Haberler")}</MainTitle>
            <Desc>{t("page.skill.noSkill", "Haber bulunamadı.")}</Desc>
            <SeeAllBtn href="/skill">
              {t("page.skill.all", "Tüm Haberler")}
            </SeeAllBtn>
          </Left>
        </SkillGrid>
      </Section>
    );
  }

  // --- Main + 3 small items ---
  const main = skill[0];
  const others = skill.slice(1, 4);

  return (
    <Section
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.66 }}
      viewport={{ once: true }}
    >
      <SkillGrid>
        {/* SOL BLOK */}
        <Left>
          <MinorTitle>{t("page.skill.minorTitle", "NEWS")}</MinorTitle>
          <StyledLink
            href={`/skill/${main.slug}`}
            aria-label={getTitle(main, lang) || "Untitled"}
          >
            {getTitle(main, lang) || t("page.skill.title", "Bizden Haberler")}
          </StyledLink>
          <Desc>
            {getSummary(main, lang) || "—"}
          </Desc>
          <MainImageWrap as={Link} href={`/skill/${main.slug}`}>
            {main.images?.[0]?.url ? (
              <MainImage
                src={main.images[0].url}
                alt={getTitle(main, lang) || "Untitled"}
                width={500}
                height={210}
                style={{ objectFit: "cover" }}
                priority
              />
            ) : (
              <ImgPlaceholder />
            )}
          </MainImageWrap>
          <SeeAllBtn href="/skill">
            {t("page.skill.all", "Tüm Haberler")}
          </SeeAllBtn>
        </Left>

        {/* SAĞ BLOK - DİĞER HABERLER */}
        <Right>
          {others.map((item) => (
            <SkillCard key={item._id} as={motion.article}>
              <CardImageWrap as={Link} href={`/skill/${item.slug}`}>
                {item.images?.[0]?.url ? (
                  <CardImage
                    src={item.images[0].url}
                    alt={getTitle(item, lang)}
                    width={90}
                    height={56}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <ImgPlaceholder />
                )}
              </CardImageWrap>
              <CardBody>
                <CardTitle as={Link} href={`/skill/${item.slug}`}>
                  {getTitle(item, lang)}
                </CardTitle>
                <CardExcerpt>
                  {getSummary(item, lang).slice(0, 72)}
                </CardExcerpt>
                <CardDate>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString(
                        getLocaleStringFromLang(lang),
                        { year: "numeric", month: "short", day: "2-digit" }
                      )
                    : ""}
                </CardDate>
              </CardBody>
            </SkillCard>
          ))}
        </Right>
      </SkillGrid>
    </Section>
  );
}

// --- STYLES ---

const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xxl};
  width: 100%;
`;

const SkillGrid = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  gap: 2.6rem;
  align-items: flex-start;
  padding: 0 ${({ theme }) => theme.spacings.xl};
  flex-wrap: wrap;

  ${({ theme }) => theme.media.medium} {
    padding: 0 ${({ theme }) => theme.spacings.md};
    gap: 2rem;
  }

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    gap: 2.5rem;
    padding: 0 ${({ theme }) => theme.spacings.sm};
    align-items: center;
  }
`;

const Left = styled.div`
  flex: 1.2 1 390px;
  min-width: 320px;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1.12rem;
  justify-content: flex-start;
  ${({ theme }) => theme.media.small} {
    max-width: 100%;
    align-items: center;
    text-align: center;
    gap: 2rem;
  }
`;

const MinorTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const MainTitle = styled.h2`
  font-size: clamp(2.2rem, 3.3vw, 2.7rem);
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin: 0 0 0.45em 0;
  letter-spacing: -0.01em;
  line-height: 1.13;
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(2.2rem, 3.3vw, 2.7rem);
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  letter-spacing: -0.01em;
  line-height: 1.13;
  text-decoration: none;
  margin: 0 0 0.45em 0;
  display: inline-block;
  transition: color 0.2s;
  &:hover, &:focus-visible {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
  }
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.7;
  margin-bottom: 0.7rem;
`;

const MainImageWrap = styled(Link)`
  width: 100%;
  max-width: 520px;
  min-height: 190px;
  max-height: 270px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  overflow: hidden;
  box-shadow: 0 8px 30px 0 rgba(40,117,194,0.16), ${({ theme }) => theme.shadows.lg};
  margin-bottom: 1.2rem;
  position: relative;
  isolation: isolate;
  cursor: pointer;
  display: block;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(120deg, rgba(40,117,194,0.07) 12%, rgba(11,182,214,0.06) 100%);
    z-index: 1;
  }

  &:hover, &:focus-visible {
    box-shadow: 0 12px 38px 0 rgba(40,117,194,0.25), ${({ theme }) => theme.shadows.xl};
    transform: scale(1.025);
  }

  ${({ theme }) => theme.media.small} {
    width: 100%;
    min-width: 140px;
    min-height: 110px;
    height: auto;
    margin: 0 auto 0.6rem auto;
  }
`;

const MainImage = styled(Image)`
  width: 100%;
  object-fit: cover;
  display: block;
  position: relative;
  z-index: 2;
`;

const ImgPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  min-height: 170px;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.36;
`;

const Right = styled.div`
  flex: 1.1 1 320px;
  min-width: 270px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1.45rem;
  ${({ theme }) => theme.media.small} {
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
`;

const SkillCard = styled(motion.div)`
  width: 100%;
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: 0 8px 30px 0 rgba(40,117,194,0.10);
  overflow: hidden;
  display: flex;
  flex-direction: row;
  min-height: 86px;
  max-width: 390px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: box-shadow 0.16s, transform 0.11s;
  &:hover {
    box-shadow: 0 14px 36px 0 rgba(40,117,194,0.17);
    transform: scale(1.024) translateY(-2px);
  }
`;

const CardImageWrap = styled(Link)`
  min-width: 72px;
  width: 72px;
  height: 56px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

const CardImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CardBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0.7rem 0.8rem 0.7rem 0.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.01rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.25rem;
  line-height: 1.15;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardExcerpt = styled.p`
  font-size: 0.93rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.56rem;
  opacity: 0.98;
  line-height: 1.37;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  min-height: 2em;
`;

const CardDate = styled.span`
  background: linear-gradient(90deg, #2875c2 50%, #0bb6d6 100%);
  color: #fff;
  font-size: 0.91em;
  padding: 0.13em 0.62em;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 3px 8px 0 rgba(40,117,194,0.08);
  letter-spacing: 0.01em;
  margin-top: auto;
  margin-right: 7px;
`;

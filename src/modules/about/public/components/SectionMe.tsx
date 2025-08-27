import styled from "styled-components";
import translations from "@/modules/about/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, SeeAllBtn } from "@/shared";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";

export default function AboutSection() {
  const { i18n, t } = useI18nNamespace("about", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "about")) {
      i18n.addResourceBundle(lng, "about", resources, true, true);
    }
  });

  const { about, loading, error } = useAppSelector((state) => state.about);

  if (loading) {
    return (
      <Section>
        <AboutGrid>
          <Left>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </Left>
          <Right>
            <Skeleton />
          </Right>
        </AboutGrid>
      </Section>
    );
  }

  if (error || !Array.isArray(about) || about.length === 0) {
    return (
      <Section>
        <AboutGrid>
          <Left>
            <MainTitle>{t("page.about.allAboutMe", "Ben Kimim")}</MainTitle>
            <Desc>{t("about.about.empty", "Hakkımda içeriği bulunamadı.")}</Desc>
          </Left>
        </AboutGrid>
      </Section>
    );
  }

  const main = about[0];
  const imageUrl = main?.images?.[0]?.url;

  return (
    <Section
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.66 }}
      viewport={{ once: true }}
    >
      <AboutGrid>
        {/* SOL BLOK */}
        <Left>
          <MinorTitle>{t("page.about.minorTitleMe", "HAKKIMDA")}</MinorTitle>
          <MainTitle>{main?.title?.[lang] || main?.title?.en || "-"}</MainTitle>
          <Desc>{main?.summary?.[lang] || main?.summary?.en || "-"}</Desc>
          <SeeAllBtn href={`/aboutme/${main._id || "about"}`}>
            {t("page.about.all", "Daha Fazla Bilgi")}
          </SeeAllBtn>
        </Left>
        {/* SAĞ BLOK */}
        <Right>
          <ImageCard>
            <StyledImage
              src={imageUrl}
              alt={main.title?.[lang] || "About me"}
              fill
  sizes="(max-width: 600px) 50vw, 135px"
            />
          </ImageCard>
        </Right>
      </AboutGrid>
    </Section>
  );
}

// --- STYLES ---
const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xxl};
  width: 100%;
`;


const AboutGrid = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacings.xl};

  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0 ${({ theme }) => theme.spacings.sm};
    text-align: center;
  }
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  justify-content: center;

  ${({ theme }) => theme.media.small} {
    align-items: center;
    text-align: center;
    gap: 1rem;
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

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.7;
  margin-bottom: 1.8rem;
`;

const Right = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImageCard = styled.div`
  width: 270px;
  height: 270px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.circle};
  overflow: hidden;
  box-shadow: 0 8px 32px 0 ${({ theme }) => theme.colors.shadowHighlight};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: box-shadow 0.32s, transform 0.3s;
  &:hover {
    box-shadow: 0 12px 42px 0 ${({ theme }) => theme.colors.primaryTransparent};
    transform: scale(1.025);
  }
  ${({ theme }) => theme.media.small} {
    margin: 0 auto;
  }
`;

const StyledImage = styled(Image)`
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.circle};
  border: 4px solid ${({ theme }) => theme.colors.primary};
`;


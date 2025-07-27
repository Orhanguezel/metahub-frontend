import styled from "styled-components";
import Link from "next/link";
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
            <MainTitle>{t("page.about.allAboutMe", "Hakkımda")}</MainTitle>
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

        {/* SAĞ BLOK - SADECE ANA GÖRSEL VARSA */}
  {imageUrl && (
    <Right>
      <MainImageWrap href={`/aboutme/${main._id}`}>
        <MainImage
          src={imageUrl}
          alt={main.title?.[lang] || "About"}
          fill
          priority
        />
      </MainImageWrap>
    </Right>
  )}
</AboutGrid>
    </Section>
  );
}


// --- STYLES ---
const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xl} 0 ${({ theme }) => theme.spacings.xl};
  width: 100%;
`;

const AboutGrid = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 0 ${({ theme }) => theme.spacings.xl};

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    gap: 1.2rem;
    padding: 0 ${({ theme }) => theme.spacings.sm};
    align-items: center;
  }
`;


const Left = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;

  ${({ theme }) => theme.media.small} {
    width: 100%;
    align-items: center;
    text-align: center;
    gap: 0;
    margin-bottom: 0;
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
  line-height: 1.5; /* 🔽 Daha sıkı line spacing */
  margin-bottom: 0; /* 🔽 DÜŞÜRÜLDÜ */
`;

const Right = styled.div`
  flex: 1 1 320px;
  display: flex;
  justify-content: flex-end;

  ${({ theme }) => theme.media.small} {
    width: 100%;
    justify-content: center;
    margin-top: 0;
    padding: 0;
    flex: unset;
    align-items: center;
  }
`;





const MainImageWrap = styled(Link)`
  position: relative;
  width: 100%;
  max-width: 360px;
  aspect-ratio: 16 / 10;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: block;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  }

  ${({ theme }) => theme.media.small} {
    max-width: 100%;
    margin: 0 auto;
    aspect-ratio: 16 / 10;
  }
`;


const MainImage = styled(Image)`
  object-fit: cover;
  z-index: 1;
`;

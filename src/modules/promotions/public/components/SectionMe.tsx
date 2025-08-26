import styled from "styled-components";
import translations from "@/modules/promotions/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, SeeAllBtn } from "@/shared";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";

export default function PromotionsSection() {
  const { i18n, t } = useI18nNamespace("promotions", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "promotions")) {
      i18n.addResourceBundle(lng, "promotions", resources, true, true);
    }
  });

  const { promotions, loading, error } = useAppSelector((state) => state.promotions);

  if (loading) {
    return (
      <Section>
        <PromotionsGrid>
          <Left>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </Left>
          <Right>
            <Skeleton />
          </Right>
        </PromotionsGrid>
      </Section>
    );
  }

  if (error || !Array.isArray(promotions) || promotions.length === 0) {
    return (
      <Section>
        <PromotionsGrid>
          <Left>
            <MainTitle>{t("page.promotions.allPromotionsMe", "Ben Kimim")}</MainTitle>
            <Desc>{t("promotions.promotions.empty", "Hakkımda içeriği bulunamadı.")}</Desc>
          </Left>
        </PromotionsGrid>
      </Section>
    );
  }

  const main = promotions[0];
  const imageUrl = main?.images?.[0]?.url;

  return (
    <Section
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.66 }}
      viewport={{ once: true }}
    >
      <PromotionsGrid>
        {/* SOL BLOK */}
        <Left>
          <MinorTitle>{t("page.promotions.minorTitleMe", "HAKKIMDA")}</MinorTitle>
          <MainTitle>{main?.title?.[lang] || main?.title?.en || "-"}</MainTitle>
          <Desc>{main?.summary?.[lang] || main?.summary?.en || "-"}</Desc>
          <SeeAllBtn href={`/promotionsme/${main._id || "promotions"}`}>
            {t("page.promotions.all", "Daha Fazla Bilgi")}
          </SeeAllBtn>
        </Left>
        {/* SAĞ BLOK */}
        <Right>
          <ImageCard>
            <StyledImage
              src={imageUrl}
              alt={main.title?.[lang] || "Promotions me"}
              fill
  sizes="(max-width: 600px) 50vw, 135px"
            />
          </ImageCard>
        </Right>
      </PromotionsGrid>
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


const PromotionsGrid = styled.div`
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
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.2em;
`;

const MainTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin: 0 0 0.2em 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.body};
  line-height: 1.55;
  margin-bottom: 0.4em;
  max-width: 560px;
  ${({ theme }) => theme.media.small} {
    max-width: 100%;
  }
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


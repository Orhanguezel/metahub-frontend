import styled from "styled-components";
import Link from "next/link";
import translations from "@/modules/about/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage,SeeAllBtn } from "@/shared";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import { FaChartLine, FaLightbulb } from "react-icons/fa"; // Sadece iki ikon!

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

  if (error) {
    return (
      <Section>
        <AboutGrid>
          <ErrorMessage />
        </AboutGrid>
      </Section>
    );
  }

  if (!about || about.length === 0) {
    return (
      <Section>
        <AboutGrid>
          <Left>
            <MainTitle>{t("page.about.allAbout", "Hakkımızda")}</MainTitle>
            <Desc>{t("about.about.empty", "Hakkında içeriği bulunamadı.")}</Desc>
          </Left>
        </AboutGrid>
      </Section>
    );
  }

  // --- MAIN: Ensotek Su Soğutma Kuleleri ---
  const main = about[2]; // veya slug'a göre bulabilirsin: about.find(x => x.slug === "ensotek-su-sogutma-kuleleri")
  // --- Sadece iki kart: Vizyonumuz, Misyonumuz ---
  const featuresData = [about[0], about[1]];

  const icons = [
    <FaChartLine size={32} color="#2875c2" />,
    <FaLightbulb size={32} color="#2875c2" />,
  ];

  // Kartlar (Vizyon & Misyon)
  const features = featuresData.map((item, i) => ({
    icon: icons[i],
    title: item?.title?.[lang] || item?.title?.en || "-",
    summary: item?.summary?.[lang] || item?.summary?.en || "-",
    slug: item.slug,
  }));

  // --- YAN GÖRSELLER ---
  const rightImages = about
    .filter((item) => item.slug !== main.slug)
    .slice(0, 2);

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
          <MinorTitle>{t("page.about.minorTitle", "HAKKIMIZDA")}</MinorTitle>
          <MainTitle>
            {main.title?.[lang] || main.title?.en || t("page.about.title", "Ensotek Hakkında")}
          </MainTitle>
          <Desc>
            {main.summary?.[lang] || main.summary?.en || ""}
          </Desc>
          <Features>
            {features.map((item, i) => (
              <Feature key={i}>
                <IconWrap>{item.icon}</IconWrap>
                <FeatureText>
                  <FeatureTitle>{item.title}</FeatureTitle>
                  <FeatureDesc>{item.summary}</FeatureDesc>
                </FeatureText>
              </Feature>
            ))}
          </Features>
          <SeeAllBtn href="/about">
            {t("page.about.all", "Daha Fazla Bilgi")}
          </SeeAllBtn>
        </Left>

        {/* SAĞ BLOK - GÖRSEL + küçük resimler */}
        <Right>
          <MainImageWrap as={Link} href={`/about/${main.slug}`}>
            {main.images?.[0]?.url && (
              <MainImage
                src={main.images[0].url}
                alt={main.title?.[lang] || "About"}
                width={330}
                height={210}
                style={{ objectFit: "cover"}}
                priority
              />
            )}
          </MainImageWrap>
          <StackedImages>
            {rightImages.map((item, idx) =>
              item.images?.[0]?.url ? (
                <StackedImageLink key={idx} href={`/about/${item.slug}`}>
                  <StackedImage
                    src={item.images[0].url}
                    alt={item.title?.[lang] || "About"}
                    width={135}
                    height={90}
                    style={{
                      objectFit: "cover",
                      marginTop: idx === 1 ? "12px" : "0"
                    }}
                    loading="lazy"
                  />
                </StackedImageLink>
              ) : null
            )}
          </StackedImages>
        </Right>
      </AboutGrid>
    </Section>
  );
}

const StackedImageLink = styled(Link)`
  display: block;
  overflow: hidden;
  cursor: pointer;

  &:hover img,
  &:focus-visible img {
    box-shadow: 0 7px 32px 0 rgba(40,117,194,0.14);
    transform: scale(1.055);
    outline: none;
  }
`;

// Diğer styled'lar aynı!


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
  display: flex;
  gap: 2.8rem;
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
  flex: 1.1 1 440px;
  min-width: 440px;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
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

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.7;
  margin-bottom: 1.8rem;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.2rem 1.3rem;
  margin: 2.5rem 0 1.3rem 0;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 1.3rem;
    margin: 1.4rem 0 0.7rem 0;
  }
`;

const Feature = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.12rem;
  background: ${({ theme }) => theme.colors.cardBackground || "#fff"};
  border: 1.5px solid ${({ theme }) => theme.colors.borderLight || "#f1f3f8"};
  box-shadow: 0 2px 14px 0 rgba(40,117,194,0.07);
  padding: 1.45rem 1.1rem 1.15rem 1.15rem;
  min-height: 145px;
  transition: box-shadow 0.17s, transform 0.16s, border-color 0.15s;
  cursor: pointer;

  &:hover, &:focus-visible {
    box-shadow: 0 8px 26px 0 rgba(40,117,194,0.13);
    transform: translateY(-5px) scale(1.032);
    border-color: ${({ theme }) => theme.colors.primaryTransparent};
    outline: none;
  }
`;

const IconWrap = styled.div`
  min-width: 44px;
  min-height: 44px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primaryTransparent} 40%,
    ${({ theme }) => theme.colors.backgroundAlt} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.xs};
  font-size: 1.8rem;
`;

const FeatureText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* clamp için */
`;

const FeatureTitle = styled.h3`
  font-size: 1.14rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 0.21rem;
  line-height: 1.2;
  white-space: pre-line;
`;

const FeatureDesc = styled.div`
  font-size: 0.97rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.95;
  line-height: 1.55;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;    /* En fazla 3 satır! */
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  min-height: 2.7em;
`;

const Right = styled.div`
  flex: 1.5 1 320px;
  min-width: 270px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1.7rem;

  ${({ theme }) => theme.media.small} {
    width: 100%;
    max-width: 420px; /* Mobilde çok genişlemesin */
    margin: 0 auto;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
`;

const MainImageWrap = styled(Link)`
  width: 340px;
  height: 220px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  overflow: hidden;
  box-shadow: 0 8px 30px 0 rgba(40,117,194,0.16), ${({ theme }) => theme.shadows.lg};
  margin-bottom: 0.8rem;
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
    max-width: 340px;
    min-width: 170px;
    height: 175px;
    margin: 0 auto 0.5rem auto;
  }
`;

const MainImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  position: relative;
  z-index: 2;
`;

const StackedImages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.15rem;

  ${({ theme }) => theme.media.small} {
    width: 100%;
    max-width: 340px;
    flex-direction: row;
    justify-content: center;
    gap: 0.85rem;
  }
`;

const StackedImage = styled(Image)`
  width: 110px;
  height: 72px;
  object-fit: cover;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: 0 2px 14px 0 rgba(40,117,194,0.07);
  transition: box-shadow 0.17s, transform 0.15s;
  cursor: pointer;

  &:hover, &:focus-visible {
    box-shadow: 0 7px 32px 0 rgba(40,117,194,0.14);
    transform: scale(1.055);
    outline: none;
  }

  ${({ theme }) => theme.media.small} {
    width: 50%;
    max-height: 120px;
  }
`;


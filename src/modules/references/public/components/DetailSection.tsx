"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import {translations} from "@/modules/references";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import Link from "next/link";
import Image from "next/image";
import { Skeleton, ErrorMessage } from "@/shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearReferencesMessages,
  fetchReferencesBySlug,
  setSelectedReferences,
} from "@/modules/references/slice/referencesSlice";
import type { IReferences } from "@/modules/references";
import type { SupportedLocale } from "@/types/common";

export default function ReferencesDetailSection() {
  const { i18n, t } = useI18nNamespace("references", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { slug } = useParams() as { slug: string };
  const dispatch = useAppDispatch();

  // Locale dosyalarını i18n'e yükle
  Object.entries(translations).forEach(([locale, resources]) => {
    if (!i18n.hasResourceBundle(locale, "references")) {
      i18n.addResourceBundle(locale, "references", resources, true, true);
    }
  });

  const {
    selected: references,
    references: allReferences,
    loading,
    error,
  } = useAppSelector((state) => state.references);

  useEffect(() => {
    if (allReferences && allReferences.length > 0) {
      const found = allReferences.find((item: IReferences) => item.slug === slug);
      if (found) {
        dispatch(setSelectedReferences(found));
      } else {
        dispatch(fetchReferencesBySlug(slug));
      }
    } else {
      dispatch(fetchReferencesBySlug(slug));
    }
    return () => {
      dispatch(clearReferencesMessages());
    };
  }, [dispatch, allReferences, slug]);

  if (loading) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  if (error || !references) {
    return (
      <Container>
        <ErrorMessage />
      </Container>
    );
  }

  const otherReferences = allReferences.filter((item: IReferences) => item.slug !== slug);

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{references.title?.[lang] || t("page.noTitle", "Başlık yok")}</Title>

      {references.images?.[0]?.url && (
        <ImageWrapper>
          <Image
            src={references.images[0].url}
            alt={references.title?.[lang] || ""}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto", objectFit: "cover" }}
          />
        </ImageWrapper>
      )}

      {references.content?.[lang] && (
        <ContentBox>
          <h3>{t("page.detail")}</h3>
          <div dangerouslySetInnerHTML={{ __html: references.content[lang] }} />
        </ContentBox>
      )}

      {otherReferences?.length > 0 && (
  <OtherSection>
    <h3>{t("page.other")}</h3>
    <LogoGrid>
      {otherReferences.map((item: IReferences) => (
        <LogoCard key={item._id}>
          <Link href={`/references/${item.slug}`}>
            <LogoImageWrapper>
              {item.images?.[0]?.url && (
                <Image
                  src={item.images[0].url}
                  alt={item.title?.[lang] || ""}
                  width={120}
                  height={64}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "64px",
                  }}
                  sizes="(max-width: 600px) 50vw, 120px"
                />
              )}
            </LogoImageWrapper>
            <LogoTitle>{item.title?.[lang]}</LogoTitle>
          </Link>
        </LogoCard>
      ))}
    </LogoGrid>
  </OtherSection>
)}

    </Container>
  );
}

// --------- STYLES -----------
const Container = styled(motion.section)`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl}
    ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const ImageWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radii.sm};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;


const ContentBox = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  h3 {
    margin-bottom: ${({ theme }) => theme.spacings.md};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const OtherSection = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xxl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacings.lg};
`;
const LogoGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${({ theme }) => theme.spacings.md};
  padding: 0;
  margin: 0;
  list-style: none;
`;

const LogoCard = styled.li`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.xs};
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.18s;
  min-height: 110px;

  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: inherit;
    width: 100%;
    height: 100%;

    &:hover {
      box-shadow: ${({ theme }) => theme.shadows.md};
      background: ${({ theme }) => theme.colors.primaryTransparent};
    }
  }
`;

const LogoImageWrapper = styled.div`
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  background: #fff;
`;

const LogoTitle = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-weight: 500;
  line-height: 1.25;
  min-height: 36px;
`;

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

  const otherReferences = allReferences.filter((item: IReferences) => item.slug !== slug).slice(0, 2);

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
          <OtherList>
            {otherReferences.map((item: IReferences) => (
              <OtherItem key={item._id}>
                <Link href={`/references/${item.slug}`}>{item.title?.[lang]}</Link>
              </OtherItem>
            ))}
          </OtherList>
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

const OtherList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const OtherItem = styled.li`
  font-size: ${({ theme }) => theme.fontSizes.base};
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import {translations} from "@/modules/about";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import Link from "next/link";
import Image from "next/image";
import { Skeleton, ErrorMessage } from "@/shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearAboutMessages,
  fetchAboutBySlug,
  setSelectedAbout,
} from "@/modules/about/slice/aboutSlice";
import { CommentForm, CommentList } from "@/modules/comment";
import type { IAbout } from "@/modules/about";
import type { SupportedLocale } from "@/types/common";

export default function AboutDetailSection() {
  const { i18n, t } = useI18nNamespace("about", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { slug } = useParams() as { slug: string };
  const dispatch = useAppDispatch();

  // Locale dosyalarını i18n'e yükle
  Object.entries(translations).forEach(([locale, resources]) => {
    if (!i18n.hasResourceBundle(locale, "about")) {
      i18n.addResourceBundle(locale, "about", resources, true, true);
    }
  });

  const {
    selected: about,
    about: allAbout,
    loading,
    error,
  } = useAppSelector((state) => state.about);

  useEffect(() => {
    if (allAbout && allAbout.length > 0) {
      const found = allAbout.find((item: IAbout) => item.slug === slug);
      if (found) {
        dispatch(setSelectedAbout(found));
      } else {
        dispatch(fetchAboutBySlug(slug));
      }
    } else {
      dispatch(fetchAboutBySlug(slug));
    }
    return () => {
      dispatch(clearAboutMessages());
    };
  }, [dispatch, allAbout, slug]);

  if (loading) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  if (error || !about) {
    return (
      <Container>
        <ErrorMessage />
      </Container>
    );
  }

  const otherAbout = allAbout.filter((item: IAbout) => item.slug !== slug).slice(0, 2);

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{about.title?.[lang] || t("page.noTitle", "Başlık yok")}</Title>

      {about.images?.[0]?.url && (
        <ImageWrapper>
          <Image
            src={about.images[0].url}
            alt={about.title?.[lang] || ""}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto", objectFit: "cover" }}
          />
        </ImageWrapper>
      )}

      {about.summary?.[lang] && (
        <SummaryBox>
          <h3>{t("page.summary")}</h3>
          <div>{about.summary?.[lang]}</div>
        </SummaryBox>
      )}

      {about.content?.[lang] && (
        <ContentBox>
          <h3>{t("page.detail")}</h3>
          <div dangerouslySetInnerHTML={{ __html: about.content[lang] }} />
        </ContentBox>
      )}

      {otherAbout?.length > 0 && (
        <OtherSection>
          <h3>{t("page.other")}</h3>
          <OtherList>
            {otherAbout.map((item: IAbout) => (
              <OtherItem key={item._id}>
                <Link href={`/about/${item.slug}`}>{item.title?.[lang]}</Link>
              </OtherItem>
            ))}
          </OtherList>
        </OtherSection>
      )}
      <CommentForm contentId={about._id} contentType="about" />
      <CommentList contentId={about._id} contentType="about" />
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

const SummaryBox = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
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

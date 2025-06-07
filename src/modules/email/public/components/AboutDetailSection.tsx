"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useTranslation } from "../../../../../node_modules/react-i18next";
import Link from "next/link";
import { Skeleton, ErrorMessage } from "@/shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAbout, fetchAboutBySlug } from "@/modules/about/slice/aboutSlice";

export default function AboutDetailSection() {
  const { slug } = useParams() as { slug: string };
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("about");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const {
    selected,
    about: aboutList,
    loading,
    error,
  } = useAppSelector((state) => state.about);

  useEffect(() => {
    dispatch(fetchAboutBySlug(slug));
    dispatch(fetchAbout(lang));
  }, [dispatch, slug, lang]);

  const others = aboutList.filter((item) => item.slug !== slug).slice(0, 2);

  if (loading)
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  if (error || !selected)
    return (
      <Container>
        <ErrorMessage />
      </Container>
    );

  const { title, detailedDescription, shortDescription, content, images } =
    selected;
  const description =
    detailedDescription?.[lang] ||
    content?.[lang] ||
    shortDescription?.[lang] ||
    "";

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{title?.[lang]}</Title>

      {images?.[0]?.url && (
        <ImageWrapper>
          <img src={images[0].url} alt={title?.[lang]} />
        </ImageWrapper>
      )}

      <Content dangerouslySetInnerHTML={{ __html: description }} />

      {!!others.length && (
        <OtherSection>
          <h3>{t("page.other", "Other Sections")}</h3>
          <OtherList>
            {others.map((item) => (
              <OtherItem key={item._id}>
                <Link href={`/about/${item.slug}`}>{item.title?.[lang]}</Link>
              </OtherItem>
            ))}
          </OtherList>
        </OtherSection>
      )}
    </Container>
  );
}

const Container = styled(motion.section)`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl}
    ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const ImageWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radii.sm};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const Content = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.7;
  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const OtherSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xxl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

const OtherList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
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

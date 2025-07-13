"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import i18n from "@/i18n";
import translations from "../../locales";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import { Skeleton, ErrorMessage } from "@/shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearServicesMessages,
  fetchServicesBySlug,
  setSelectedServices,
} from "@/modules/services/slice/servicesSlice";
import { CommentForm, CommentList } from "@/modules/comment";
import { getCurrentLocale } from "@/utils/getCurrentLocale";
import type { IServices } from "@/modules/services";

export default function ServicesDetailSection() {
  const { slug } = useParams() as { slug: string };
  const { t } = useTranslation("services");
  const dispatch = useAppDispatch();
  const lang = getCurrentLocale();

  // Locale dosyalarını i18n'e yükle
  Object.entries(translations).forEach(([locale, resources]) => {
    if (!i18n.hasResourceBundle(locale, "services")) {
      i18n.addResourceBundle(locale, "services", resources, true, true);
    }
  });

  const {
    selected: services,
    services: allServices,
    loading,
    error,
  } = useAppSelector((state) => state.services);

  useEffect(() => {
    if (allServices && allServices.length > 0) {
      const found = allServices.find((item: IServices) => item.slug === slug);
      if (found) {
        dispatch(setSelectedServices(found));
      } else {
        dispatch(fetchServicesBySlug(slug));
      }
    } else {
      dispatch(fetchServicesBySlug(slug));
    }
    return () => {
      dispatch(clearServicesMessages());
    };
  }, [dispatch, allServices, slug]);

  if (loading) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  if (error || !services) {
    return (
      <Container>
        <ErrorMessage />
      </Container>
    );
  }

  const otherServices = allServices.filter((item: IServices) => item.slug !== slug).slice(0, 2);

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{services.title?.[lang] || t("page.noTitle", "Başlık yok")}</Title>

      {services.images?.[0]?.url && (
        <ImageWrapper>
          <Image
            src={services.images[0].url}
            alt={services.title?.[lang] || ""}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto", objectFit: "cover" }}
          />
        </ImageWrapper>
      )}

      {services.summary?.[lang] && (
        <SummaryBox>
          <h3>{t("page.summary")}</h3>
          <div>{services.summary?.[lang]}</div>
        </SummaryBox>
      )}

      {services.content?.[lang] && (
        <ContentBox>
          <h3>{t("page.detail")}</h3>
          <div dangerouslySetInnerHTML={{ __html: services.content[lang] }} />
        </ContentBox>
      )}

      {otherServices?.length > 0 && (
        <OtherSection>
          <h3>{t("page.other")}</h3>
          <OtherList>
            {otherServices.map((item: IServices) => (
              <OtherItem key={item._id}>
                <Link href={`/services/${item.slug}`}>{item.title?.[lang]}</Link>
              </OtherItem>
            ))}
          </OtherList>
        </OtherSection>
      )}
      <CommentForm contentId={services._id} contentType="services" />
      <CommentList contentId={services._id} contentType="services" />
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

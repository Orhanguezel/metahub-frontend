"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchServices,
  clearServicesMessages,
} from "@/modules/services/slice/servicesSlice";
import { useTranslation } from "react-i18next";
import {
  Skeleton,
  ErrorMessage
 } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ServicesPage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useTranslation("services");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";
  const { services, loading, error } = useAppSelector(
    (state) => state.services
  );

  useEffect(() => {
    dispatch(fetchServices(lang));
    return () => {
      dispatch(clearServicesMessages());
    };
  }, [dispatch, lang]);

  if (loading) {
    return (
      <PageWrapper>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <ErrorMessage />
      </PageWrapper>
    );
  }

  if (!services || services.length === 0) {
    return (
      <PageWrapper>
        <p>{t("page.noServices", "No services found.")}</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("page.allServices", "All Services")}</PageTitle>

      <ServicesGrid>
        {services.map((item, index) => (
          <ServicesCard
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {item.images?.[0]?.url && (
              <ImageWrapper>
                <img
                  src={item.images[0].url}
                  alt={item.title?.[lang] || "Service"}
                />
              </ImageWrapper>
            )}
            <CardContent>
              <h2>{item.title?.[lang] || t("page.noTitle", "Untitled")}</h2>
              <p>
                {item.summary?.[lang] ||
                  t("page.noSummary", "No summary available.")}
              </p>
              <Meta>
                <span>
                  {t("page.tags", "Tags")}: {item.tags?.join(", ") || "-"}
                </span>
                {item.price && (
                  <span>
                    {t("page.price", "Price")}: €{item.price.toFixed(2)}
                  </span>
                )}
                {item.durationMinutes && (
                  <span>
                    {t("page.duration", "Duration")}: {item.durationMinutes} min
                  </span>
                )}
              </Meta>
              <ReadMore href={`/services/${item.slug}`}>
                {t("page.readMore", "Read More →")}
              </ReadMore>
            </CardContent>
          </ServicesCard>
        ))}
      </ServicesGrid>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl}
    ${({ theme }) => theme.spacing.md};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const ServicesGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const ServicesCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ImageWrapper = styled.div`
  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
`;

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.base};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const Meta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ReadMore = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

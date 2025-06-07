"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchActivity,
  clearActivityMessages,
} from "@/modules/activity/slice/activitySlice";
import { useTranslation } from "react-i18next";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ActivityPage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useTranslation("activity");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";
  const { activities, loading, error } = useAppSelector(
    (state) => state.activity
  );

  useEffect(() => {
    dispatch(fetchActivity(lang));
    return () => {
      dispatch(clearActivityMessages());
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

  if (!activities || activities.length === 0) {
    return (
      <PageWrapper>
        <p>{t("page.empty", "No activities found.")}</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("page.all", "All Activities")}</PageTitle>

      <Grid>
        {activities.map((item, index) => (
          <Card
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {item.images?.[0]?.url && (
              <ImageWrapper>
                <img
                  src={item.images[0].url}
                  alt={item.title?.[lang] || "Activity"}
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
              </Meta>
              <ReadMore href={`/activity/${item.slug}`}>
                {t("page.readMore", "Read More →")}
              </ReadMore>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </PageWrapper>
  );
}

// Styled Components
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

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const Card = styled(motion.div)`
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

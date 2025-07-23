"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import { translations } from "@/modules/activity";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import Link from "next/link";
import Image from "next/image";
import { Skeleton, ErrorMessage } from "@/shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearActivityMessages,
  fetchActivityBySlug,
  setSelectedActivity,
} from "@/modules/activity/slice/activitySlice";
import type { IActivity } from "@/modules/activity";
import type { SupportedLocale } from "@/types/common";

export default function ActivityDetailSection() {
  const { i18n, t } = useI18nNamespace("activity", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { slug } = useParams() as { slug: string };
  const dispatch = useAppDispatch();

  // i18n yükleme
  Object.entries(translations).forEach(([locale, resources]) => {
    if (!i18n.hasResourceBundle(locale, "activity")) {
      i18n.addResourceBundle(locale, "activity", resources, true, true);
    }
  });

  const {
    selected: activity,
    activity: allActivity,
    loading,
    error,
  } = useAppSelector((state) => state.activity);

  useEffect(() => {
    if (allActivity && allActivity.length > 0) {
      const found = allActivity.find((item: IActivity) => item.slug === slug);
      if (found) {
        dispatch(setSelectedActivity(found));
      } else {
        dispatch(fetchActivityBySlug(slug));
      }
    } else {
      dispatch(fetchActivityBySlug(slug));
    }
    return () => {
      dispatch(clearActivityMessages());
    };
  }, [dispatch, allActivity, slug]);


  if (loading) {
    return (
      <DetailContainer>
        <Skeleton />
      </DetailContainer>
    );
  }

  if (error || !activity) {
    return (
      <DetailContainer>
        <ErrorMessage />
      </DetailContainer>
    );
  }

  const otherActivity = allActivity.filter((item: IActivity) => item.slug !== slug);

  return (
    <DetailContainer
      initial={{ opacity: 0, y: 38 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
    >
      {/* Başlık */}
      <MainTitle>
        {activity.title?.[lang]}
      </MainTitle>

      {/* Görsel */}
      {activity.images?.[0]?.url && (
        <BannerImage>
          <Image
            src={activity.images[0].url}
            alt={activity.title?.[lang] || "Untitled"}
            width={1100}
            height={470}
            priority
            style={{ objectFit: "cover", width: "100%", height: "310px", borderRadius: "22px" }}
          />
        </BannerImage>
      )}

      {/* Özet */}
      {activity.summary && activity.summary[lang] && (
        <SummaryBlock>
          <div>{activity.summary[lang]}</div>
        </SummaryBlock>
      )}

      {/* İçerik */}
      {activity.content && activity.content[lang] && (
        <ContentBlock>
          <div
            className="activity-content"
            dangerouslySetInnerHTML={{ __html: activity.content[lang] }}
          />
        </ContentBlock>
      )}

      {/* Diğer faaliyetler */}
      {otherActivity?.length > 0 && (
        <OtherBlock>
          <h3>{t("page.other", "Diğer Faaliyetlerimiz")}</h3>
          <OtherGrid>
            {otherActivity.map((item: IActivity) => (
              <OtherCard key={item._id}>
                <OtherImgWrap>
                  {item.images?.[0]?.url ? (
                    <Image
                      src={item.images[0].url}
                      alt={item.title?.[lang] || "Untitled"}
                      width={70}
                      height={50}
                      style={{ objectFit: "contain", width: "60px", height: "40px", borderRadius: "10px" }}
                    />
                  ) : (
                    <OtherImgPlaceholder />
                  )}
                </OtherImgWrap>
                <OtherTitle>
                  <Link href={`/activity/${item.slug}`}>
                    {item.title?.[lang] || "Untitled"}
                  </Link>
                </OtherTitle>
              </OtherCard>
            ))}
          </OtherGrid>
        </OtherBlock>
      )}
    </DetailContainer>
  );
}

// --------- STYLES -----------
const DetailContainer = styled(motion.section)`
  max-width: 940px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.sectionBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: 4.5rem;

  @media (max-width: 700px) {
    padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.sm};
  }
`;

const MainTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  letter-spacing: 0.01em;
  margin-bottom: 1.4rem;
  text-align: center;
`;

const BannerImage = styled.div`
  width: 100%;
  margin: 0 auto 2.1rem auto;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};

  img {
    display: block;
    width: 100%;
  }
`;

const SummaryBlock = styled.div`
  background: ${({ theme }) => theme.colors.achievementBackground};
  border-left: 6px solid ${({ theme }) => theme.colors.primary};
  padding: 1.45rem 2.1rem 1.2rem 2rem;
  margin-bottom: 2.1rem;
  border-radius: 14px;
  box-shadow: ${({ theme }) => theme.shadows.xs};
  h3 {
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    margin-bottom: 0.7em;
  }
  div {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.fontSizes.base};
    line-height: 1.7;
  }
`;

const ContentBlock = styled.div`
  background: ${({ theme }) => theme.colors.contentBackground};
  border-left: 6px solid ${({ theme }) => theme.colors.accent};
  padding: 2.1rem 2.3rem 2rem 2.3rem;
  margin-bottom: 2.6rem;
  border-radius: 18px;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  h3 {
    color: ${({ theme }) => theme.colors.accent};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    margin-bottom: 0.7em;
  }
  .activity-content {
    font-size: ${({ theme }) => theme.fontSizes.base};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.7;
    p { margin-bottom: 0.9em; }
    ul, ol { margin-bottom: 0.9em; }
    li { margin-left: 1.2em; }
  }
`;

const OtherBlock = styled.div`
  margin-top: 3.2rem;
  border-top: 1.5px solid ${({ theme }) => theme.colors.border};
  padding-top: 2.2rem;
  h3 {
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    margin-bottom: 1.2rem;
    text-align: left;
  }
`;

const OtherGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem 2.3rem;
`;

const OtherCard = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 14px;
  box-shadow: ${({ theme }) => theme.shadows.xs};
  padding: 0.65rem 1.2rem;
  min-width: 170px;
  gap: 0.6rem;
  border: 1.2px solid ${({ theme }) => theme.colors.borderLight};
  transition: box-shadow 0.17s, border-color 0.14s;

  &:hover, &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const OtherImgWrap = styled.div`
  width: 60px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: 10px;
  overflow: hidden;
`;

const OtherImgPlaceholder = styled.div`
  width: 60px;
  height: 40px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.34;
`;

const OtherTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &:hover, &:focus-visible {
      text-decoration: underline;
      color: ${({ theme }) => theme.colors.accent};
    }
  }
`;


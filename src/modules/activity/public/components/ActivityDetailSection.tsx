"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import Link from "next/link";
import "react-image-lightbox/style.css";
import { Skeleton, ErrorMessage } from "@/shared";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchActivity,
  fetchActivityBySlug,
} from "@/modules/activity/slice/activitySlice";

const Lightbox = dynamic(() => import("react-image-lightbox"), { ssr: false });

export default function ActivityDetailSection() {
  const { slug } = useParams() as { slug: string };
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("activity");
  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const {
    selected: activity,
    activities,
    loading,
    error,
  } = useAppSelector((state) => state.activity);
  const [lightbox, setLightbox] = useState({ isOpen: false, index: 0 });

  useEffect(() => {
    dispatch(fetchActivityBySlug(slug));
    dispatch(fetchActivity(lang));
  }, [dispatch, slug, lang]);

  const otherActivities = activities.filter((a) => a.slug !== slug).slice(0, 2);

  if (loading)
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  if (error || !activity)
    return (
      <Container>
        <ErrorMessage />
      </Container>
    );

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{activity.title?.[lang]}</Title>

      {activity.images?.length > 0 && (
        <Gallery>
          {activity.images.map((img, idx) => (
            <ImageWrapper
              key={idx}
              onClick={() => setLightbox({ isOpen: true, index: idx })}
            >
              <img
                src={img.url}
                alt={activity.title?.[lang] || `image-${idx}`}
              />
            </ImageWrapper>
          ))}
        </Gallery>
      )}

      <Content
        dangerouslySetInnerHTML={{ __html: activity.content?.[lang] || "" }}
      />

      {lightbox.isOpen && (
        <Lightbox
          mainSrc={activity.images[lightbox.index].url}
          nextSrc={
            activity.images[(lightbox.index + 1) % activity.images.length].url
          }
          prevSrc={
            activity.images[
              (lightbox.index + activity.images.length - 1) %
                activity.images.length
            ].url
          }
          onCloseRequest={() => setLightbox({ ...lightbox, isOpen: false })}
          onMovePrevRequest={() =>
            setLightbox({
              ...lightbox,
              index:
                (lightbox.index + activity.images.length - 1) %
                activity.images.length,
            })
          }
          onMoveNextRequest={() =>
            setLightbox({
              ...lightbox,
              index: (lightbox.index + 1) % activity.images.length,
            })
          }
          imageCaption={activity.title?.[lang]}
        />
      )}

      {!!activity.tags?.length && (
        <Tags>
          {activity.tags.map((tag, i) => (
            <Tag key={i}>#{tag}</Tag>
          ))}
        </Tags>
      )}

      {!!otherActivities.length && (
        <OtherSection>
          <h3>{t("page.other", "Other Activities")}</h3>
          <OtherList>
            {otherActivities.map((item) => (
              <OtherItem key={item._id}>
                <Link href={`/activity/${item.slug}`}>
                  {item.title?.[lang]}
                </Link>
              </OtherItem>
            ))}
          </OtherList>
        </OtherSection>
      )}
    </Container>
  );
}

// Styled Components
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

const Gallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ImageWrapper = styled.div`
  flex: 1 1 280px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform 0.3s ease;
  cursor: pointer;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radii.sm};
  }

  &:hover {
    transform: scale(1.02);
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

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.tagBackground || "#eee"};
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
`;

const OtherSection = styled.div`
  margin-top:  ${({ theme }) => theme.spacing.xxl};
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

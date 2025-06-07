"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import Link from "next/link";
import "react-image-lightbox/style.css";

import apiCall from "@/lib/apiCall";
import { IServices } from "@/modules/services/types/services";
import {
  Skeleton,
  ErrorMessage
 } from "@/shared";

const Lightbox = dynamic(() => import("react-image-lightbox"), { ssr: false });

export default function ServicesDetailSection() {
  const { slug } = useParams() as { slug: string };
  const { i18n, t } = useTranslation("services");
  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const [services, setServices] = useState<IServices | null>(null);
  const [otherServices, setOtherServices] = useState<IServices[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await apiCall(
          "get",
          `/services/slug/${slug}`,
          null,
          (err) => {
            setError(err.message);
            return err;
          }
        );
        setServices(res.data);
      } catch (err: any) {
        setError(err.message || "Service not found.");
      } finally {
        setLoading(false);
      }
    };

    const fetchOthers = async () => {
      try {
        const res = await apiCall(
          "get",
          `/services?language=${lang}`,
          null,
          () => null
        );
        setOtherServices(
          res.data.filter((s: IServices) => s.slug !== slug).slice(0, 2)
        );
      } catch {}
    };

    fetchServices();
    fetchOthers();
  }, [slug, lang]);

  if (loading)
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  if (error || !services)
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
      <Title>{services.title?.[lang]}</Title>

      {services.images?.length > 0 && (
        <Gallery>
          {services.images.map((img, idx) => (
            <ImageWrapper
              key={idx}
              onClick={() => {
                setPhotoIndex(idx);
                setIsOpen(true);
              }}
            >
              <img src={img.url} alt={`service-image-${idx}`} />
            </ImageWrapper>
          ))}
        </Gallery>
      )}

      <Content
        dangerouslySetInnerHTML={{ __html: services.content?.[lang] || "" }}
      />

      {services.price && (
        <Info>
          {t("page.price", "Price")}: €{services.price.toFixed(2)}
        </Info>
      )}
      {services.durationMinutes && (
        <Info>
          {t("page.duration", "Duration")}: {services.durationMinutes} min
        </Info>
      )}

      {isOpen && services.images?.length > 0 && (
        <Lightbox
          mainSrc={services.images[photoIndex].url}
          nextSrc={
            services.images[(photoIndex + 1) % services.images.length].url
          }
          prevSrc={
            services.images[
              (photoIndex + services.images.length - 1) % services.images.length
            ].url
          }
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex(
              (photoIndex + services.images.length - 1) % services.images.length
            )
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % services.images.length)
          }
          imageCaption={services.title?.[lang]}
        />
      )}

      {services.tags?.length > 0 && (
        <Tags>
          {services.tags.map((tag, i) => (
            <Tag key={i}>#{tag}</Tag>
          ))}
        </Tags>
      )}

      {otherServices.length > 0 && (
        <OtherServices>
          <h3>{t("page.other", "Other Services")}</h3>
          <ServicesList>
            {otherServices.map((item) => (
              <ServicesItem key={item._id}>
                <Link href={`/services/${item.slug}`}>
                  {item.title?.[lang]}
                </Link>
              </ServicesItem>
            ))}
          </ServicesList>
        </OtherServices>
      )}
    </Container>
  );
}

// Styled Components
const Container = styled(motion.section)`
  max-width: 920px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  position: relative;
  font-family: ${({ theme }) => theme.fonts.body};

  @media (max-width: 767px) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  letter-spacing: 0.03em;
  text-align: center;
`;

const Gallery = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  justify-content: center;
  flex-wrap: wrap;
`;

const ImageWrapper = styled.div`
  flex: 0 1 340px;
  max-width: 370px;
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  cursor: pointer;
  transition: box-shadow 0.23s, transform 0.23s;

  img {
    width: 100%;
    height: 235px;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radii.xl};
    display: block;
    transition: transform 0.18s;
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.xl}, 0 0 0 4px ${({ theme }) => theme.colors.primaryTransparent};
    transform: scale(1.038);
  }

  @media (max-width: 767px) {
    flex: 1 1 100%;
    max-width: 100%;
    img {
      height: 165px;
    }
  }
`;

const Content = styled.div`
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.fonts.body};

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
  ul, ol {
    margin-left: 1.1em;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: 767px) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;


const Info = styled.span`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 500;
  padding: 0.42em 1.18em;
  margin-bottom: 0;
  box-shadow: ${({ theme }) => theme.shadows.xs};
  letter-spacing: 0.02em;
  font-family: ${({ theme }) => theme.fonts.main};
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  justify-content: center;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.tagBackground};
  color: ${({ theme }) => theme.colors.primary};
  padding: 6px 15px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  letter-spacing: 0.04em;
  box-shadow: ${({ theme }) => theme.shadows.xs};
  margin-bottom: 4px;
`;

const OtherServices = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xxl};
  border-top: 1.5px dashed ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const ServicesList = styled.ul`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ServicesItem = styled.li`
  font-size: ${({ theme }) => theme.fontSizes.base};
  list-style: none;
  a {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    padding: 0.65em 1.5em;
    border-radius: ${({ theme }) => theme.radii.pill};
    text-decoration: none;
    font-weight: 600;
    box-shadow: ${({ theme }) => theme.shadows.xs};
    transition: background 0.18s, color 0.18s, box-shadow 0.2s;
    letter-spacing: 0.01em;
    font-family: ${({ theme }) => theme.fonts.main};
    &:hover {
      background: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.buttonText};
      text-decoration: none;
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
  }
`;

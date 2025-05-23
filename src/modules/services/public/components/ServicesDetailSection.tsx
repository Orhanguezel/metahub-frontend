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

const OtherServices = styled.div`
  margin-top: ${({ theme }) => theme.spacing["2xl"]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

const ServicesList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ServicesItem = styled.li`
  font-size: ${({ theme }) => theme.fontSizes.base};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Info = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/apartment";
import { Skeleton, ErrorMessage } from "@/shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearApartmentMessages,
  fetchApartmentBySlug,
  setSelectedApartment,
} from "@/modules/apartment/slice/apartmentSlice";
import type { IApartment } from "@/modules/apartment";
import type { SupportedLocale } from "@/types/common";

export default function ApartmentDetailSection() {
  const { i18n, t } = useI18nNamespace("apartment", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { slug } = useParams() as { slug: string };
  const dispatch = useAppDispatch();

  // i18n bundle’ları tek sefer ekle
  useEffect(() => {
    Object.entries(translations).forEach(([lng, resources]) => {
      if (!i18n.hasResourceBundle(lng, "apartment")) {
        i18n.addResourceBundle(lng, "apartment", resources, true, true);
      }
    });
  }, [i18n]);

  const { selected, apartment: list, loading, error } = useAppSelector((s) => s.apartment);

  // Slug değiştiğinde: listede bul -> yoksa API’den çek
  useEffect(() => {
    if (!slug) return;
    const found = list?.find((it: IApartment) => it.slug === slug);
    if (found) {
      dispatch(setSelectedApartment(found));
    } else {
      dispatch(fetchApartmentBySlug(slug));
    }
    return () => {
      dispatch(clearApartmentMessages());
    };
  }, [dispatch, slug, list]);

  const apartment = selected;
  const others = useMemo(
    () => (Array.isArray(list) ? list.filter((it) => it.slug !== slug) : []),
    [list, slug]
  );

  if (loading && !apartment) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  if (error || !apartment) {
    return (
      <Container>
        <ErrorMessage message={error || t("page.notFound", "Kayıt bulunamadı.")} />
      </Container>
    );
  }

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{apartment.title?.[lang] || apartment.title?.en || t("page.noTitle", "Başlık yok")}</Title>

      {apartment.images?.[0]?.url && (
        <ImageWrapper>
          <Image
            src={apartment.images[0].url}
            alt={apartment.title?.[lang] || apartment.title?.en || "Apartment"}
            width={1200}
            height={540}
            sizes="(max-width: 900px) 100vw, 900px"
            style={{ width: "100%", height: "auto", objectFit: "cover" }}
            priority
          />
        </ImageWrapper>
      )}

      {apartment.content?.[lang] && (
        <ContentBox>
          <h3>{t("page.detail", "Detay")}</h3>
          <div dangerouslySetInnerHTML={{ __html: apartment.content[lang] }} />
        </ContentBox>
      )}

      {others?.length > 0 && (
        <OtherSection>
          <h3>{t("page.other", "Diğer Referanslar")}</h3>
          <LogoGrid>
            {others
              .filter((it) => it.images?.[0]?.url)
              .map((it) => (
                <LogoCard key={it._id}>
                  <Link href={`/apartment/${it.slug}`}>
                    <LogoImageWrapper>
                      <Image
                        src={it.images[0].url}
                        alt={it.title?.[lang] || it.title?.en || "Apartment"}
                        width={140}
                        height={70}
                        style={{ objectFit: "contain", width: "100%", height: "70px" }}
                        sizes="(max-width: 600px) 50vw, 140px"
                      />
                    </LogoImageWrapper>
                    <LogoTitle>{it.title?.[lang] || it.title?.en || ""}</LogoTitle>
                  </Link>
                </LogoCard>
              ))}
          </LogoGrid>
        </OtherSection>
      )}
    </Container>
  );
}

// --------- STYLES -----------
const Container = styled(motion.section)`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
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

const LogoGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: ${({ theme }) => theme.spacings.md};
  padding: 0;
  margin: 0;
  list-style: none;
`;

const LogoCard = styled.li`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.xs};
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.18s, background 0.18s;
  min-height: 110px;

  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: inherit;
    width: 100%;
    height: 100%;

    &:hover {
      box-shadow: ${({ theme }) => theme.shadows.md};
      background: ${({ theme }) => theme.colors.primaryTransparent};
    }
  }
`;

const LogoImageWrapper = styled.div`
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const LogoTitle = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-weight: 500;
  line-height: 1.25;
  min-height: 36px;
`;

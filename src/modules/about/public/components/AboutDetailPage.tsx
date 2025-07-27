"use client";

import styled from "styled-components";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/about/locales";
import Image from "next/image";
import { Skeleton, ErrorMessage } from "@/shared";
import type { SupportedLocale } from "@/types/common";
import Masonry from "react-masonry-css";

export default function AboutDetailPage() {
  const { id } = useParams() as { id: string };
  const { i18n, t } = useI18nNamespace("about", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { about, loading, error } = useAppSelector((s) => s.about);
  const item = about?.find((a) => a._id === id); // ✅ ID üzerinden bul

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "about")) {
      i18n.addResourceBundle(lng, "about", resources, true, true);
    }
  });
  if (loading) {
    return (
      <PageWrapper>
        <Skeleton />
      </PageWrapper>
    );
  }

  if (error || !item) {
    return (
      <PageWrapper>
        <ErrorMessage message={error || t("page.noAbout", "İçerik bulunamadı")} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Title>{item.title?.[lang] || item.title?.tr || item.title?.en || "—"}</Title>
      <Summary>{item.summary?.[lang] || item.summary?.tr || item.summary?.en || "—"}</Summary>
      <Content dangerouslySetInnerHTML={{ __html: item.content?.[lang] || item.content?.tr || item.content?.en || "—" }} />

      <MasonryGallery
  breakpointCols={{ default: 3, 1024: 2, 640: 1 }}
  className="masonry-grid"
  columnClassName="masonry-column"
>
  {item.images.map((img, i) => (
    <ImgWrap key={img._id || i}>
      <StyledImage
        src={img.url}
        alt={`about-img-${i}`}
        width={600}
        height={400}
        loading="lazy"
      />
    </ImgWrap>
  ))}
</MasonryGallery>
    </PageWrapper>
  );
}


const PageWrapper = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-align: center;
  margin-bottom: 1rem;
`;

const Summary = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  max-width: 800px;
  margin: 0 auto 2rem auto;
  line-height: 1.6;
`;

const Content = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.8;
  max-width: 900px;
  margin: 0 auto 3rem auto;
  padding: 0 1rem;

  & img {
    max-width: 100%;
    border-radius: ${({ theme }) => theme.radii.md};
    margin: 1.6rem 0;
  }
`;


const ImgWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const StyledImage = styled(Image)`
  object-fit: cover;
`;


const MasonryGallery = styled(Masonry)`
  display: flex;
  margin-left: -1.2rem;

  .masonry-column {
    padding-left: 1.2rem;
    background-clip: padding-box;
  }

  & .masonry-column > div {
    margin-bottom: 1.2rem;
  }
`;


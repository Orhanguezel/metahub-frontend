"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/articles";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import type { IArticles } from "@/modules/articles/types";


export default function ArticlesPage() {
  const { i18n, t } = useI18nNamespace("articles", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { articles, loading, error } = useAppSelector((state) => state.articles);

      Object.entries(translations).forEach(([lang, resources]) => {
  if (!i18n.hasResourceBundle(lang, "articles")) {
    i18n.addResourceBundle(lang, "articles", resources, true, true);
  }
});

  

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
        <ErrorMessage message={error} />
      </PageWrapper>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <PageWrapper>
        <p>{t("page.noArticles")}</p>
      </PageWrapper>
    );
  }

  

  return (
    <PageWrapper>
      <PageTitle>{t("page.allArticles")}</PageTitle>
      <ArticlesGrid>
        {articles.map((item: IArticles, index: number) => (
          <ArticlesCard
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}

          >

             {item.images?.[0]?.url && (
                           <ImageWrapper>
                             <Image
                               src={item.images[0].url}
                               alt={item.title?.[lang] || "Articles Image"}
                               width={780}
                               height={420}
                               style={{ objectFit: "cover" }}
                               loading="lazy"
                             />
                           </ImageWrapper>
                         )}
                         <CardContent>
                           <h2>{item.title?.[lang] || "Untitled"}</h2>
                           <p>{item.summary?.[lang] || "No summary available."}</p>
                           <Meta>
                             <span>
                               {t("author", "Yazar")}:{" "}
                               {item.author || t("unknown", "Bilinmiyor")}
                             </span>
                             <span>
                               {t("tags", "Etiketler")}: {item.tags?.join(", ") || "-"}
                             </span>
                           </Meta>
                           <ReadMore href={`/articles/${item.slug}`}>
                             {t("readMore", "Devamını Oku →")}
                           </ReadMore>
                         </CardContent>
                       </ArticlesCard>
                     ))}
      </ArticlesGrid>
    </PageWrapper>
  );
}

// Styled Components aynı kalabilir
const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl}
    ${({ theme }) => theme.spacings.md};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const ArticlesGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.lg};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const ArticlesCard = styled(motion.div)`
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
    background: #f2f2f2;
    display: block;
  }
`;

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacings.md};

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin-bottom: ${({ theme }) => theme.spacings.sm};
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.base};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacings.md};
  }
`;

const Meta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: ${({ theme }) => theme.spacings.sm};
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

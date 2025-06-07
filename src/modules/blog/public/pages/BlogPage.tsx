"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBlogs, clearBlogMessages } from "@/modules/blog/slice/blogSlice";
import { useTranslation } from "react-i18next";
import SkeletonBox from "@/shared/Skeleton";
import ErrorMessage from "@/shared/ErrorMessage";
import { motion } from "framer-motion";
import Link from "next/link";

export default function BlogPage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useTranslation("blog");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";
  const { blogs, loading, error } = useAppSelector((state) => state.blog);

  useEffect(() => {
    dispatch(fetchBlogs(lang));
    return () => {
      dispatch(clearBlogMessages());
    };
  }, [dispatch, lang]);

  if (loading) {
    return (
      <PageWrapper>
        {[...Array(3)].map((_, i) => (
          <SkeletonBox key={i} />
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

  if (!blogs || blogs.length === 0) {
    return (
      <PageWrapper>
        <p>{t("noBlog", "Haber bulunamadı.")}</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("allBlog", "Tüm Haberler")}</PageTitle>

      <BlogGrid>
        {blogs.map((item, index) => (
          <BlogCard
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {item.images?.[0]?.url && (
              <ImageWrapper>
                <img src={item.images[0].url} alt={item.title?.[lang]} />
              </ImageWrapper>
            )}
            <CardContent>
              <h2>{item.title?.[lang] || t("untitled", "Başlıksız")}</h2>
              <p>{item.summary?.[lang] || t("noSummary", "Özet yok.")}</p>
              <Meta>
                <span>
                  {t("author", "Yazar")}:{" "}
                  {item.author || t("unknown", "Bilinmiyor")}
                </span>
                <span>
                  {t("tags", "Etiketler")}: {item.tags?.join(", ") || "-"}
                </span>
              </Meta>
              <ReadMore href={`/blog/${item.slug}`}>
                {t("readMore", "Devamını Oku →")}
              </ReadMore>
            </CardContent>
          </BlogCard>
        ))}
      </BlogGrid>
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

const BlogGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const BlogCard = styled(motion.div)`
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

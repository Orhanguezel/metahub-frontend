"use client";

import styled from "styled-components";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Section = styled(motion.section)`
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  text-align: left;
  transition: transform ${({ theme }) => theme.transition.fast};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const BlogTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const Excerpt = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ReadMore = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: color ${({ theme }) => theme.transition.fast};

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const SeeAll = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  transition: color ${({ theme }) => theme.transition.fast};

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const blogs = [
  {
    id: 1,
    title: "Parazit Temizliği ile Vücut Detoksu",
    excerpt:
      "Bağırsak parazitleri ve doğal temizlenme yöntemleri hakkında bilgiler...",
    link: "/visitor/blogs/parazit-temizligi",
  },
  {
    id: 2,
    title: "Vegan Beslenmenin Altın Kuralları",
    excerpt:
      "Bitkisel beslenmeye geçiş süreci ve dikkat edilmesi gerekenler...",
    link: "/visitor/blogs/vegan-beslenme",
  },
  {
    id: 3,
    title: "Masajın Ruhsal Faydaları",
    excerpt:
      "Masaj sadece fiziksel değil, zihinsel ve ruhsal denge için de faydalıdır.",
    link: "/visitor/blogs/masaj-ve-ruh",
  },
];

export default function BlogSection() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Title>📰 {t("home.blog.title", "Blog'dan Seçmeler")}</Title>
      <Grid>
        {blogs.map((blog, index) => (
          <Card
            key={blog.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <BlogTitle>{blog.title}</BlogTitle>
            <Excerpt>{blog.excerpt}</Excerpt>
            <ReadMore href={blog.link}>
              {t("home.blog.readMore", "Devamını Oku →")}
            </ReadMore>
          </Card>
        ))}
      </Grid>
      <SeeAll href="/visitor/blogs">
        {t("home.blog.all", "Tüm Blog Yazıları →")}
      </SeeAll>
    </Section>
  );
}

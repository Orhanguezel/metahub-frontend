"use client";

import styled from "styled-components";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Section = styled(motion.section)`
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  text-align: center;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.cardBackground || "#f9f9f9"};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.04);
  text-align: left;
`;

const BlogTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const Excerpt = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary || "#555"};
`;

const ReadMore = styled(Link)`
  display: inline-block;
  margin-top: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.primary || "rebeccapurple"};

  &:hover {
    text-decoration: underline;
  }
`;

const SeeAll = styled(Link)`
  display: inline-block;
  margin-top: 2rem;
  color: ${({ theme }) => theme.primary || "rebeccapurple"};
  font-weight: 500;

  &:hover {
    text-decoration: underline;
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

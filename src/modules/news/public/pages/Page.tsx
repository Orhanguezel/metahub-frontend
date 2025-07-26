"use client";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/news/locales";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import type { INews } from "@/modules/news/types";
import { useState } from "react";

// Dinamik arşiv (Ay/Yıl) çıkarma fonksiyonu
const getArchives = (news: INews[]) => {
  if (!Array.isArray(news)) return [];
  const archiveSet = new Set<string>();
  news.forEach((n) => {
    const dt = n.publishedAt || n.createdAt;
    if (dt) {
      const d = new Date(dt);
      const label = d.toLocaleString("tr-TR", {
        year: "numeric",
        month: "long",
      });
      archiveSet.add(label);
    }
  });
  return Array.from(archiveSet);
};

// Dinamik kategori çıkarma fonksiyonu
const getCategories = (news: INews[], lang: SupportedLocale) => {
  if (!Array.isArray(news)) return [];
  const cats: { [slug: string]: { _id?: string; name: string } } = {};
  news.forEach((n) => {
    if (n.category) {
      if (typeof n.category === "string") {
        // Sadece slug varsa, slug ile göster
        cats[n.category] = { name: n.category };
      } else if (typeof n.category === "object" && n.category.name) {
        // Objeyse, lokalize isim
        cats[ n.category._id || n.category.name[lang] || "-"] = {
          _id: n.category._id,
          name: n.category.name[lang] || n.category.name["en"] || "-",
        };
      }
    }
  });
  return Object.entries(cats).map(([slug, { _id, name }]) => ({ slug, _id, name }));
};

export default function NewsPage() {
  const { i18n, t } = useI18nNamespace("news", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { news, loading, error } = useAppSelector((state) => state.news);
  const [search, setSearch] = useState("");

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "news")) {
      i18n.addResourceBundle(lng, "news", resources, true, true);
    }
  });

  const filteredNews =
    news && Array.isArray(news)
      ? [...news]
          .filter(
            (n) =>
              !search ||
              (n.title?.[lang] ?? "")
                .toLowerCase()
                .includes(search.toLowerCase())
          )
          .sort(
            (a, b) =>
              new Date(b.publishedAt || b.createdAt).getTime() -
              new Date(a.publishedAt || a.createdAt).getTime()
          )
      : [];

  // Sidebar data
  const recentNews = filteredNews.slice(0, 4);
  const archives = getArchives(news || []);
  const categories = getCategories(news || [], lang);

  if (loading) {
    return (
      <PageWrapper>
        <MainGrid>
          <LeftColumn>
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} />
            ))}
          </LeftColumn>
          <RightColumn>
            <Skeleton />
          </RightColumn>
        </MainGrid>
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

  if (!news || news.length === 0) {
    return (
      <PageWrapper>
        <NoNews>{t("page.noNews", "Hiç haber bulunamadı.")}</NoNews>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <MainGrid>
        {/* SOL ANA KOLON */}
        <LeftColumn>
          {filteredNews.map((item: INews) => (
            <NewsItem key={item._id}>
              {item.images?.[0]?.url && (
                <MainImageWrap>
  <Image
    src={item.images[0].url}
    alt={item.title?.[lang] || "News Image"}
    width={780}
    height={440} 
    style={{
      width: "100%",
      height: "auto", 
      objectFit: "cover",
      borderRadius: "16px",
      display: "block"
    }}
    loading="lazy"
  />
</MainImageWrap>

              )}
              <NewsTitle>
                <Link href={`/news/${item.slug}`}>{item.title?.[lang] || "Untitled"}</Link>
              </NewsTitle>
              <NewsMeta>
                {/* <span>
                  <b>{t("author", "Yazar")}: </b>
                  {item.author || t("unknown", "Bilinmiyor")}
                </span> */}
                
                <span>
                  {new Date(item.publishedAt || item.createdAt).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {Array.isArray(item.tags) && item.tags.length > 0 && (
                  <span>
                    {item.tags.map((tag) => (
                      <CategoryLabel key={tag}>{tag}</CategoryLabel>
                    ))}
                  </span>
                )}
              </NewsMeta>
              <NewsSummary>
                {item.summary?.[lang] ||
                  item.content?.[lang]?.substring(0, 180) + "..."}
              </NewsSummary>
              <ReadMoreBtn href={`/news/${item.slug}`}>
                {t("readMore", "Devamını Oku")}
              </ReadMoreBtn>
            </NewsItem>
          ))}
        </LeftColumn>

        {/* SAĞ SABİT KOLON */}
        <RightColumn>
          <SidebarBox>
            <SidebarTitle>{t("search", "Arama")}</SidebarTitle>
            <SearchForm
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                type="text"
                placeholder={t("search", "Arama")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </SearchForm>
          </SidebarBox>

          <SidebarBox>
            <SidebarTitle>{t("recent", "Son Haberler")}</SidebarTitle>
            <SidebarList>
              {recentNews.length ? (
                recentNews.map((n) => (
                  <li key={n._id}>
                    <Link href={`/news/${n.slug}`}>{n.title?.[lang]}</Link>
                  </li>
                ))
              ) : (
                <li>-</li>
              )}
            </SidebarList>
          </SidebarBox>

          <SidebarBox>
            <SidebarTitle>{t("archives", "Arşivler")}</SidebarTitle>
            <SidebarList>
              {archives.length
                ? archives.map((ar: string, i: number) => (
                    <li key={ar + i}>{ar}</li>
                  ))
                : <li>-</li>}
            </SidebarList>
          </SidebarBox>

          <SidebarBox>
            <SidebarTitle>{t("categories", "Kategoriler")}</SidebarTitle>
            <SidebarList>
              {categories.length
                ? categories.map((cat) => (
                    <li key={cat.slug}>
                      {cat.name}
                    </li>
                  ))
                : <li>-</li>}
            </SidebarList>
          </SidebarBox>
        </RightColumn>
      </MainGrid>
    </PageWrapper>
  );
}

// --- Styled Components (aynen kalabilir, gerekirse modernize edilir) ---
const PageWrapper = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.sectionBackground};
  min-height: 90vh;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 2.2fr 1fr;
  gap: 2.5rem;
  align-items: flex-start;

  @media (max-width: 1050px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const NewsItem = styled(motion.article)`
  background: ${({ theme }) => theme.colors.cardBackground || "#fff"};
  border-radius: 20px;
  border: 1.5px solid ${({ theme }) => theme.colors.borderLight || "#e5eaf3"};
  box-shadow: 0 3px 15px 0 rgba(40,117,194,0.09);
  padding: 2.1rem 2.3rem 1.5rem 2.3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 650px) {
    padding: 1.1rem 0.7rem 1.1rem 0.7rem;
  }
`;
const MainImageWrap = styled.div`
  width: 100%;
  margin-bottom: 1.1rem;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px 0 rgba(40,117,194,0.11);

  img {
    width: 100% !important;
    height: auto !important;  
    object-fit: cover;
    display: block;
    border-radius: 16px;
  }
`;


const NewsTitle = styled.h2`
  font-size: 1.42rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.23rem;
  line-height: 1.18;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.17s;
    &:hover {
      color: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const NewsMeta = styled.div`
  font-size: 0.98rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  gap: 1.25rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
`;

const CategoryLabel = styled.span`
  background: ${({ theme }) => theme.colors.primaryTransparent || "#e5f1fb"};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9em;
  border-radius: 8px;
  padding: 1px 8px;
  margin-left: 0.32em;
  font-weight: 500;
`;

const NewsSummary = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.08rem;
  margin: 0.22em 0 1.22em 0;
  line-height: 1.64;
`;

const ReadMoreBtn = styled(Link)`
  align-self: flex-start;
  background: linear-gradient(90deg, #2875c2 60%, #0bb6d6 100%);
  color: #fff;
  padding: 0.46em 1.35em;
  border-radius: 22px;
  font-size: 1.03rem;
  font-weight: 600;
  box-shadow: 0 3px 10px 0 rgba(40,117,194,0.06);
  text-decoration: none;
  transition: background 0.2s, color 0.18s, transform 0.14s;
  &:hover, &:focus-visible {
    background: linear-gradient(90deg, #0bb6d6 0%, #2875c2 90%);
    color: #fff;
    transform: translateY(-2px) scale(1.04);
  }
`;

const RightColumn = styled.aside`
  position: sticky;
  top: 40px;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: 2.2rem;

  @media (max-width: 1050px) {
    position: static;
    gap: 1.2rem;
  }
`;

const SidebarBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt || "#f6fafd"};
  border-radius: 15px;
  box-shadow: 0 3px 10px 0 rgba(40,117,194,0.04);
  padding: 1.2rem 1.3rem 1.4rem 1.3rem;
  margin-bottom: 0.5rem;
`;

const SidebarTitle = styled.h3`
  font-size: 1.13rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  margin-bottom: 1.1rem;
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.primaryTransparent || "#e0eaf3"};
  padding-bottom: 0.45rem;
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  input {
    flex: 1;
    padding: 0.41em 1.1em;
    border-radius: 8px;
    border: 1.5px solid ${({ theme }) => theme.colors.borderLight || "#e5eaf3"};
    font-size: 1.05em;
    color: ${({ theme }) => theme.colors.text};
    outline: none;
    background: ${({ theme }) => theme.colors.background};
    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
      background: #fff;
    }
  }
`;

const SidebarList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  li {
    margin-bottom: 0.71em;
    font-size: 1.01em;
    a {
      color: ${({ theme }) => theme.colors.text};
      text-decoration: none;
      transition: color 0.16s;
      &:hover {
        color: ${({ theme }) => theme.colors.primary};
      }
    }
  }
`;

const NoNews = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.09rem;
  padding: 2.1rem 0 3rem 0;
  opacity: 0.86;
  text-align: center;
`;

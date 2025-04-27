"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchNews } from "@/store/newsSlice";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { getImageSrc } from "@/utils/getImageSrc";

export default function NewsListSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { i18n, t } = useTranslation("visitor");
  const { news, loading } = useSelector((state: RootState) => state.news);

  useEffect(() => {
    dispatch(fetchNews(i18n.language));
  }, [dispatch, i18n.language]);

  return (
    <Wrapper>
      <h2>🗞️ {t("news.title") || "Haberler"}</h2>

      {loading && <p>{t("common.loading") || "Yükleniyor..."}</p>}

      {!loading && news.length === 0 && (
        <p>{t("news.empty") || "Hiç haber bulunamadı."}</p>
      )}

      <Grid>
        {news.map((item) => (
          <Card key={item._id}>
            <Image src={getImageSrc(item.image, "news")} alt={item.title} />
            <Content>
              <h4>{item.title}</h4>
              <p>{item.summary}</p>
              <StyledLink href={`/visitor/news/${item.slug}`}>
                {t("news.readMore") || "Devamını Oku"} →
              </StyledLink>
            </Content>
          </Card>
        ))}
      </Grid>
    </Wrapper>
  );
}


const Wrapper = styled.div`
  padding: 2rem 0;
  `;
  
  const Grid = styled.div`
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  `;
  
  const Card = styled.div`
    background: ${({ theme }) => theme.cardBackground};
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    height: 100%;
  `;
  
  const Image = styled.img`
    width: 100%;
    height: 180px;
    object-fit: cover;
  `;
  
  const Content = styled.div`
    padding: 1rem;
    flex: 1;
  
    h4 {
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
      color: ${({ theme }) => theme.text};
    }
  
    p {
      color: ${({ theme }) => theme.textLight};
      font-size: 0.95rem;
      margin-bottom: 1rem;
    }
  `;
  
  const StyledLink = styled(Link)`
    display: inline-block;
    color: ${({ theme }) => theme.primary};
    font-weight: 600;
    font-size: 0.95rem;
    margin-top: auto;
  
    &:hover {
      text-decoration: underline;
    }
  `;
  
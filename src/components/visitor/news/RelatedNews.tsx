"use client";

import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchNews } from "@/store/newsSlice";
import Link from "next/link";
import styled from "styled-components";
import { getImageSrc } from "@/utils/getImageSrc";
import { useTranslation } from "react-i18next";

interface Props {
  currentId: string;
  category?: string;
}

export default function RelatedNews({ currentId, category }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { i18n, t } = useTranslation("visitor");
  const { news } = useSelector((state: RootState) => state.news);

  useEffect(() => {
    if (news.length === 0) {
      dispatch(fetchNews(i18n.language));
    }
  }, [dispatch, i18n.language, news.length]);

  const related = useMemo(() => {
    return news
      .filter((item) => item._id !== currentId && item.category === category)
      .slice(0, 3);
  }, [news, currentId, category]);

  if (related.length === 0) return null;

  return (
    <Wrapper>
      <h4>📎 {t("news.related") || "Benzer Haberler"}</h4>
      <List>
        {related.map((item) => (
          <Item key={item._id}>
            <Thumb src={getImageSrc(item.image, "news")} alt={item.title} />
            <div>
              <Link href={`/visitor/news/${item.slug}`}>
                <Title>{item.title}</Title>
              </Link>
              <DateLabel>
                {item.publishedAt
                  ? new Date(item.publishedAt).toLocaleDateString()
                  : "-"}
              </DateLabel>
            </div>
          </Item>
        ))}
      </List>
    </Wrapper>
  );
}


const Wrapper = styled.div`
  margin-top: 3rem;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Item = styled.div`
  display: flex;
  gap: 1rem;
`;

const Thumb = styled.img`
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
`;

const Title = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const DateLabel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textLight};
`;

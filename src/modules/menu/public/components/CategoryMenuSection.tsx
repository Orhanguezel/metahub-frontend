"use client";

import styled from "styled-components";
import type { SupportedLocale } from "@/types/common";
import ItemCard from "./ItemCard";

type Props = {
  id: string;
  title: string;
  items?: any[]; // <-- optional
  lang: SupportedLocale;
  t?: (k: string, d?: string) => string; // <-- optional (fallback aşağıda)
  isLoading?: boolean;
};

export default function CategoryMenuSection({
  id,
  title,
  items,
  lang,
  t,
  isLoading = false,
}: Props) {
  // güvenli çeviri
  const tr = typeof t === "function" ? t : (k: string, d?: string) => d ?? String(k);
  // güvenli liste
  const list = Array.isArray(items) ? items : [];

  return (
    <Section id={id} aria-busy={!!isLoading}>
      <h2>{title}</h2>

      {isLoading && (
        <Grid>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skel key={i} />
          ))}
        </Grid>
      )}

      {!isLoading && list.length === 0 && <Empty>∅</Empty>}

      {!isLoading && list.length > 0 && (
        <Grid>
          {list.map((m, i) => (
            <ItemCard
              key={m?._id ?? m?.code ?? m?.slug ?? i}
              item={m}
              lang={lang}
              t={tr}
            />
          ))}
        </Grid>
      )}
    </Section>
  );
}

const Section = styled.section`
  margin: 18px 0;
  h2 {
    font-size: 18px;
    margin: 0 0 10px;
    color: ${({ theme }) => theme.colors.title};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Skel = styled.div`
  height: 140px;
  background: ${({ theme }) => theme.colors.skeleton};
  border-radius: 10px;
`;

const Empty = styled.div`
  opacity: 0.6;
  padding: 12px 0;
`;

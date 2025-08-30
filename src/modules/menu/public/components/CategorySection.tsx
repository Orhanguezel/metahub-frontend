"use client";

import styled from "styled-components";
import type { SupportedLocale } from "@/types/common";
import ItemCard from "./ItemCard";

type Props = {
  id: string;
  title: string;
  items: any[];
  lang: SupportedLocale;
  t: (k:string,d?:string)=>string;
  isLoading?: boolean;
};

export default function CategorySection({ id, title, items, lang, t, isLoading }: Props) {
  return (
    <Section id={id} aria-busy={!!isLoading}>
      <h2>{title}</h2>
      {isLoading && <Grid>
        {Array.from({length:6}).map((_,i)=> <Skel key={i} />)}
      </Grid>}
      {!isLoading && items.length === 0 && <Empty>∅</Empty>}
      {!isLoading && items.length > 0 && (
        <Grid>
          {items.map((m) => (
            <ItemCard key={m._id} item={m} lang={lang} t={t} />
          ))}
        </Grid>
      )}
    </Section>
  );
}

const Section = styled.section`
  margin:18px 0;
  h2{font-size:18px;margin:0 0 10px;color:${({theme})=>theme.colors.title};}
`;
const Grid = styled.div`
  display:grid;grid-template-columns:repeat(3,1fr);gap:12px;
  @media (max-width:900px){grid-template-columns:repeat(2,1fr);}
  @media (max-width:600px){grid-template-columns:1fr;}
`;
const Skel = styled.div`height:140px;background:${({theme})=>theme.colors.skeleton};border-radius:10px;`;
const Empty = styled.div`opacity:.6;padding:12px 0;`;

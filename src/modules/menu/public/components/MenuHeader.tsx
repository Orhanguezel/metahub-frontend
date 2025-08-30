"use client";

import styled from "styled-components";
import { getMultiLang } from "@/types/common";
import type { SupportedLocale } from "@/types/common";
import type { IMenu } from "@/modules/menu/types/menu";

const toDate = (v: any): Date | null => {
  if (!v) return null;
  const raw = typeof v === "object" && "$date" in v ? (v.$date as any) : v;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

type Props = { menu: IMenu | null; t: (k:string,d?:string)=>string; lang: SupportedLocale; isLoading?: boolean };

export default function MenuHeader({ menu, t, lang, isLoading }: Props) {
  const name = menu ? (getMultiLang(menu.name as any, lang) || menu.slug || menu.code) : "";
  const desc = menu ? (getMultiLang(menu.description as any, lang) || "") : "";

  const windowText = (() => {
    if (!menu) return "";
    const f = toDate(menu.effectiveFrom);
    const to = toDate(menu.effectiveTo);
    const fmt = (d: Date) => d.toLocaleString();
    if (f && to) return `${fmt(f)} → ${fmt(to)}`;
    if (f) return `${fmt(f)} → ∞`;
    if (to) return `−∞ → ${fmt(to)}`;
    return "";
  })();

  return (
    <Head>
      {isLoading ? <Skel style={{ height: 28, width: 240 }} /> : <Title>{name}</Title>}
      {isLoading ? <Skel style={{ height: 16, width: 420, marginTop: 8 }} /> : (desc && <Desc>{desc}</Desc>)}
      {windowText && <Meta>{t("window", "Geçerlilik")} : {windowText}</Meta>}
    </Head>
  );
}

const Head = styled.header`display:flex;flex-direction:column;gap:6px;`;
const Title = styled.h1`font-size:${({theme})=>theme.fontSizes.h2};font-weight:800;margin:0;color:${({theme})=>theme.colors.textAlt};`;
const Desc = styled.p`opacity:.95;margin:0;color:${({theme})=>theme.colors.textAlt};`;
const Meta = styled.div`opacity:.9;font-size:12px;color:${({theme})=>theme.colors.textAlt};`;
const Skel = styled.div`background:${({theme})=>theme.colors.skeleton};border-radius:6px;`;

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import apiCall from "@/lib/apiCall";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";
import { getUILang } from "@/i18n/getUILang";
import type { SupportedLocale } from "@/types/common";
import type { IMenuItem, PriceChannel } from "@/modules/menu/types/menuitem";
import { MenuItemDetail } from "@/modules/menu";

type Props = {
  params: { slug: string };
  searchParams?: { branch?: string; channel?: PriceChannel };
};

export default function ItemPage({ params, searchParams }: Props) {
  const { t, i18n } = useI18nNamespace("menu", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);
  const tt = useCallback((k: string, d?: string) => t(k, { defaultValue: d }), [t]);

  const [item, setItem] = useState<IMenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const branchId = searchParams?.branch;
  const channel = (searchParams?.channel || "delivery") as PriceChannel;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // SLUG'A DOKUNMA! Route'tan geldiği gibi kullan.
        const key = decodeURIComponent(params.slug || "");

        const res = await apiCall("get", `/menuitem/${encodeURIComponent(key)}`);
        const raw = res?.data ?? res;

        // farklı payload şekillerine tolerans
        const data: IMenuItem | null =
          (raw && raw._id) ? raw :
          (raw && raw.item && raw.item._id) ? raw.item :
          null;

        if (!alive) return;
        if (data) setItem(data); else { setItem(null); setError("not-found"); }
      } catch (e: any) {
        if (!alive) return;
        setItem(null);
        setError(e?.message || "Ürün yüklenemedi");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [params.slug]);

  if (loading) return <Center>{tt("loading", "Yükleniyor…")}</Center>;
  if (error || !item) return <Center>{tt("notFound", "Ürün bulunamadı")}</Center>;

  return (
    <Wrap>
      <MenuItemDetail item={item} lang={lang} t={tt} branchId={branchId} channel={channel} />
    </Wrap>
  );
}

const Wrap = styled.div`
  max-width: 1040px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.lg};
`;
const Center = styled.div`
  padding: ${({ theme }) => theme.spacings.xl};
  text-align: center;
`;

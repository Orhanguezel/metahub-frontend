"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/neighborhood/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateNeighborhood,
  deleteNeighborhood,
  clearNeighborhoodMessages,
} from "@/modules/neighborhood/slice/neighborhoodSlice";
import { NeighborhoodForm, NeighborhoodList } from "@/modules/neighborhood";
import type { INeighborhood } from "@/modules/neighborhood/types";
import type { SupportedLocale } from "@/types/common";

export default function AdminNeighborhoodPage() {
  const { i18n, t } = useI18nNamespace("neighborhood", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";

  const dispatch = useAppDispatch();
  const { items, loading, error, successMessage } = useAppSelector((s) => s.neighborhood);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<INeighborhood | null>(null);

  // ✅ Fetch üst parent’te yapılıyor. Burada tekrarlamıyoruz.
  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearNeighborhoodMessages());
  }, [successMessage, error, dispatch]);

  const onCreate = () => { setEditing(null); setShowForm(true); };
  const onEdit = (n: INeighborhood) => { setEditing(n); setShowForm(true); };
  const onCloseForm = () => setShowForm(false);

  // ✅ İşlem sonrası yeniden fetch yok; slice state’i güncelliyor.
  const onToggleActive = (id: string, active: boolean) =>
    dispatch(updateNeighborhood({ id, changes: { isActive: active } }));

  const onDelete = (id: string) => dispatch(deleteNeighborhood(id));

  const count = useMemo(() => items.length, [items]);

  return (
    <PageWrap>
      <Header>
        <Title>{t("admin.title", "Neighborhood Admin")}</Title>
        <Right>
          <Counter aria-label={t("admin.count", "{{count}} neighborhoods", { count })}>
            {t("admin.count", "{{count}} neighborhoods", { count })}
          </Counter>
          <PrimaryBtn onClick={onCreate}>{t("actions.new", "+ New Neighborhood")}</PrimaryBtn>
        </Right>
      </Header>

      {showForm && (
        <Card>
          <NeighborhoodForm
            initial={editing || undefined}
            onClose={onCloseForm}
            // ✅ Kaydedince sadece modalı kapatıyoruz.
            onSaved={() => setShowForm(false)}
          />
        </Card>
      )}

      <Section>
        <SectionHead>
          <H2>{t("admin.title","Neighborhood Admin")}</H2>
          {/* ❌ Refresh butonu kaldırıldı (fetch parent’ta) */}
        </SectionHead>
        <Card>
          <NeighborhoodList
            items={items}
            lang={lang}
            loading={loading}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
            onDelete={onDelete}
          />
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled (classicTheme) ---- */
const PageWrap = styled.div`
  max-width:${({theme})=>theme.layout.containerWidth};
  margin:0 auto; padding:${({theme})=>theme.spacings.xl};
  background:${({theme})=>theme.colors.background};
`;
const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  gap:${({theme})=>theme.spacings.sm}; margin-bottom:${({theme})=>theme.spacings.lg};
  ${({theme})=>theme.media.mobile}{flex-direction:column; align-items:flex-start;}
`;
const Title = styled.h1`
  color:${({theme})=>theme.colors.title}; font-family:${({theme})=>theme.fonts.heading};
  font-size:${({theme})=>theme.fontSizes.h2}; margin:0;
`;
const Right = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.sm}; align-items:center;
  ${({theme})=>theme.media.mobile}{width:100%; justify-content:space-between;}
`;
const Counter = styled.span`
  padding:6px 10px; border-radius:${({theme})=>theme.radii.pill};
  background:${({theme})=>theme.colors.primaryTransparent}; color:${({theme})=>theme.colors.primary};
  font-weight:${({theme})=>theme.fontWeights.medium};
`;
const Section = styled.section`margin-top:${({theme})=>theme.spacings.xl};`;
const SectionHead = styled.div`display:flex; align-items:center; justify-content:space-between; margin-bottom:${({theme})=>theme.spacings.sm};`;
const H2 = styled.h2`margin:0; color:${({theme})=>theme.colors.text}; font-size:${({theme})=>theme.fontSizes.large}; font-family:${({theme})=>theme.fonts.heading};`;
const Card = styled.div`
  background:${({theme})=>theme.cards.background};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.cards.border};
  border-radius:${({theme})=>theme.radii.lg}; box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;
const BaseBtn = styled.button`
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer; border:none;
  transition:opacity ${(({theme})=>theme.transition.fast)}; font-weight:${({theme})=>theme.fontWeights.medium};
  &:disabled{opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed;}
`;
const PrimaryBtn = styled(BaseBtn)`background:${({theme})=>theme.buttons.primary.background}; color:${({theme})=>theme.buttons.primary.text}; &:hover{opacity:${({theme})=>theme.opacity.hover};}`;

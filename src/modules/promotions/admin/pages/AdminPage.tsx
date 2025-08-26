"use client";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/promotions/locales";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";

import {
  fetchPromotionsAdmin,
  createPromotion,
  updatePromotion,
  deletePromotion,
  changePromotionPublish,
  changePromotionStatus,
} from "@/modules/promotions/slice";

import { PromotionsForm, List } from "@/modules/promotions";
import type { IPromotion, PromotionCreatePayload, PromotionUpdatePayload } from "@/modules/promotions/types";

/* --- helpers --- */
const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two)
    ? (two as SupportedLocale)
    : "tr";
};

/** FormData -> plain object adapter (gerekirse)
 *  Not: Burada yalnızca düz alanları topluyoruz.
 *  rules/effect gibi nested alanlar için Form tarafında JSON string olarak append edip burada JSON.parse yapabilirsiniz.
 */

export default function AdminPromotionsPage() {
  const { i18n, t } = useI18nNamespace("promotions", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const dispatch = useAppDispatch();

  // state
  const promotions = useAppSelector((s) => (s.promotions?.adminList ?? []) as IPromotion[]);
  const loading = useAppSelector((s) => s.promotions?.loading);
  const error = useAppSelector((s) => s.promotions?.error);

  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingItem, setEditingItem] = useState<IPromotion | null>(null);

  useEffect(() => {
    // ilk yüklemede admin list
    dispatch(fetchPromotionsAdmin({}) as any);
  }, [dispatch]);

  /* --- actions --- */

  // Form bileşeniniz JSON payload veriyorsa direkt kabul; aksi halde FormData ise adapt et
 const handleSubmit = async (
  payload: PromotionCreatePayload | PromotionUpdatePayload,
  id?: string
) => {
  const body = payload; // JSON zaten doğru tipte geliyor
  try {
    if (id) {
      await (dispatch(updatePromotion({ id, patch: body as PromotionUpdatePayload }) as any)).unwrap();
    } else {
      await (dispatch(createPromotion(body as PromotionCreatePayload) as any)).unwrap();
    }
    setEditingItem(null);
    setActiveTab("list");
    dispatch(fetchPromotionsAdmin({}) as any);
  } catch {}
};


  const handleDelete = async (id: string) => {
    const confirmMsg = t("confirm.delete_promotion", "Bu promosyonu silmek istediğinize emin misiniz?");
    if (!confirm(confirmMsg)) return;
    try {
      await (dispatch(deletePromotion(id) as any)).unwrap();
      dispatch(fetchPromotionsAdmin({}) as any);
    } catch {}
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(changePromotionPublish({ id, isPublished: !isPublished }) as any)
      .unwrap()
      .then(() => dispatch(fetchPromotionsAdmin({}) as any))
      .catch(() => {});
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    dispatch(changePromotionStatus({ id, isActive: !isActive }) as any)
      .unwrap()
      .then(() => dispatch(fetchPromotionsAdmin({}) as any))
      .catch(() => {});
  };

  const count = promotions?.length ?? 0;

  /* --- UI --- */
  return (
    <PageWrap>
      {/* Header */}
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Promotions")}</h1>
          <Subtitle>{t("admin.subtitle", "Create, organize and publish your promotions")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="promotions-count">{count}</Counter>
          <PrimaryBtn
            onClick={() => {
              setEditingItem(null);
              setActiveTab("create");
            }}
          >
            + {t("create", "Create")}
          </PrimaryBtn>
        </Right>
      </Header>

      {/* Tabs */}
      <Tabs>
        <Tab $active={activeTab === "list"} onClick={() => setActiveTab("list")}>
          {t("list", "List")}
        </Tab>
        <Tab $active={activeTab === "create"} onClick={() => setActiveTab("create")}>
          {t("create", "Create")}
        </Tab>
      </Tabs>

      {/* Content */}
      <Section>
        <SectionHead>
          <h2>
            {activeTab === "list" && t("list", "List")}
            {activeTab === "create" && (editingItem ? t("edit", "Edit") : t("create", "Create"))}
          </h2>
          {activeTab === "list" ? (
            <SmallBtn disabled={!!loading} onClick={() => dispatch(fetchPromotionsAdmin({}) as any)}>
              {t("refresh", "Refresh")}
            </SmallBtn>
          ) : (
            <SmallBtn onClick={() => setActiveTab("list")}>{t("backToList", "Back to list")}</SmallBtn>
          )}
        </SectionHead>

        <Card>
          {activeTab === "list" && (
            <List
              promotions={promotions}
              lang={lang}
              loading={!!loading}
              error={error}
              onEdit={(item: IPromotion) => {
                setEditingItem(item);
                setActiveTab("create");
              }}
              onDelete={handleDelete}
              // List bileşeniniz aşağıdaki iki prop'u desteklemiyorsa ekleyin:
              onTogglePublish={(id: string, isPublished: boolean) =>
                handleTogglePublish(id, isPublished)
              }
              onToggleActive={(id: string, isActive: boolean) =>
                handleToggleActive(id, isActive)
              }
            />
          )}

          {activeTab === "create" && (
            <PromotionsForm
              initial={editingItem as any}
              lang={lang}
              onCancel={() => {
                setEditingItem(null);
                setActiveTab("list");
              }}
              onSubmit={handleSubmit}
            />
          )}
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled ---- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column; align-items: flex-start; gap: ${({ theme }) => theme.spacings.sm};
  }
`;
const TitleBlock = styled.div`
  display:flex; flex-direction:column; gap:4px;
  h1{ margin:0; }
`;
const Subtitle = styled.p`
  margin:0; color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.sm};
`;
const Right = styled.div`display:flex; gap:${({ theme }) => theme.spacings.sm}; align-items:center;`;
const Counter = styled.span`
  padding: 6px 10px; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const Tabs = styled.div`display:flex; gap:${({ theme }) => theme.spacings.xs}; margin-bottom:${({ theme }) => theme.spacings.md};`;
const Tab = styled.button<{ $active?: boolean }>`
  padding:8px 12px; border-radius:${({ theme }) => theme.radii.pill};
  background:${({ $active, theme }) => ($active ? theme.colors.primaryLight : theme.colors.cardBackground)};
  color:${({ theme }) => theme.colors.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor:pointer;
`;
const Section = styled.section`margin-top: ${({ theme }) => theme.spacings.sm};`;
const SectionHead = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({ theme }) => theme.spacings.sm};
`;
const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;
const PrimaryBtn = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;

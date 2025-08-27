"use client";
import styled from "styled-components";
import { useState, useMemo, useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/webhooks/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createWebhookEndpoint,
  updateWebhookEndpoint,
  deleteWebhookEndpoint,
  fetchWebhookEndpoints,
  selectWebhookEndpoints,
  selectWebhooksLoading,
  selectWebhooksError,
} from "@/modules/webhooks/slice";

import { WebhooksForm, List } from "@/modules/webhooks";
import type {
  IWebhookEndpointFE,
  WebhookEndpointCreatePayload,
  WebhookEndpointUpdatePayload,
} from "@/modules/webhooks/types";

import { getUILang } from "@/i18n/getUILang";

/* ------------ helpers: FormData -> JSON ------------ */
const parseIfJson = (v: any) => {
  try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return v; }
};

const formDataToJson = (
  fd: FormData
): WebhookEndpointCreatePayload | WebhookEndpointUpdatePayload => {
  const obj: Record<string, any> = {};
  for (const [k, v] of fd.entries()) obj[k] = v;

  // JSON beklenen alanlar
  for (const k of ["events","headers","signing","retry"]) {
    if (k in obj) obj[k] = parseIfJson(obj[k]);
  }
  // booleanlar
  for (const k of ["isActive","verifySSL","rotateSecret"]) {
    if (k in obj) obj[k] = obj[k] === "true" || obj[k] === true;
  }
  // sayısal alanlar
  if ("retry" in obj && obj.retry) {
    for (const n of ["maxAttempts","baseBackoffSec","timeoutMs"]) {
      if (obj.retry[n] !== undefined && obj.retry[n] !== "") {
        obj.retry[n] = Number(obj.retry[n]);
      }
    }
  }
  return obj as WebhookEndpointCreatePayload & WebhookEndpointUpdatePayload;
};

export default function AdminWebhooksPage() {
  const { i18n, t } = useI18nNamespace("webhooks", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const dispatch = useAppDispatch();

  // 🔎 slice selector’ları
  const endpoints = useAppSelector(selectWebhookEndpoints);
  const loading   = useAppSelector(selectWebhooksLoading);
  const error     = useAppSelector(selectWebhooksError);

  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingItem, setEditingItem] = useState<IWebhookEndpointFE | null>(null);

  // ⤵️ İlk yüklemede listeyi getir
  useEffect(() => {
    dispatch(fetchWebhookEndpoints());
  }, [dispatch]);

  // JSON beklenir; FormData gelirse çevir
  const handleSubmit = async (
    data: WebhookEndpointCreatePayload | WebhookEndpointUpdatePayload | FormData,
    id?: string
  ) => {
    try {
      const payload =
        typeof FormData !== "undefined" && data instanceof FormData
          ? formDataToJson(data)
          : (data as WebhookEndpointCreatePayload | WebhookEndpointUpdatePayload);

      if (id) {
        await (dispatch(updateWebhookEndpoint({ id, patch: payload as WebhookEndpointUpdatePayload }) as any)).unwrap();
      } else {
        await (dispatch(createWebhookEndpoint(payload as WebhookEndpointCreatePayload) as any)).unwrap();
      }
      setEditingItem(null);
      setActiveTab("list");
      dispatch(fetchWebhookEndpoints());
    } catch {
      // hata mesajı slice’tan okunur
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t("confirm.delete_endpoint", "Bu webhook endpointini silmek istediğinize emin misiniz?");
    if (confirm(confirmMsg)) {
      await (dispatch(deleteWebhookEndpoint(id) as any)).unwrap().catch(() => {});
      dispatch(fetchWebhookEndpoints());
    }
  };

  // aktif/pasif toggle (isActive flip)
  const handleToggleActive = (id: string, isActive: boolean) => {
    dispatch(updateWebhookEndpoint({ id, patch: { isActive: !isActive } }) as any)
      .unwrap()
      .then(() => dispatch(fetchWebhookEndpoints()))
      .catch(() => {});
  };

  const count = endpoints?.length ?? 0;

  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Webhooks")}</h1>
          <Subtitle>{t("admin.subtitle", "Create, organize and manage your webhook endpoints")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="webhooks-count">{count}</Counter>
          <PrimaryBtn onClick={() => { setEditingItem(null); setActiveTab("create"); }}>
            + {t("create", "Create")}
          </PrimaryBtn>
        </Right>
      </Header>

      <Tabs>
        <Tab $active={activeTab === "list"} onClick={() => setActiveTab("list")}>
          {t("list", "List")}
        </Tab>
        <Tab $active={activeTab === "create"} onClick={() => setActiveTab("create")}>
          {t("create", "Create")}
        </Tab>
      </Tabs>

      <Section>
        <SectionHead>
          <h2>{activeTab === "list" ? t("list", "List") : t("create", "Create")}</h2>
          {activeTab === "list" ? (
            <SmallBtn onClick={() => dispatch(fetchWebhookEndpoints())} disabled={loading}>
              {t("refresh", "Refresh")}
            </SmallBtn>
          ) : (
            <SmallBtn onClick={() => setActiveTab("list")}>
              {t("backToList", "Back to list")}
            </SmallBtn>
          )}
        </SectionHead>

        <Card>
          {activeTab === "list" && (
            <List
              endpoints={endpoints || []}
              lang={lang}
              loading={loading}
              error={error}
              onEdit={(item: IWebhookEndpointFE) => { setEditingItem(item); setActiveTab("create"); }}
              onDelete={handleDelete}
              onToggleActive={(id: string, current: boolean) => handleToggleActive(id, current)}
            />
          )}

          {activeTab === "create" && (
            <WebhooksForm
              initial={editingItem}
              onCancel={() => { setEditingItem(null); setActiveTab("list"); }}
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
const TitleBlock = styled.div`display:flex; flex-direction:column; gap:4px; h1{ margin:0; }`;
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

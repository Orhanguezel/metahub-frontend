"use client";
import styled from "styled-components";
import { useState, useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/branch/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createBranch,
  updateBranch,
  deleteBranch,
  changeBranchStatus, 
} from "@/modules/branch/slice";

import { BranchForm, List } from "@/modules/branch";
import type { IBranch, BranchCreatePayload, BranchUpdatePayload } from "@/modules/branch/types";

import { getUILang } from "@/i18n/getUILang";

// FormData gelirse JSON’a çevir (geriye uyumluluk)
const parseIfJson = (v: any) => {
  try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return v; }
};
const formDataToBranchJson = (fd: FormData): BranchCreatePayload | BranchUpdatePayload => {
  const obj: Record<string, any> = {};
  for (const [k, v] of fd.entries()) obj[k] = v;

  // JSON beklenen alanlar
  for (const k of ["name","address","location","services","openingHours","deliveryZones"]) {
    if (k in obj) obj[k] = parseIfJson(obj[k]);
  }
  // sayısal alanlar
  if (obj.minPrepMinutes !== undefined && obj.minPrepMinutes !== "") obj.minPrepMinutes = Number(obj.minPrepMinutes);
  // boolean alanlar
  if (obj.isActive !== undefined) obj.isActive = obj.isActive === "true" || obj.isActive === true;

  return obj as BranchCreatePayload & BranchUpdatePayload;
};

export default function AdminBranchPage() {
  const { i18n, t } = useI18nNamespace("branch", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const branches = useAppSelector((s) => s.branch?.adminList ?? []);
  const loading  = useAppSelector((s) => s.branch?.loading);
  const error    = useAppSelector((s) => s.branch?.error);

  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingItem, setEditingItem] = useState<IBranch | null>(null);

  const dispatch = useAppDispatch();

  // JSON beklenir; FormData gelirse çevir
  const handleSubmit = async (
    data: BranchCreatePayload | BranchUpdatePayload | FormData,
    id?: string
  ) => {
    try {
      const payload =
        typeof FormData !== "undefined" && data instanceof FormData
          ? formDataToBranchJson(data)
          : (data as BranchCreatePayload | BranchUpdatePayload);

      if (id) {
        await (dispatch(updateBranch({ id, patch: payload as BranchUpdatePayload }) as any)).unwrap();
      } else {
        await (dispatch(createBranch(payload as BranchCreatePayload) as any)).unwrap();
      }
      setEditingItem(null);
      setActiveTab("list");
    } catch {/* hata mesajı slice’tan okunur */}
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t("confirm.delete_branch", "Bu şubeyi silmek istediğinize emin misiniz?");
    if (confirm(confirmMsg)) {
      await (dispatch(deleteBranch(id) as any)).unwrap().catch(() => {});
    }
  };

  // “publish” yerine isActive toggle
  const handleToggleActive = (id: string, isActive: boolean) => {
    dispatch(changeBranchStatus({ id, isActive: !isActive }) as any);
  };

  const count = branches?.length ?? 0;

  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Branches")}</h1>
          <Subtitle>{t("admin.subtitle", "Create, organize and manage your branches")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="branch-count">{count}</Counter>
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
            <SmallBtn disabled={loading}>
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
              branch={branches}
              lang={lang}
              loading={loading}
              error={error}
              onEdit={(item: IBranch) => { setEditingItem(item); setActiveTab("create"); }}
              onDelete={handleDelete}
              onTogglePublish={(id: string, current: boolean) => handleToggleActive(id, current)} // geriye uyumluluk
            />
          )}

          {activeTab === "create" && (
            <BranchForm
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

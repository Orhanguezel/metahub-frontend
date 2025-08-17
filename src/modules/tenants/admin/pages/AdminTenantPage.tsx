// AdminTenantPage.tsx
"use client";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createTenant,
  updateTenant,
  deleteTenant,
  setSelectedTenant,
  clearSelectedTenant,
  clearTenantMessages,
  fetchTenants,
} from "@/modules/tenants/slice/tenantSlice";
import { ITenant } from "@/modules/tenants/types";
import { TenantFormModal, TenantList, TenantTabs } from "@/modules/tenants";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/tenants";
import type { SupportedLocale } from "@/types/common";

type ActiveTab = "list" | "form";

export default function AdminTenantPage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("tenant", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { tenants, loading, error, selectedTenant, successMessage } = useAppSelector(
    (state) => state.tenants
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>("list");
  const count = Array.isArray(tenants) ? tenants.length : 0;

  useEffect(() => {
    if (!tenants.length) dispatch(fetchTenants());
    return () => {
      dispatch(clearTenantMessages());
    };
  }, [dispatch, tenants.length]);

  useEffect(() => {
    if (successMessage) dispatch(clearTenantMessages());
    if (error) dispatch(clearTenantMessages());
  }, [successMessage, error, dispatch]);

  const handleFormSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateTenant({ id, formData })).unwrap();
    } else {
      await dispatch(createTenant(formData)).unwrap();
    }
    dispatch(clearSelectedTenant());
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("admin.confirm.delete_tenant", "Are you sure you want to delete this tenant?"))) {
      await dispatch(deleteTenant(id)).unwrap();
    }
  };

  const handleEdit = (tenant: ITenant) => {
    dispatch(setSelectedTenant(tenant));
    setActiveTab("form");
  };

  const handleCreate = () => {
    dispatch(clearSelectedTenant());
    setActiveTab("form");
  };

  const handleModalClose = () => {
    dispatch(clearSelectedTenant());
    setActiveTab("list");
  };

  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Tenant Management")}</h1>
          <Subtitle>{t("admin.subtitle", "Create, organize and manage tenants")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="tenant-count">{count}</Counter>
          <PrimaryBtn onClick={handleCreate}>+ {t("admin.create", "Add Tenant")}</PrimaryBtn>
        </Right>
      </Header>

      <TabsWrap>
        <TenantTabs activeTab={activeTab} onChange={setActiveTab} />
      </TabsWrap>

      <Section>
        <SectionHead>
          <h2>
            {activeTab === "list" && t("admin.tabs.tenant", "Tenants")}
            {activeTab === "form" && t("admin.tabs.create", "Add New")}
          </h2>
          {activeTab === "form" ? (
            <SmallBtn onClick={() => setActiveTab("list")}>{t("backToList", "Back to list")}</SmallBtn>
          ) : (
            <SmallBtn disabled={loading}>{t("refresh", "Refresh")}</SmallBtn>
          )}
        </SectionHead>

        <Card>
          {activeTab === "list" && (
            <TenantList
              tenants={tenants}
              lang={lang}
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {activeTab === "form" && (
            <TenantFormModal
              isOpen
              editingItem={selectedTenant}
              onClose={handleModalClose}
              onSubmit={handleFormSubmit}
            />
          )}
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled (admin pattern) ---- */
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
  h1 { margin: 0; }
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Right = styled.div`
  display:flex; gap:${({ theme }) => theme.spacings.sm}; align-items:center;
`;

const Counter = styled.span`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const TabsWrap = styled.div`
  margin-bottom:${({ theme }) => theme.spacings.md};
`;

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

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
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding:8px 12px; border-radius:${({ theme }) => theme.radii.md}; cursor:pointer;
  &:hover{ background:${({ theme }) => theme.buttons.primary.backgroundHover}; }
`;

const SmallBtn = styled.button`
  background:${({ theme }) => theme.buttons.secondary.background};
  color:${({ theme }) => theme.buttons.secondary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding:6px 10px; border-radius:${({ theme }) => theme.radii.md}; cursor:pointer;
`;

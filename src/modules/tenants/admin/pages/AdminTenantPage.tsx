"use client";
import { useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createTenant,
  updateTenant,
  deleteTenant,
  setSelectedTenant,
  clearSelectedTenant,
} from "@/modules/tenants/slice/tenantSlice";
import { ITenant } from "@/modules/tenants/types";
import { TenantFormModal, TenantList, TenantTabs } from "@/modules/tenants";
import { useTranslation } from "react-i18next";

type ActiveTab = "list" | "form";

export default function AdminTenantPage() {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("tenants");
  const lang = i18n.language || "en";

  const { tenants, loading, error, selectedTenant } = useAppSelector(
    (state) => state.tenant
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>("list");

  // Modal Submit
  const handleFormSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateTenant({ id, formData })).unwrap();
    } else {
      await dispatch(createTenant(formData)).unwrap();
    }
    dispatch(clearSelectedTenant());
    setActiveTab("list");
  };

  // Tenant Sil
  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        t(
          "admin.confirm.delete_tenant",
          "Are you sure you want to delete this tenant?"
        )
      )
    ) {
      await dispatch(deleteTenant(id)).unwrap();
    }
  };

  // Tenant Düzenle
  const handleEdit = (tenant: ITenant) => {
    dispatch(setSelectedTenant(tenant._id || ""));
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
    <Wrapper>
      <Header>
        <Title>{t("admin.title", "Tenant Management")}</Title>
        <AddButton onClick={handleCreate}>
          {t("admin.create", "Add Tenant")}
        </AddButton>
      </Header>

      <TenantTabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
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
            isOpen={true}
            editingItem={selectedTenant}
            onClose={handleModalClose}
            onSubmit={handleFormSubmit}
          />
        )}
      </TabContent>
    </Wrapper>
  );
}
// ...styled-components aynı kalabilir

// ----------------- Styled Components -----------------
const Wrapper = styled.div`
  max-width: 1200px;
  margin: auto;
  padding: ${({ theme }) => theme.layout.sectionspacings || "2rem"}
    ${({ theme }) => theme.spacings.md || "1.5rem"};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg || "2rem"};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg || "1.5rem"};
  color: ${({ theme }) => theme.colors.text || "#222"};
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

const TabContent = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground || "#fff"};
  border: 1px solid ${({ theme }) => theme.colors.border || "#eee"};
  padding: ${({ theme }) => theme.spacings.lg || "2rem"};
  border-radius: ${({ theme }) => theme.radii.md || "12px"};
`;

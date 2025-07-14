"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { SUPPORTED_LOCALES } from "@/i18n";
import {
  createTenant,
} from "@/modules/tenants/slice/tenantSlice";
import { useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/adminmodules";
import { toast } from "react-toastify";

const BatchAddTenantsForm: React.FC = () => {
  console.log("BatchAddTenantsForm render edildi");

   const { t } = useI18nNamespace("adminModules", translations);
  const dispatch = useAppDispatch();
  const [tenantNames, setTenantNames] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleBatchAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const tenants = tenantNames
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter(Boolean);

    if (!tenants.length) return;
    setLoading(true);

    try {
      // Her tenant için FormData oluştur
      await Promise.all(
        tenants.map(async (tenant) => {
          const formData = new FormData();
          // Desteklenen dillere doldur
          SUPPORTED_LOCALES.forEach((locale) =>
            formData.append(`name[${locale}]`, tenant)
          );
          // Diğer zorunlu alanlar
          formData.append(
            "slug",
            tenant
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-|-$/g, "")
          );
          // Örnek: formData.append("isActive", "true");

          await dispatch(createTenant(formData)).unwrap();
        })
      );
      setTenantNames("");
      toast.success(t("batchAddSuccess", "Tenants added successfully!"));
    } catch (err: any) {
      toast.error(
        t("batchAddError", "Batch add failed!") +
          (err?.message ? `: ${err.message}` : "")
      );
    }
    setLoading(false);
  };

  return (
    <PanelCard>
      <Title>{t("batchAddTenants", "Batch Add Tenants")}</Title>
      <StyledForm onSubmit={handleBatchAdd}>
        <TextArea
          rows={4}
          value={tenantNames}
          onChange={(e) => setTenantNames(e.target.value)}
          placeholder={t(
            "tenantNames",
            "Tenant names (comma or line separated)"
          )}
          disabled={loading}
          aria-label={t("tenantNames", "Tenant names")}
        />
        <AddButton type="submit" disabled={loading || !tenantNames.trim()}>
          {loading ? t("adding", "Adding...") : t("add", "Add")}
        </AddButton>
      </StyledForm>
      <HelperText>
        {t(
          "batchAddHint",
          "You can enter multiple tenant names, separated by comma or newline."
        )}
      </HelperText>
    </PanelCard>
  );
};

export default BatchAddTenantsForm;

// --- STYLED COMPONENTS ---
const PanelCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 22px 22px 16px 22px;
  min-width: 270px;
  flex: 1 1 270px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 1.08em;
  margin-bottom: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 66px;
  padding: 9px 12px;
  border: 1.3px solid #bbb;
  border-radius: 7px;
  font-size: 15px;
  font-family: inherit;
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  resize: vertical;
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 0;
  font-weight: 600;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.14s;
  margin-top: 5px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primaryHover || "#1890ff"};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HelperText = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  margin-top: 7px;
`;

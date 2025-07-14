"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "react-toastify";
import {
  assignAllModulesToTenant,
  assignModuleToAllTenants,
} from "@/modules/adminmodules/slices/moduleMaintenanceSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/adminmodules";

const BatchAssignModuleForm: React.FC = () => {
   const { t } = useI18nNamespace("adminModules", translations);
  const dispatch = useAppDispatch();
  const [tenant, setTenant] = useState<string>("");
  const [module, setModule] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Tenant’a tüm modülleri ata
  const handleAssignAllToTenant = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(assignAllModulesToTenant(tenant)).unwrap();
      setTenant("");
      toast.success(t("assignSuccess", "Modules assigned to tenant!"));
    } catch (err: any) {
      toast.error(
        t("assignError", "Failed to assign modules") +
          (err?.message ? `: ${err.message}` : "")
      );
    } finally {
      setLoading(false);
    }
  };

  // Modülü tüm tenantlara ata
  const handleAssignModuleToAllTenants = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(assignModuleToAllTenants(module)).unwrap();
      setModule("");
      toast.success(t("assignSuccess", "Module assigned to all tenants!"));
    } catch (err: any) {
      toast.error(
        t("assignError", "Failed to assign modules") +
          (err?.message ? `: ${err.message}` : "")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PanelCard>
      <Title>{t("batchAssign", "Batch Assign")}</Title>
      <AssignForm onSubmit={handleAssignAllToTenant}>
        <label>{t("tenantName", "Tenant name")}</label>
        <input
          value={tenant}
          onChange={(e) => setTenant(e.target.value)}
          placeholder={t("tenantName", "Tenant name")}
          disabled={loading}
          autoComplete="off"
        />
        <ActionButton type="submit" disabled={loading || !tenant}>
          {t("assignAllToTenant", "Assign All Modules to Tenant")}
        </ActionButton>
      </AssignForm>
      <AssignForm onSubmit={handleAssignModuleToAllTenants}>
        <label>{t("moduleName", "Module name")}</label>
        <input
          value={module}
          onChange={(e) => setModule(e.target.value)}
          placeholder={t("moduleName", "Module name")}
          disabled={loading}
          autoComplete="off"
        />
        <ActionButton type="submit" disabled={loading || !module}>
          {t("assignToAllTenants", "Assign Module to All Tenants")}
        </ActionButton>
      </AssignForm>
    </PanelCard>
  );
};

export default BatchAssignModuleForm;

// --- Styles ---
const PanelCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.09);
  padding: 20px 22px 18px 22px;
  min-width: 260px;
  max-width: 350px;
  flex: 1 1 270px;
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 22px;

  @media (max-width: 650px) {
    min-width: 95vw;
    max-width: 100vw;
    padding: 16px 7vw 12px 7vw;
  }
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 1.13em;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.text};
`;

const AssignForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 0;
  label {
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  input {
    flex: 1 1 80px;
    padding: 7px 12px;
    border: 1px solid #bbb;
    border-radius: 6px;
    font-size: 1em;
    margin-bottom: 0;
  }
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 9px 0;
  font-weight: 600;
  font-size: 1em;
  width: 100%;
  margin-top: 3px;
  cursor: pointer;
  transition: background 0.13s;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primaryHover || "#00d0df"};
  }
  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

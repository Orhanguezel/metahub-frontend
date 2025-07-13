"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { XCircle, Pencil, AlertTriangle } from "lucide-react";
import translations from "../../../locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import type { SupportedLocale } from "@/types/common";
import { EditTenantModuleModal } from "@/modules/adminmodules";

// --- Tipler ---
interface ModuleSetting {
  module: string;
  tenant: string;
  enabled?: boolean;
  visibleInSidebar?: boolean;
  useAnalytics?: boolean;
  showInDashboard?: boolean;
  roles?: string[];
  order?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: any;
}

interface TenantModuleDetailModalProps {
  module: ModuleSetting;
  onClose: () => void;
  onAfterAction?: () => void;
  globalEnabled?: boolean;
}

const TenantModuleDetailModal: React.FC<TenantModuleDetailModalProps> = ({
  module,
  onClose,
  onAfterAction,
  globalEnabled,
}) => {
   const { i18n, t } = useI18nNamespace("adminModules", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  // --- Tenant’a özel modül adı/tenant etiketi ---
  const tenantLabel = module.tenant || "-";
  const moduleName = module.module || "-";

  // --- Gerçek enable durumu ---
  const isGloballyEnabled =
    typeof globalEnabled === "boolean" ? globalEnabled : true;
  const isActive = !!module.enabled && isGloballyEnabled;

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    if (onAfterAction) onAfterAction();
  };

  return (
    <>
      <Overlay>
        <Modal>
          <Header>
            <Title>
              {moduleName}
              <TenantName>
                {" | "}
                <span style={{ color: "#0086E0" }}>{tenantLabel}</span>
              </TenantName>
            </Title>
            <ButtonGroup>
              <EditButton
                type="button"
                onClick={() => setEditModalOpen(true)}
                aria-label={t("edit", "Edit")}
                disabled={!isGloballyEnabled}
                title={
                  !isGloballyEnabled
                    ? t(
                        "globalDisabledWarn",
                        "Globally disabled. You can't edit tenant settings."
                      )
                    : undefined
                }
              >
                <Pencil size={18} />
              </EditButton>
              <CloseButton
                type="button"
                onClick={onClose}
                aria-label={t("close", "Close")}
              >
                <XCircle size={18} />
              </CloseButton>
            </ButtonGroup>
          </Header>

          <Content>
            {/* --- Global disable uyarısı --- */}
            {!isGloballyEnabled && (
              <WarnBox>
                <AlertTriangle size={16} style={{ marginRight: 6 }} />
                {t(
                  "globalDisabledWarn",
                  "This module is globally disabled. Tenant settings are ignored."
                )}
              </WarnBox>
            )}

            <DetailItem>
              <strong>{t("createdAt", "Created At")}:</strong>{" "}
              {module?.createdAt
                ? new Date(module.createdAt).toLocaleString(lang)
                : "-"}
            </DetailItem>
            <DetailItem>
              <strong>{t("updatedAt", "Updated At")}:</strong>{" "}
              {module?.updatedAt
                ? new Date(module.updatedAt).toLocaleString(lang)
                : "-"}
            </DetailItem>
            <DetailItem>
              <strong>{t("type", "Module Type")}:</strong>{" "}
              {t("tenant", "Tenant")}
            </DetailItem>
            <DetailItem>
              <strong>{t("enabled", "Enabled")}:</strong>{" "}
              <BoolDot $active={isActive} />
              <span>
                {isActive
                  ? t("yes", "Yes")
                  : !isGloballyEnabled
                  ? t("noGlobal", "No (global disabled)")
                  : t("no", "No")}
              </span>
            </DetailItem>
            {"visibleInSidebar" in module && (
              <DetailItem>
                <strong>{t("visibleInSidebar", "Show in Sidebar")}:</strong>{" "}
                <BoolDot
                  $active={!!module.visibleInSidebar && isGloballyEnabled}
                />
                <span>
                  {module.visibleInSidebar && isGloballyEnabled
                    ? t("yes", "Yes")
                    : t("no", "No")}
                </span>
              </DetailItem>
            )}
            {"useAnalytics" in module && (
              <DetailItem>
                <strong>{t("useAnalytics", "Analytics")}:</strong>{" "}
                <BoolDot $active={!!module.useAnalytics && isGloballyEnabled} />
                <span>
                  {module.useAnalytics && isGloballyEnabled
                    ? t("yes", "Yes")
                    : t("no", "No")}
                </span>
              </DetailItem>
            )}
            {"showInDashboard" in module && (
              <DetailItem>
                <strong>{t("showInDashboard", "Dashboard")}:</strong>{" "}
                <BoolDot
                  $active={!!module.showInDashboard && isGloballyEnabled}
                />
                <span>
                  {module.showInDashboard && isGloballyEnabled
                    ? t("yes", "Yes")
                    : t("no", "No")}
                </span>
              </DetailItem>
            )}
            <DetailItem>
              <strong>{t("roles", "Roles")}:</strong>{" "}
              {Array.isArray(module.roles) ? module.roles.join(", ") : "-"}
            </DetailItem>
            {"order" in module && (
              <DetailItem>
                <strong>{t("order", "Order")}:</strong> {module.order ?? "-"}
              </DetailItem>
            )}
          </Content>
        </Modal>
      </Overlay>

      {/* Düzenleme Modalı */}
      {isEditModalOpen && (
        <EditTenantModuleModal
          module={{
            ...module,
            createdAt: module.createdAt
              ? new Date(module.createdAt)
              : undefined,
            updatedAt: module.updatedAt
              ? new Date(module.updatedAt)
              : undefined,
          }}
          onClose={() => setEditModalOpen(false)}
          onAfterAction={handleEditSuccess}
        />
      )}
    </>
  );
};

export default TenantModuleDetailModal;

// --- Styled Components ---
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacings.lg};
  max-width: 480px;
  width: 96%;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacings.md};
  }
`;

const WarnBox = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.warning};
  color: #fff;
  font-size: 13px;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 7px 11px;
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: 0;
`;

const TenantName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.info};
  margin-left: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const EditButton = styled.button`
  background: ${({ theme }) => theme.colors.warning};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transition.fast};
  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transition.fast};
  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const DetailItem = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const BoolDot = styled.span<{ $active: boolean }>`
  display: inline-block;
  width: 11px;
  height: 11px;
  margin-right: 6px;
  border-radius: 50%;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.success : theme.colors.danger};
  border: 1.5px solid #ddd;
  vertical-align: middle;
`;

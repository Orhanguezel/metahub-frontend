"use client";
import React from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cleanupOrphanModuleSettings } from "@/modules/adminmodules/slices/moduleMaintenanceSlice";
import { useTranslation } from "react-i18next";

const BatchCleanupOrphanSettings: React.FC = () => {
  const { t } = useTranslation("adminModules");
  const dispatch = useAppDispatch();
  const { maintenanceLoading, orphans = [] } = useAppSelector(
    (s) => s.moduleMaintenance
  );

  return (
    <PanelCard>
      <Title>{t("cleanupOrphan", "Cleanup Orphan Settings")}</Title>
      <ActionRow>
        <CleanupButton
          type="button"
          onClick={() => dispatch(cleanupOrphanModuleSettings())}
          disabled={maintenanceLoading}
        >
          {maintenanceLoading
            ? t("cleaning", "Cleaning...")
            : t("cleanupNow", "Cleanup Now")}
        </CleanupButton>
      </ActionRow>
      {orphans.length > 0 && (
        <OrphanBox>
          <b>{t("orphans", "Orphan Settings")}:</b>
          <pre>{JSON.stringify(orphans, null, 2)}</pre>
        </OrphanBox>
      )}
    </PanelCard>
  );
};

export default BatchCleanupOrphanSettings;

// --- Styled Components ---
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
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
`;

const CleanupButton = styled.button`
  background: ${({ theme }) => theme.colors.warning};
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 8px 20px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  min-width: 120px;
  transition: background 0.13s;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.warningHover || "#ffd042"};
    color: #222;
  }
  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

const OrphanBox = styled.div`
  background: #fffbe6;
  border: 1px solid #ffe58f;
  padding: 13px 12px;
  margin-top: 16px;
  font-size: 13px;
  color: #333;
  border-radius: 7px;
  max-height: 210px;
  overflow: auto;
  font-family: "Fira Mono", "Menlo", monospace;
`;

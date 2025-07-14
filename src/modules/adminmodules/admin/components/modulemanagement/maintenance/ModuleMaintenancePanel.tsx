"use client";
import React from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  repairModuleSettings,
  assignAllModulesToTenant,
  cleanupOrphanModuleSettings,
} from "@/modules/adminmodules/slices/moduleMaintenanceSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/adminmodules";

import {
  ModuleTenantMatrixTable,
  BatchUpdateModuleForm,
  BatchCleanupOrphanSettings,
  BatchAssignModuleForm,
  BatchDeleteModulesForm,
  BatchAddTenantsForm,
  ModuleJsonImportExportPanel,
  MaintenanceLogBox,
} from "@/modules/adminmodules";


interface ModuleMaintenancePanelProps {
  selectedTenant?: string;
}

const ModuleMaintenancePanel: React.FC<ModuleMaintenancePanelProps> = ({
  selectedTenant,
}) => {
  const dispatch = useAppDispatch();
   const { t } = useI18nNamespace("adminModules", translations);
  const { maintenanceLoading, maintenanceError, lastAction } = useAppSelector(
    (state) => state.moduleMaintenance
  );

  return (
    <PanelContainer>
      <SectionTitle>
        🛠 {t("maintenance", "Maintenance & Batch Actions")}
      </SectionTitle>
      <ButtonRow>
        <MaintButton
          onClick={() => dispatch(repairModuleSettings())}
          disabled={maintenanceLoading}
        >
          {t("repairSettings", "Repair Missing Settings")}
        </MaintButton>
        <MaintButton
          onClick={() =>
            selectedTenant && dispatch(assignAllModulesToTenant(selectedTenant))
          }
          disabled={maintenanceLoading}
        >
          {t("assignAllToTenant", "Assign All To Tenant")}
        </MaintButton>
        <MaintButton
          onClick={() => dispatch(cleanupOrphanModuleSettings())}
          disabled={maintenanceLoading}
        >
          {t("cleanupOrphan", "Cleanup Orphan Settings")}
        </MaintButton>
        <MaintButton
          onClick={() => {}}
          disabled={maintenanceLoading}
        >
          {t("fetchMatrix", "Fetch Module-Tenant Matrix")}
        </MaintButton>
      </ButtonRow>

      {(maintenanceError || maintenanceLoading || lastAction) && (
        <FeedbackArea>
          {maintenanceError && <ErrorBox>{maintenanceError}</ErrorBox>}
          {maintenanceLoading && (
            <InfoBox>{t("loading", "Loading...")}</InfoBox>
          )}
          {lastAction && (
            <SmallInfo>
              <b>{t("lastAction", "Last action")}:</b> {lastAction}
            </SmallInfo>
          )}
        </FeedbackArea>
      )}

      <CardSection>
        <Card>
          <BatchUpdateModuleForm />
        </Card>
        <Card>
          <BatchCleanupOrphanSettings />
        </Card>
        <Card>
          <BatchAssignModuleForm />
        </Card>
        <Card>
          <BatchDeleteModulesForm />
        </Card>
        <Card>
          <BatchAddTenantsForm />
        </Card>
        <Card>
          <ModuleJsonImportExportPanel />
        </Card>
      </CardSection>

      <LogSection>
        <MaintenanceLogBox />
        <ModuleTenantMatrixTable />
      </LogSection>
    </PanelContainer>
  );
};

export default ModuleMaintenancePanel;

// ---- STYLED COMPONENTS ----
const PanelContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 38px 36px 28px 36px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.09);
`;

const SectionTitle = styled.h3`
  font-size: 1.42rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 18px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 30px;
`;

const MaintButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  padding: 10px 28px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(10, 20, 40, 0.09);
  transition: background 0.18s, box-shadow 0.18s;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover || "#12c8ef"};
    box-shadow: 0 6px 18px rgba(10, 20, 40, 0.17);
    opacity: 0.93;
  }
  &:disabled {
    background: ${({ theme }) => theme.colors.disabledBg || "#ccc"};
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const CardSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 26px;
  margin-top: 20px;
  margin-bottom: 24px;
`;

const Card = styled.div`
  background: #222b3d;
  border-radius: 11px;
  padding: 24px 18px 18px 18px;
  box-shadow: 0 2px 10px rgba(10, 20, 40, 0.06);
  display: flex;
  flex-direction: column;
  min-height: 100px;
`;

const FeedbackArea = styled.div`
  margin-bottom: 16px;
`;

const ErrorBox = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 600;
  margin-bottom: 6px;
  background: #2a1417;
  border-radius: 6px;
  padding: 8px 13px;
`;

const InfoBox = styled.div`
  color: ${({ theme }) => theme.colors.info || "#999"};
  background: #171e2e;
  border-radius: 6px;
  padding: 8px 13px;
  margin-bottom: 6px;
`;

const SmallInfo = styled.div`
  color: #7fe1c1;
  font-size: 13px;
`;

const LogSection = styled.div`
  margin-top: 28px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

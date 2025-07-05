"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchModuleMetas,
  deleteModuleMeta,
} from "@/modules/adminmodules/slices/moduleMetaSlice";
import { fetchTenantModuleSettings } from "@/modules/adminmodules/slices/moduleSettingSlice";
import {
  repairModuleSettings,
  cleanupOrphanModuleSettings,
} from "@/modules/adminmodules/slices/moduleMaintenanceSlice";

import {
  ModuleCard,
  CreateModuleModal,
  ConfirmDeleteModal,
  GlobalModuleDetailModal,
  TenantModuleDetailModal,
} from "@/modules/adminmodules";
import MessageBox from "@/shared/Message";
import { useTranslation } from "react-i18next";
import { getCurrentLocale } from "@/utils/getCurrentLocale";
import { toast } from "react-toastify";
import type { IModuleMeta, IModuleSetting } from "@/modules/adminmodules/types";

// Tablar
const TABS = [
  { key: "meta", label: "Meta (Global Modules)" },
  { key: "tenant", label: "Tenant Settings" },
  { key: "maintenance", label: "Maintenance" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type SelectedDetail =
  | { module: IModuleMeta; type: "meta" }
  | { module: IModuleSetting; type: "tenant" }
  | null;

export default function AdminModulePage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("adminModules");
  const lang = getCurrentLocale();

  // UI State
  const [activeTab, setActiveTab] = useState<TabKey>(TABS[0].key);
  const [search, setSearch] = useState<string>("");
  const [isCreateModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // { module, type: "meta" | "tenant" }
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail>(null);

  // Redux slices
  const selectedTenant = useAppSelector((state) => state.tenant.selectedTenant);

  // Meta (global module) state
  const {
    modules = [],
    loading: metaLoading,
    error: metaError,
    successMessage: metaSuccess,
  } = useAppSelector((state) => state.moduleMeta);

  // Tenant module settings state
  const {
    tenantModules = [],
    loading: settingsLoading,
    error: settingsError,
    successMessage: settingsSuccess,
  } = useAppSelector((state) => state.moduleSetting);

  // Maintenance
  const {
    moduleTenantMatrix,
    maintenanceLogs,
    repaired,
    deletedCount,
    maintenanceLoading,
    maintenanceError,
    lastAction,
  } = useAppSelector((state) => state.moduleMaintenance);

  // Çoklu dil helper
  const getTextByLocale = (obj: any): string =>
    obj && typeof obj === "object"
      ? obj[lang] || obj.en || ""
      : typeof obj === "string"
      ? obj
      : "";

  // Silme işlemi
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteModuleMeta(deleteTarget)).unwrap();
      toast.success(t("deleteSuccess", "Module deleted"));
      dispatch(fetchModuleMetas());
    } catch (err: any) {
      toast.error(
        getTextByLocale(err?.data?.message) || t("deleteError", "Delete failed")
      );
    } finally {
      setDeleteTarget(null);
      setIsDeleting(false);
    }
  };

  // --- Filtrelenmiş meta/setting listesi ---
  let filteredMeta: IModuleMeta[] = [];
  if (activeTab === "meta") {
    filteredMeta = (modules || [])
      .filter((m) => {
        const labelText = (
          m.label?.[lang] ||
          m.label?.en ||
          m.name ||
          ""
        ).toLowerCase();
        const nameText = (m.name || "").toLowerCase();
        const searchText = search.toLowerCase();
        return labelText.includes(searchText) || nameText.includes(searchText);
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  let filteredTenantModules: IModuleSetting[] = [];
  if (activeTab === "tenant") {
    filteredTenantModules = (tenantModules || [])
      .filter((m) => {
        const moduleText = (m.module || "").toLowerCase();
        return moduleText.includes(search.toLowerCase());
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // --- Modal açılınca doğru prop ilet ---
  const handleShowDetail = (
    module: IModuleMeta | IModuleSetting,
    type: "meta" | "tenant"
  ) => {
    setSelectedDetail({ module, type } as SelectedDetail);
  };

  return (
    <Container>
      <Header>
        <Title>{t("title", "Module Management")}</Title>
        <TabBar>
          {TABS.map((tab) => (
            <Tab
              key={tab.key}
              $active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {t(tab.label, tab.label)}
            </Tab>
          ))}
        </TabBar>
      </Header>

      {/* Tenant Info */}
      <TenantInfo>
        <b>{t("tenant", "Tenant")}:</b>{" "}
        {selectedTenant ? (
          selectedTenant.name?.[lang] || selectedTenant.slug
        ) : (
          <span style={{ color: "gray" }}>
            {t("notSelected", "Not selected")}
          </span>
        )}
      </TenantInfo>

      {/* --- Meta (Global Module) Tab --- */}
      {activeTab === "meta" && (
        <>
          <ButtonGroup>
            <AddButton onClick={() => setCreateModalOpen(true)}>
              ➕ {t("createNew", "Add New Module")}
            </AddButton>
            <SearchInput
              type="text"
              placeholder={t("search", "Search modules...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </ButtonGroup>

          {metaError && (
            <MessageBox $error>{getTextByLocale(metaError)}</MessageBox>
          )}
          {metaSuccess && (
            <MessageBox $success>{getTextByLocale(metaSuccess)}</MessageBox>
          )}
          {metaLoading && <MessageBox>{t("loading", "Loading...")}</MessageBox>}

          <Grid>
            {filteredMeta.length > 0 ? (
              filteredMeta.map((mod) => (
                <ModuleCard
                  key={mod.name}
                  module={mod}
                  type="meta"
                  search={search}
                  onShowDetail={handleShowDetail}
                  onDelete={(name: string) => setDeleteTarget(name)}
                />
              ))
            ) : (
              <EmptyResult>
                {t("noModulesFound", "No modules found.")}
              </EmptyResult>
            )}
          </Grid>

          {/* Detay modalları */}
          {selectedDetail?.type === "meta" && (
            <GlobalModuleDetailModal
              module={selectedDetail.module as IModuleMeta}
              onClose={() => setSelectedDetail(null)}
            />
          )}

          {isCreateModalOpen && (
            <CreateModuleModal onClose={() => setCreateModalOpen(false)} />
          )}

          {deleteTarget && (
            <ConfirmDeleteModal
              moduleName={deleteTarget}
              onCancel={() => setDeleteTarget(null)}
              onConfirm={confirmDelete}
              loading={isDeleting}
            />
          )}
        </>
      )}

      {/* --- Tenant Settings Tab --- */}
      {activeTab === "tenant" && (
        <>
          <ButtonGroup>
            <SearchInput
              type="text"
              placeholder={t("search", "Search modules...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </ButtonGroup>

          {settingsError && (
            <MessageBox $error>{getTextByLocale(settingsError)}</MessageBox>
          )}
          {settingsSuccess && (
            <MessageBox $success>{getTextByLocale(settingsSuccess)}</MessageBox>
          )}
          {settingsLoading && (
            <MessageBox>{t("loading", "Loading...")}</MessageBox>
          )}

          <Grid>
            {filteredTenantModules.length > 0 ? (
              filteredTenantModules.map((tm) => (
                <ModuleCard
                  key={tm.module}
                  module={tm}
                  type="tenant"
                  search={search}
                  onShowDetail={handleShowDetail}
                />
              ))
            ) : (
              <EmptyResult>
                {t("noModulesFound", "No modules found.")}
              </EmptyResult>
            )}
          </Grid>
          {/* Tenant module ayarı detay */}
          {selectedDetail?.type === "tenant" && (
            <TenantModuleDetailModal
              module={selectedDetail.module as IModuleSetting}
              onClose={() => setSelectedDetail(null)}
              onAfterAction={() =>
                dispatch(fetchTenantModuleSettings(selectedTenant?.slug ?? ""))
              }
            />
          )}
        </>
      )}

      {/* --- Maintenance Tab --- */}
      {activeTab === "maintenance" && (
        <ModuleMaintenancePanel>
          <h3>{t("maintenance", "Maintenance & Batch Actions")}</h3>
          <ButtonRow>
            <MaintButton
              disabled={maintenanceLoading}
              onClick={() => dispatch(repairModuleSettings())}
            >
              {t("repairSettings", "Repair Missing Settings")}
            </MaintButton>
            <MaintButton
              disabled={maintenanceLoading}
              onClick={() =>
                selectedTenant &&
                dispatch(fetchTenantModuleSettings(selectedTenant?.slug ?? ""))
              }
            >
              {t("assignAllToTenant", "Assign All To Tenant")}
            </MaintButton>
            <MaintButton
              disabled={maintenanceLoading}
              onClick={() => dispatch(cleanupOrphanModuleSettings())}
            >
              {t("cleanupOrphan", "Cleanup Orphan Settings")}
            </MaintButton>
          </ButtonRow>
          {maintenanceError && (
            <MessageBox $error>{maintenanceError}</MessageBox>
          )}
          {maintenanceLoading && (
            <MessageBox>{t("loading", "Loading...")}</MessageBox>
          )}
          {lastAction && (
            <small>
              {t("lastAction", "Last action")}: {lastAction}
            </small>
          )}
          {maintenanceLogs && maintenanceLogs.length > 0 && (
            <LogBox>
              <b>{t("logs", "Logs / Results")}:</b>
              <pre>{JSON.stringify(maintenanceLogs, null, 2)}</pre>
            </LogBox>
          )}
          {repaired && repaired.length > 0 && (
            <LogBox>
              <b>{t("repaired", "Repaired Settings")}:</b>
              <pre>{JSON.stringify(repaired, null, 2)}</pre>
            </LogBox>
          )}
          {deletedCount > 0 && (
            <LogBox>
              <b>
                {t("deletedCount", "Deleted Records")}: {deletedCount}
              </b>
            </LogBox>
          )}
          {moduleTenantMatrix && (
            <LogBox>
              <b>{t("tenantMatrix", "Module-Tenant Matrix")}:</b>
              <pre>{JSON.stringify(moduleTenantMatrix, null, 2)}</pre>
            </LogBox>
          )}
        </ModuleMaintenancePanel>
      )}
    </Container>
  );
}

// --- Styled Components ---
// (Tümü orijinalle birebir; tipli eklemede problem yok)

const Container = styled.div`
  padding: ${({ theme }) => theme.spacings.lg};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;
const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;
const TabBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.md};
  margin-top: ${({ theme }) => theme.spacings.sm};
`;
const Tab = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "transparent"};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text)};
  padding: 7px 18px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: none;
  font-weight: 500;
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? "0 2px 8px #ddd" : "none")};
  transition: background 0.2s;
`;

const TenantInfo = styled.div`
  margin: 18px 0 10px 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ModuleMaintenancePanel = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.md};
  margin-top: ${({ theme }) => theme.spacings.md};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.md};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: background ${({ theme }) => theme.transition.fast};
  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacings.sm};
  width: 240px;
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
`;

const Grid = styled.div`
  margin-top: ${({ theme }) => theme.spacings.lg};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacings.lg};
`;

const EmptyResult = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacings.xl} 0;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const MaintButton = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: background ${({ theme }) => theme.transition.fast};
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
  }
`;

const LogBox = styled.div`
  background: #fafbfc;
  border-radius: 7px;
  padding: 16px;
  margin-top: 18px;
  font-size: 15px;
  color: #333;
  overflow-x: auto;
  border: 1px solid #eee;
`;

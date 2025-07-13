"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { deleteModuleMeta } from "@/modules/adminmodules/slices/moduleMetaSlice";
import {
  ModuleCard,
  CreateModuleModal,
  ConfirmDeleteModal,
  GlobalModuleDetailModal,
  TenantModuleDetailModal,
   ModuleMaintenancePanel
} from "@/modules/adminmodules";
import MessageBox from "@/shared/Message";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";
import type { IModuleMeta, IModuleSetting } from "@/modules/adminmodules/types";
import { useLayoutInit } from "@/hooks/useLayoutInit";

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
  const { i18n, t } = useI18nNamespace("adminModules", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Sadece UI için state
  const [activeTab, setActiveTab] = useState(TABS[0].key as TabKey);
  const [search, setSearch] = useState<string>("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail>(null);

  // 🔥 Merkezi slice state'leri çek (sadece selector, hook içinde fetch otomatik!)
  const {
    moduleMeta,
    moduleSetting,
    tenants,
  } = useLayoutInit();

  const modules = moduleMeta.modules || [];
  const metaLoading = moduleMeta.loading;
  const metaError = moduleMeta.error;
  const metaSuccess = moduleMeta.successMessage;

  const tenantModules = moduleSetting.tenantModules || [];
  const settingsLoading = moduleSetting.loading;
  const settingsError = moduleSetting.error;
  const settingsSuccess = moduleSetting.successMessage;

  const tenantList = tenants.tenants || [];
  const selectedTenantId = tenants.selectedTenantId;
  const selectedTenant = tenantList.find((t: any) => t._id === selectedTenantId) || null;


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
    } catch (err: any) {
      toast.error(getTextByLocale(err?.data?.message) || t("deleteError", "Delete failed"));
    } finally {
      setDeleteTarget(null);
      setIsDeleting(false);
    }
  };

  function handleShowDetail(
  module: IModuleMeta | IModuleSetting,
  type: "meta" | "tenant"
) {
  if (type === "meta" && "name" in module) {
    setSelectedDetail({ module, type });
  } else if (type === "tenant" && "module" in module) {
    setSelectedDetail({ module, type });
  }
}



  // Filtreler
  let filteredMeta: IModuleMeta[] = [];
  if (activeTab === "meta") {
    filteredMeta = modules
      .filter((m: IModuleMeta) => {
        const labelText = (m.label?.[lang] || m.label?.en || m.name || "").toLowerCase();
        const nameText = (m.name || "").toLowerCase();
        const searchText = search.toLowerCase();
        return labelText.includes(searchText) || nameText.includes(searchText);
      })
      .sort((a: IModuleMeta, b: IModuleMeta) => (a.order || 0) - (b.order || 0));
  }

  let filteredTenantModules: IModuleSetting[] = [];
  if (activeTab === "tenant") {
    filteredTenantModules = tenantModules
      .filter((m: IModuleSetting) => (m.module || "").toLowerCase().includes(search.toLowerCase()))
      .sort((a: IModuleSetting, b: IModuleSetting) => (a.order || 0) - (b.order || 0));
  }

  // --- Render
  return (
    <Container>
      <Header>
        <Title>{t("title", "Module Management")}</Title>
        <TabBar>
          {TABS.map((tab) => (
            <Tab key={tab.key} $active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
              {t(tab.label, tab.label)}
            </Tab>
          ))}
        </TabBar>
      </Header>
      <TenantInfo>
        <b>{t("tenant", "Tenant")}:</b>{" "}
        {selectedTenant
          ? selectedTenant.name?.[lang] || selectedTenant.slug
          : <span style={{ color: "gray" }}>{t("notSelected", "Not selected")}</span>
        }
      </TenantInfo>

      {/* Meta Tab */}
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
          {metaError && <MessageBox $error>{getTextByLocale(metaError)}</MessageBox>}
          {metaSuccess && <MessageBox $success>{getTextByLocale(metaSuccess)}</MessageBox>}
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
                  onDelete={setDeleteTarget}
                />
              ))
            ) : (
              <EmptyResult>{t("noModulesFound", "No modules found.")}</EmptyResult>
            )}
          </Grid>
          {selectedDetail?.type === "meta" && (
  <GlobalModuleDetailModal
    module={selectedDetail.module as IModuleMeta}
    onClose={() => setSelectedDetail(null)}
  />
)}
{selectedDetail?.type === "tenant" && (
  <TenantModuleDetailModal
    module={selectedDetail.module as IModuleSetting}
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

      {/* Tenant Tab */}
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
          {settingsError && <MessageBox $error>{getTextByLocale(settingsError)}</MessageBox>}
          {settingsSuccess && <MessageBox $success>{getTextByLocale(settingsSuccess)}</MessageBox>}
          {settingsLoading && <MessageBox>{t("loading", "Loading...")}</MessageBox>}
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
              <EmptyResult>{t("noModulesFound", "No modules found.")}</EmptyResult>
            )}
          </Grid>
          {selectedDetail?.type === "tenant" && (
            <TenantModuleDetailModal
              module={selectedDetail.module as IModuleSetting}
              onClose={() => setSelectedDetail(null)}
              // onAfterAction gerekmez, otomatik fetch!
            />
          )}
        </>
      )}

      {/* Maintenance Tab */}
      {activeTab === "maintenance" && (
        <ModuleMaintenancePanel selectedTenant={selectedTenantId || undefined} />
      )}
    </Container>
  );
}

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
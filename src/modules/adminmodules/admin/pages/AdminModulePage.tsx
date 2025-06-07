"use client";

import { useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminModules,
  fetchModuleDetail,
  clearSelectedModule,
  setSelectedProject,
  clearAdminMessages,
  deleteAdminModule,
} from "@/modules/adminmodules/slice/adminModuleSlice";
import { useTranslation } from "react-i18next";
import {
  ModuleCard,
  ModuleDetailModal,
  CreateModuleModal,
  ConfirmDeleteModal,
} from "@/modules/adminmodules";

const AdminModulePage = () => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("adminModules");

  const {
    modules,
    selectedModule,
    loading,
    error,
    successMessage,
    selectedProject,
    availableProjects,
  } = useAppSelector((state) => state.admin);

  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Proje değişikliği olduğunda fetchAdminModules çağırılır
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const project = e.target.value;
    dispatch(setSelectedProject(project));
    dispatch(fetchAdminModules(project));
    dispatch(clearAdminMessages());
  };

  // Silme işlemi için modal açılır
  const handleDelete = (name: string) => {
    setDeleteTarget(name);
  };

  // Silme işlemini onaylayınca modül silinir, sonra modüller güncellenir
  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await dispatch(deleteAdminModule({ name: deleteTarget })).unwrap();
        if (selectedProject) {
          dispatch(fetchAdminModules(selectedProject));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setDeleteTarget(null);
      }
    }
  };

  type SupportedLang = "tr" | "en" | "de";
  const lang = (i18n.language || "en") as SupportedLang;

  const filteredModules = Array.isArray(modules)
    ? modules
        .filter((m) => {
          const labelText = (m.label?.[lang] || "").toLowerCase();
          const nameText = (m.name || "").toLowerCase();
          const searchText = search.toLowerCase();
          return (
            labelText.includes(searchText) || nameText.includes(searchText)
          );
        })
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  return (
    <Container>
      <Header>
        <Title>{t("title", "Module Management")}</Title>
        <ButtonGroup>
          <AddButton onClick={() => setCreateModalOpen(true)}>
            ➕ {t("createNew", "Add New Module")}
          </AddButton>
          <ProjectSelector>
            <label>{t("project", "Select Project:")}</label>
            <select
              value={selectedProject ?? ""}
              onChange={handleProjectChange}
            >
              {availableProjects.length > 0 ? (
                availableProjects.map((proj) => (
                  <option key={proj} value={proj}>
                    {proj}
                  </option>
                ))
              ) : (
                <option disabled>{t("noProjects", "No projects found")}</option>
              )}
            </select>
          </ProjectSelector>
        </ButtonGroup>
      </Header>

      <SearchInput
        type="text"
        placeholder={t("search", "Search modules...")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <InfoText>{t("loading", "Loading...")}</InfoText>}
      {error && <ErrorText>{error}</ErrorText>}
      {successMessage && <SuccessText>{successMessage}</SuccessText>}

      <Grid>
        {filteredModules.length > 0 ? (
          filteredModules.map((mod) => (
            <ModuleCard
              key={mod.name}
              module={mod}
              search={search}
              onClick={() =>
                dispatch(
                  fetchModuleDetail({
                    name: mod.name,
                    project: selectedProject,
                  })
                )
              }
              onDelete={handleDelete}
            />
          ))
        ) : (
          <EmptyResult>{t("noModulesFound", "No modules found.")}</EmptyResult>
        )}
      </Grid>

      {selectedModule && (
        <ModuleDetailModal
          module={selectedModule}
          onClose={() => dispatch(clearSelectedModule())}
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
        />
      )}
    </Container>
  );
};

export default AdminModulePage;

// --- Styled Components ---

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

const ProjectSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  select {
    padding: ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
    border: ${({ theme }) => theme.borders.thin}
      ${({ theme }) => theme.colors.border};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    background: ${({ theme }) => theme.inputs.background};
    color: ${({ theme }) => theme.inputs.text};
  }
`;

const SearchInput = styled.input`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  max-width: 400px;
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
`;

const Grid = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InfoText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.danger};
`;

const SuccessText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.success};
`;

const EmptyResult = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminModules,
  fetchAvailableProjects,
  fetchModuleDetail,
  clearSelectedModule,
  setSelectedProject,
  clearAdminMessages,
  deleteAdminModule,
} from "@/store/adminSlice";
import { useTranslation } from "react-i18next";
import ModuleCard from "@/components/admin/modules/ModuleCard";
import ModuleDetailModal from "@/components/admin/modules/ModuleDetailModal";
import CreateModuleModal from "@/components/admin/modules/CreateModuleModal";
import ConfirmDeleteModal from "@/components/admin/modules/ConfirmDeleteModal";

const ModuleManager = () => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();

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

  useEffect(() => {
    dispatch(fetchAvailableProjects());
  }, [dispatch]);

  useEffect(() => {
    if (availableProjects.length > 0) {
      if (!selectedProject) {
        dispatch(setSelectedProject(availableProjects[0]));
      } else {
        dispatch(fetchAdminModules(selectedProject));
      }
    }
  }, [availableProjects, selectedProject, dispatch]);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const project = e.target.value;
    dispatch(setSelectedProject(project));
    dispatch(fetchAdminModules(project));
    dispatch(clearAdminMessages());
  };

  const handleDelete = (name: string) => {
    setDeleteTarget(name);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await dispatch(deleteAdminModule(deleteTarget)).unwrap();
        dispatch(fetchAdminModules(selectedProject));
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
    ? modules.filter((m) =>
        (m.label?.[lang] || "").toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <Container>
      <Header>
        <h2>{t("admin.modules.title", "Modül Yönetimi")}</h2>
        <ButtonGroup>
          <button onClick={() => setCreateModalOpen(true)}>
            ➕ {t("admin.modules.createNew", "Yeni Modül Ekle")}
          </button>
          <ProjectSelector>
            <label>{t("admin.modules.project", "Proje Seç:")}</label>
            <select value={selectedProject} onChange={handleProjectChange}>
              {availableProjects.length > 0 ? (
                availableProjects.map((proj) => (
                  <option key={proj} value={proj}>
                    {proj}
                  </option>
                ))
              ) : (
                <option disabled>{t("admin.modules.noProjects", "Proje bulunamadı")}</option>
              )}
            </select>
          </ProjectSelector>
        </ButtonGroup>
      </Header>

      <SearchInput
        type="text"
        placeholder={t("admin.modules.search", "Modül ara...")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>{t("admin.loading", "Yükleniyor...")}</p>}
      {error && <ErrorText>{error}</ErrorText>}
      {successMessage && <SuccessText>{successMessage}</SuccessText>}

      <Grid>
        {filteredModules.map((mod) => (
          <ModuleCard
            key={mod.name || mod.updatedAt || Math.random().toString()}
            module={mod}
            onClick={() =>
              dispatch(fetchModuleDetail({ name: mod.name, project: selectedProject }))
            }
            onDelete={handleDelete}
          />
        ))}
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

export default ModuleManager;

//
// ✅ Styled Components
//

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ProjectSelector = styled.div`
  select {
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border};
  }
`;

const SearchInput = styled.input`
  margin-top: 1rem;
  padding: 0.5rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
`;

const Grid = styled.div`
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const ErrorText = styled.p`
  color: red;
`;

const SuccessText = styled.p`
  color: green;
`;

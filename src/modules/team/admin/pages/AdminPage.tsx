"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/team/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createTeam,
  updateTeam,
  deleteTeam,
  togglePublishTeam,
} from "@/modules/team/slice/teamSlice";
import {
  createTeamCategory,
  updateTeamCategory,
} from "@/modules/team/slice/teamCategorySlice";

import {
  FormModal,
  CategoryForm,
  CategoryListPage,
  List,
  Tabs,
} from "@/modules/team";

import { Modal } from "@/shared";
import { ITeam } from "@/modules/team/types";
import { TeamCategory } from "@/modules/team/types";

export default function AdminTeamPage() {
  const { i18n, t } = useI18nNamespace("team", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

const team = useAppSelector((state) => state.team.teamAdmin);
const loading = useAppSelector((state) => state.team.loading);
const error = useAppSelector((state) => state.team.error);


  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<ITeam | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<TeamCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();

  

  // ---- FETCH YOK! ----

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateTeam({ id, formData }));
    } else {
      await dispatch(createTeam(formData));
    }
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_team",
      "Bu makaleyi silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteTeam(id));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishTeam({ id, isPublished: !isPublished }));
  };

  // Create/Update Category
const handleCategorySubmit = async (
  data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
  id?: string
) => {
  if (id) {
    await dispatch(updateTeamCategory({ id, data }));
  } else {
    await dispatch(createTeamCategory(data));
  }
  setEditingCategory(null);
  setCategoryModalOpen(false);
};

  

  return (
    <Wrapper>
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <List
            team={team}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={(item) => {
              setEditingItem(item);
              setActiveTab("create");
            }}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        )}

        {activeTab === "create" && (
          <FormModal
            isOpen
            onClose={() => {
              setEditingItem(null);
              setActiveTab("list");
            }}
            editingItem={editingItem}
            onSubmit={handleSubmit}
          />
        )}

        {activeTab === "categories" && (
          <>
            <CategoryListPage
              onAdd={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              onEdit={(category) => {
                setEditingCategory(category);
                setCategoryModalOpen(true);
              }}
            />
            <Modal
              isOpen={categoryModalOpen}
              onClose={() => setCategoryModalOpen(false)}
            >
              <CategoryForm
                isOpen={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                editingItem={editingCategory}
                onSubmit={handleCategorySubmit}
              />
            </Modal>
          </>
        )}
      </TabContent>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 1200px;
  margin: auto;
  padding: ${({ theme }) => theme.layout.sectionspacings}
    ${({ theme }) => theme.spacings.md};
`;

const TabContent = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};
`;

"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/skill";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createSkill,
  updateSkill,
  deleteSkill,
  togglePublishSkill,
} from "@/modules/skill/slice/skillSlice";
import {
  createSkillCategory,
  updateSkillCategory,
} from "@/modules/skill/slice/skillCategorySlice";

import {
  FormModal,
  CategoryForm,
  CategoryListPage,
  List,
  Tabs, // Güncellenmiş Tabs!
  MultiUploadModal
} from "@/modules/skill";

import { Modal } from "@/shared";
import { ISkill } from "@/modules/skill/types";
import { SkillCategory } from "@/modules/skill/types";

// --- Yeni: Tab tipi
type SkillTab = "list" | "create" | "multiUpload" | "categories";

export default function AdminSkillPage() {
  const { i18n, t } = useI18nNamespace("skill", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const skill = useAppSelector((state) => state.skill.skillAdmin);
  const loading = useAppSelector((state) => state.skill.loading);
  const error = useAppSelector((state) => state.skill.error);

  // Artık 4 tab var!
  const [activeTab, setActiveTab] = useState<SkillTab>("list");
  const [editingItem, setEditingItem] = useState<ISkill | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<SkillCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Çoklu yükleme için modal state
  const [multiUploadOpen, setMultiUploadOpen] = useState(false);

  const dispatch = useAppDispatch();

  // Tekli ekleme/güncelleme
  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateSkill({ id, formData }));
    } else {
      await dispatch(createSkill(formData));
    }
    setActiveTab("list");
  };

  // Çoklu logo yükleme (her biri yeni referans/firma olarak eklenir)
  const handleMultiUpload = async (images: File[], category: string) => {
    if (!category) return alert(t("category_required", "Kategori seçmelisiniz!"));
    const uploadPromises = images.map((file) => {
      const fd = new FormData();
      fd.append("images", file);
      fd.append("category", category);
      return dispatch(createSkill(fd));
    });
    await Promise.all(uploadPromises);
    setMultiUploadOpen(false);
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_skill",
      "Bu referansı silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteSkill(id));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishSkill({ id, isPublished: !isPublished }));
  };

  // Kategori işlemleri
  const handleCategorySubmit = async (
    data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
    id?: string
  ) => {
    if (id) {
      await dispatch(updateSkillCategory({ id, data }));
    } else {
      await dispatch(createSkillCategory(data));
    }
    setEditingCategory(null);
    setCategoryModalOpen(false);
  };

  // --- Tab değişimi: MultiUpload seçilince sadece modal açılır, tab yine 'list'te kalır
  const handleTabChange = (tab: SkillTab) => {
    if (tab === "multiUpload") {
      setMultiUploadOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <Wrapper>
      <Tabs
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      <TabContent>
        {activeTab === "list" && (
          <>
            <List
              skill={skill}
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
            {/* Çoklu upload modalı */}
            <MultiUploadModal
              isOpen={multiUploadOpen}
              onClose={() => setMultiUploadOpen(false)}
              onUpload={handleMultiUpload}
            />
          </>
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

// --- Styled Components ---
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

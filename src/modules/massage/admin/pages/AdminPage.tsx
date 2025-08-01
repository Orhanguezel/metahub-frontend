"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/massage/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createMassage,
  updateMassage,
  deleteMassage,
  togglePublishMassage,
} from "@/modules/massage/slice/massageSlice";
import {
  createMassageCategory,
  updateMassageCategory,
} from "@/modules/massage/slice/massageCategorySlice";

import {
  FormModal,
  CategoryForm,
  CategoryListPage,
  List,
  Tabs,
} from "@/modules/massage";

import { Modal } from "@/shared";
import { IMassage } from "@/modules/massage/types";
import { MassageCategory } from "@/modules/massage/types";

export default function AdminMassagePage() {
  const { i18n, t } = useI18nNamespace("massage", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

const massage = useAppSelector((state) => state.massage.massageAdmin);
const loading = useAppSelector((state) => state.massage.loading);
const error = useAppSelector((state) => state.massage.error);


  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<IMassage | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<MassageCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();

  

  // ---- FETCH YOK! ----

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateMassage({ id, formData }));
    } else {
      await dispatch(createMassage(formData));
    }
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_massage",
      "Bu makaleyi silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteMassage(id));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishMassage({ id, isPublished: !isPublished }));
  };

  // Create/Update Category
const handleCategorySubmit = async (
  data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
  id?: string
) => {
  if (id) {
    await dispatch(updateMassageCategory({ id, data }));
  } else {
    await dispatch(createMassageCategory(data));
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
            massage={massage}
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

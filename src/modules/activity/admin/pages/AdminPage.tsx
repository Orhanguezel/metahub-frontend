"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/activity";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createActivity,
  updateActivity,
  deleteActivity,
  togglePublishActivity,
} from "@/modules/activity/slice/activitySlice";
import {
  createActivityCategory,
  updateActivityCategory,
} from "@/modules/activity/slice/activityCategorySlice";

import {
  FormModal,
  CategoryForm,
  CategoryListPage,
  List,
  Tabs,
} from "@/modules/activity";

import { Modal } from "@/shared";
import { IActivity } from "@/modules/activity/types";
import { ActivityCategory } from "@/modules/activity/types";

export default function AdminActivityPage() {
  const { i18n, t } = useI18nNamespace("activity", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

const activity = useAppSelector((state) => state.activity.activityAdmin);
const loading = useAppSelector((state) => state.activity.loading);
const error = useAppSelector((state) => state.activity.error);


  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<IActivity | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<ActivityCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();

  

  // ---- FETCH YOK! ----

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateActivity({ id, formData }));
    } else {
      await dispatch(createActivity(formData));
    }
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_activity",
      "Bu makaleyi silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteActivity(id));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishActivity({ id, isPublished: !isPublished }));
  };

  // Create/Update Category
const handleCategorySubmit = async (
  data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
  id?: string
) => {
  if (id) {
    await dispatch(updateActivityCategory({ id, data }));
  } else {
    await dispatch(createActivityCategory(data));
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
            activity={activity}
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

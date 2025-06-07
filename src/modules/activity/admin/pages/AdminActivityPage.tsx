"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllActivitiesAdmin,
  clearActivityMessages,
  createActivity,
  updateActivity,
  deleteActivity,
  togglePublishActivity,
} from "@/modules/activity/slice/activitySlice";
import {
  ActivityTabs,
  ActivityList,
  ActivityFormModal,
  CategoryListPage,
  CategoryForm,
} from "@/modules/activity";
import { Modal } from "@/shared";
import type { IActivity } from "@/modules/activity/types/activity";
import type { ActivityCategory } from "@/modules/activity/slice/activityCategorySlice";

export default function AdminActivityPage() {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("adminActivity");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const { activities, loading, error } = useAppSelector(
    (state) => state.activity
  );

  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<IActivity | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<ActivityCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllActivitiesAdmin(lang));
    return () => {
      dispatch(clearActivityMessages());
    };
  }, [dispatch, lang]);

  const resetForm = () => {
    setEditingItem(null);
    setActiveTab("list");
  };

  const resetCategoryModal = () => {
    setEditingCategory(null);
    setCategoryModalOpen(false);
  };

  const handleCreateOrUpdate = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateActivity({ id, formData }));
    } else {
      await dispatch(createActivity(formData));
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_Activity",
      "Are you sure you want to delete this activity?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteActivity(id));
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await dispatch(togglePublishActivity({ id, isPublished: !currentStatus }));
  };

  const handleEdit = (item: IActivity) => {
    setEditingItem(item);
    setActiveTab("create");
  };

  return (
    <Wrapper>
      <ActivityTabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <ActivityList
            activities={activities}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        )}

        {activeTab === "create" && (
          <ActivityFormModal
            isOpen
            onClose={resetForm}
            editingItem={editingItem}
            onSubmit={handleCreateOrUpdate}
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
            <Modal isOpen={categoryModalOpen} onClose={resetCategoryModal}>
              <CategoryForm
                onClose={resetCategoryModal}
                editingItem={editingCategory}
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
  padding: ${({ theme }) => theme.layout.sectionSpacing}
    ${({ theme }) => theme.spacing.md};
`;

const TabContent = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
`;

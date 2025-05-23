"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { IServices } from "@/modules/services/types/services";
import { ServiceCategory } from "@/modules/services/slice/serviceCategorySlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllServicesAdmin,
  clearServicesMessages,
  createServices,
  updateServices,
  deleteServices,
  togglePublishServices,
} from "@/modules/services/slice/servicesSlice";
import Modal from "@/shared/Modal";
import {
  ServicesFormModal,
  CategoryForm,
  CategoryListPage,
  ServicesList,
  ServicesTabs,
} from "@/modules/services";
import { useTranslation } from "react-i18next";

export default function AdminServicesPage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useTranslation("services");

  const lang = useMemo(
    () =>
      (["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en") as
        | "tr"
        | "en"
        | "de",
    [i18n.language]
  );

  const { services, loading, error } = useAppSelector(
    (state) => state.services
  );

  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<IServices | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllServicesAdmin(lang));
    return () => {
      dispatch(clearServicesMessages());
    };
  }, [dispatch, lang]);

  const resetEditState = () => {
    setEditingItem(null);
    setActiveTab("list");
  };

  const handleCreateOrUpdate = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateServices({ id, formData }));
    } else {
      await dispatch(createServices(formData));
    }
    resetEditState();
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        t(
          "admin.confirm.delete_Services",
          "Are you sure you want to delete this service?"
        )
      )
    ) {
      await dispatch(deleteServices(id));
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await dispatch(togglePublishServices({ id, isPublished: !currentStatus }));
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleEdit = (item: IServices) => {
    setEditingItem(item);
    setActiveTab("create");
  };

  return (
    <Wrapper>
      <ServicesTabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <ServicesList
            services={services}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        )}

        {activeTab === "create" && (
          <ServicesFormModal
            isOpen={true}
            onClose={() => {
              setEditingItem(null);
              setActiveTab("list");
            }}
            editingItem={editingItem}
            onSubmit={handleCreateOrUpdate}
          />
        )}

        {activeTab === "categories" && (
          <>
            <CategoryListPage
              onAdd={handleOpenAddCategory}
              onEdit={handleEditCategory}
            />
            <Modal
              isOpen={categoryModalOpen}
              onClose={() => setCategoryModalOpen(false)}
            >
              <CategoryForm
                onClose={() => setCategoryModalOpen(false)}
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

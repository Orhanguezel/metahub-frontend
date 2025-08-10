"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/apartment";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createApartment,
  updateApartment,
  deleteApartment,
  togglePublishApartment,
} from "@/modules/apartment/slice/apartmentSlice";
import {
  createApartmentCategory,
  updateApartmentCategory,
} from "@/modules/apartment/slice/apartmentCategorySlice";

import {
  FormModal,
  CategoryForm,
  CategoryListPage,
  List,
  Tabs,
  MultiUploadModal,
} from "@/modules/apartment";

import { Modal } from "@/shared";
import type { IApartment } from "@/modules/apartment/types";
import type { ApartmentCategory } from "@/modules/apartment/types";

// Backend gereği: multi-upload sırasında zorunlu meta
type MultiUploadMeta = {
  // address: city + country zorunlu, diğerleri opsiyonel
  address: {
    city: string;
    country: string;
    street?: string;
    number?: string;
    district?: string;
    state?: string;
    zip?: string;
    fullText?: string;
  };
  // contact: name zorunlu
  contact: {
    name: string;
    phone?: string;
    email?: string;
    role?: string;
    customerRef?: string;
    userRef?: string;
  };
  // opsiyonel
  title?: Record<SupportedLocale, string>;
  content?: Record<SupportedLocale, string>;
  isPublished?: boolean;
};

type ApartmentTab = "list" | "create" | "multiUpload" | "categories";

export default function AdminApartmentPage() {
  const { i18n, t } = useI18nNamespace("apartment", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const apartment = useAppSelector((s) => s.apartment.apartmentAdmin);
  const loading = useAppSelector((s) => s.apartment.loading);
  const status = useAppSelector((s) => s.apartment.status);
  const error = useAppSelector((s) => s.apartment.error);

  const [activeTab, setActiveTab] = useState<ApartmentTab>("list");
  const [editingItem, setEditingItem] = useState<IApartment | null>(null);

  const [editingCategory, setEditingCategory] = useState<ApartmentCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const [multiUploadOpen, setMultiUploadOpen] = useState(false);

  const dispatch = useAppDispatch();

  // Tekli create/update (FormModal gerekli tüm alanları göndermeli:
  // images[], category, address{city,country}, contact{name} vs.)
  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateApartment({ id, formData }));
    } else {
      await dispatch(createApartment(formData));
    }
    setEditingItem(null);
    setActiveTab("list");
  };

  // Çoklu yükleme: backend zorunlulukları için meta bekliyoruz.
  // MultiUploadModal'ı buna göre güncellersen süper olur.
  const handleMultiUpload = async (
    images: File[],
    category: string,
    meta?: MultiUploadMeta
  ) => {
    if (!category) return alert(t("category_required", "Kategori seçmelisiniz!"));

    // Minimum doğrulama
    if (!meta?.address?.city || !meta?.address?.country) {
      return alert(t("address_required", "Adres (şehir + ülke) zorunludur."));
    }
    if (!meta?.contact?.name) {
      return alert(t("contact_required", "Sorumlu kişi adı zorunludur."));
    }

    const uploadPromises = images.map((file) => {
      const fd = new FormData();
      fd.append("images", file);
      fd.append("category", category);

      // JSON alanlar string olarak gönderilmeli (backend transformNestedFields ile parse ediyor)
      fd.append("address", JSON.stringify(meta.address));
      fd.append("contact", JSON.stringify(meta.contact));

      if (meta.title) fd.append("title", JSON.stringify(meta.title));
      if (meta.content) fd.append("content", JSON.stringify(meta.content));
      if (typeof meta.isPublished === "boolean") {
        fd.append("isPublished", String(meta.isPublished));
      }

      return dispatch(createApartment(fd));
    });

    await Promise.all(uploadPromises);
    setMultiUploadOpen(false);
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_apartment",
      "Bu referansı silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteApartment(id));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishApartment({ id, isPublished: !isPublished }));
  };

  // Kategori işlemleri — backend: name (i18n), slug?, city?, district?, zip?, isActive?
  const handleCategorySubmit = async (
    data: {
      name: Record<SupportedLocale, string>;
      slug?: string;
      city?: string;
      district?: string;
      zip?: string;
      isActive?: boolean;
    },
    id?: string
  ) => {
    if (id) {
      await dispatch(updateApartmentCategory({ id, data }));
    } else {
      await dispatch(createApartmentCategory(data));
    }
    setEditingCategory(null);
    setCategoryModalOpen(false);
  };

  const handleTabChange = (tab: ApartmentTab) => {
    if (tab === "multiUpload") {
      setMultiUploadOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <Wrapper>
      <Tabs activeTab={activeTab} onChange={handleTabChange} loading={status === "loading"} />

      <TabContent>
        {activeTab === "list" && (
          <>
            <List
              apartment={apartment}
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

            <MultiUploadModal
              isOpen={multiUploadOpen}
              onClose={() => setMultiUploadOpen(false)}
              // MultiUploadModal, (images, category, meta) şeklinde çağırmalı.
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
            loading={status === "loading"}
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
            <Modal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)}>
              <CategoryForm
                isOpen={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                editingItem={editingCategory}
                onSubmit={handleCategorySubmit}
                loading={status === "loading"}
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

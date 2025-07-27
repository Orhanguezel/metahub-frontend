"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createFAQ,
  updateFAQ,
  deleteFAQ,
  clearFAQMessages,
  togglePublishFAQ,
} from "@/modules/faq/slice/faqSlice";
import { FAQList, FAQFormSection, Tabs } from "@/modules/faq";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/faq/locales";
import { toast } from "react-toastify";
import type { IFaq } from "@/modules/faq/types";

export default function AdminFaqPage() {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("faq", translations);

  const faqs = useAppSelector((state) => state.faq.faqsAdmin);
  const loading = useAppSelector((state) => state.faq.loading);
  const error = useAppSelector((state) => state.faq.error);
  const successMessage = useAppSelector((state) => state.faq.successMessage);

  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingItem, setEditingItem] = useState<IFaq | null>(null);

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    return () => {
      dispatch(clearFAQMessages());
    };
  }, [successMessage, error, dispatch]);

  const handleSubmit = async (data: IFaq) => {
    if (data._id) {
      await dispatch(updateFAQ({ id: data._id, data }));
    } else {
      await dispatch(createFAQ(data));
    }
    setEditingItem(null);
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t("confirm.delete", "Are you sure you want to delete this FAQ?");
    if (confirm(confirmMsg)) await dispatch(deleteFAQ(id));
  };

  const handleEdit = (faq: IFaq) => {
    setEditingItem(faq);
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    await dispatch(togglePublishFAQ({ id, isPublished }));
  };

  return (
    <Container>
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "create" && (
        <FAQFormSection onSubmit={handleSubmit} editingItem={editingItem} />
      )}

      {activeTab === "list" && (
        <FAQList faqs={faqs} loading={loading} onEdit={handleEdit} onDelete={handleDelete} onTogglePublish={handleTogglePublish} />
      )}
    </Container>
  );
}

const Container = styled.div`
  max-width: 1200px;
  margin: auto;
  padding: ${({ theme }) => theme.layout.sectionspacings} ${({ theme }) => theme.spacings.md};
`;

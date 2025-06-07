"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  clearFAQMessages,
  FAQ,
} from "@/modules/faq/slice/faqSlice";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FAQList, FAQEditModal } from "@/modules/faq";

export default function AdminFaqPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("faq");

  const { faqs, loading, error, successMessage } = useAppSelector(
    (state) => state.faq
  );

  const [editingItem, setEditingItem] = useState<FAQ | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllFAQs());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    return () => {
      dispatch(clearFAQMessages());
    };
  }, [successMessage, error, dispatch]);

  const handleCreateOrUpdate = async (data: FAQ) => {
    if (data._id) {
      await dispatch(updateFAQ({ id: data._id, data }));
    } else {
      await dispatch(createFAQ(data));
    }
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    const confirmMessage = t(
      "confirm.delete",
      "Are you sure you want to delete this FAQ?"
    );
    if (confirm(confirmMessage)) {
      await dispatch(deleteFAQ(id));
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingItem(faq);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  return (
    <Container>
      <Header>
        <h2>{t("adminFaq.title", "Frequently Asked Questions")}</h2>
        <CreateButton onClick={handleCreate}>
          {t("adminFaq.create", "Create New")}
        </CreateButton>
      </Header>

      <FAQList
        faqs={faqs}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FAQEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editingItem={editingItem}
      />
    </Container>
  );
}

// 💅 Styled Components
const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CreateButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: none;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

"use client";

import { useEffect, useMemo, useState } from "react";
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

  const faqs = useAppSelector((state) => state.faq.faqsAdmin || []);
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
    await dispatch(togglePublishFAQ({ id, isPublished: !isPublished }));
  };

  const count = useMemo(() => faqs?.length ?? 0, [faqs]);

  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "FAQ Manager")}</h1>
          <Subtitle>{t("admin.subtitle", "Create, organize and publish your FAQs")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="faq-count">{count}</Counter>
          <PrimaryBtn
            onClick={() => {
              setEditingItem(null);
              setActiveTab("create");
            }}
          >
            + {t("create", "Create")}
          </PrimaryBtn>
        </Right>
      </Header>

      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <Section>
        <SectionHead>
          <h2>
            {activeTab === "list" ? t("list", "List") : t("create", "Create")}
          </h2>
          {activeTab === "list" ? (
            <SmallBtn disabled>{t("managedByParent", "Managed by parent fetch")}</SmallBtn>
          ) : (
            <SmallBtn onClick={() => setActiveTab("list")}>{t("backToList", "Back to list")}</SmallBtn>
          )}
        </SectionHead>

        <Card>
          {activeTab === "create" ? (
            <FAQFormSection onSubmit={handleSubmit} editingItem={editingItem} />
          ) : (
            <FAQList
              faqs={faqs}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          )}
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled (admin pattern) ---- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column; align-items: flex-start; gap: ${({ theme }) => theme.spacings.sm};
  }
`;
const TitleBlock = styled.div`display:flex; flex-direction:column; gap:4px; h1{margin:0;}`;
const Subtitle = styled.p`margin:0; color:${({theme})=>theme.colors.textSecondary}; font-size:${({theme})=>theme.fontSizes.sm};`;
const Right = styled.div`display:flex; gap:${({ theme }) => theme.spacings.sm}; align-items:center;`;
const Counter = styled.span`
  padding: 6px 10px; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const Section = styled.section`margin-top: ${({ theme }) => theme.spacings.sm};`;
const SectionHead = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({ theme }) => theme.spacings.sm};
`;
const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;
const PrimaryBtn = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} transparent;
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  transition: opacity ${({ theme }) => theme.transition.normal};
  &:hover { opacity: ${({ theme }) => theme.opacity.hover}; background:${({theme})=>theme.buttons.primary.backgroundHover}; }
`;
const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;

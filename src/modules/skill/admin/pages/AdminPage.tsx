"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/skill/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createSkill,
  updateSkill,
  deleteSkill,
  togglePublishSkill,
} from "@/modules/skill/slice/skillSlice";

import {
  FormModal,
  List,
  Tabs,
} from "@/modules/skill";

import { ISkill } from "@/modules/skill/types";

export default function AdminSkillPage() {
  const { i18n, t } = useI18nNamespace("skill", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Sadece skillAdmin slice'tan geliyor
  const skill = useAppSelector((state) =>
    Array.isArray(state.skill.skillAdmin) ? state.skill.skillAdmin : []
  );
  const loading = useAppSelector((state) => state.skill.loading);
  const error = useAppSelector((state) => state.skill.error);

  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingItem, setEditingItem] = useState<ISkill | null>(null);

  const dispatch = useAppDispatch();

  // --- SUBMIT ---
  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateSkill({ id, formData }));
    } else {
      await dispatch(createSkill(formData));
    }
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_skill",
      "Bu makaleyi silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteSkill(id));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishSkill({ id, isPublished: !isPublished }));
  };

  return (
    <Wrapper>
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
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
            // Artık category bağımlılığı yok!
          />
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

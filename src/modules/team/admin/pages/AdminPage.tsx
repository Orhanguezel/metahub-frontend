"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/team/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createTeam,
  updateTeam,
  deleteTeam,
  togglePublishTeam,
} from "@/modules/team/slice/teamSlice";

import {
  FormModal,
  List,
  Tabs,
} from "@/modules/team";

import { ITeam } from "@/modules/team/types";

export default function AdminTeamPage() {
  const { i18n, t } = useI18nNamespace("team", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Sadece teamAdmin slice'tan geliyor
  const team = useAppSelector((state) =>
    Array.isArray(state.team.teamAdmin) ? state.team.teamAdmin : []
  );
  const loading = useAppSelector((state) => state.team.loading);
  const error = useAppSelector((state) => state.team.error);

  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingItem, setEditingItem] = useState<ITeam | null>(null);

  const dispatch = useAppDispatch();

  // --- SUBMIT ---
  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateTeam({ id, formData }));
    } else {
      await dispatch(createTeam(formData));
    }
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_team",
      "Bu makaleyi silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteTeam(id));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishTeam({ id, isPublished: !isPublished }));
  };

  return (
    <Wrapper>
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <List
            team={team}
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

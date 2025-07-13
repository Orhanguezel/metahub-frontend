// components/SectionBulkActions.tsx
"use client";
import styled from "styled-components";
import { Button } from "@/shared";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

type SectionBulkActionsProps = {
  selected: string[];
  onDelete: () => void;
  onEnable: () => void;
  onDisable: () => void;
};

export default function SectionBulkActions({
  selected,
  onDelete,
  onEnable,
  onDisable,
}: SectionBulkActionsProps) {
  // Standart dil modeli
  const { t } = useI18nNamespace("section", translations);

  if (!selected.length) return null;

  return (
    <Bar>
      <Button variant="danger" size="sm" onClick={onDelete}>
        {t("deleteSelected", "Delete Selected")} ({selected.length})
      </Button>
      <Button variant="primary" size="sm" onClick={onEnable}>
        {t("enableSelected", "Enable")}
      </Button>
      <Button variant="outline" size="sm" onClick={onDisable}>
        {t("disableSelected", "Disable")}
      </Button>
    </Bar>
  );
}

const Bar = styled.div`
  display: flex;
  gap: 0.7rem;
  margin-bottom: 1.1rem;
`;

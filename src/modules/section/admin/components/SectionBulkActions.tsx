"use client";
import styled from "styled-components";
import { Button } from "@/shared";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

// Seçili sectionKey'leri aksiyon fonksiyonuna ilet
type SectionBulkActionsProps = {
  selected: string[];
  onDelete: (selected: string[]) => void;
  onEnable: (selected: string[]) => void;
  onDisable: (selected: string[]) => void;
};

export default function SectionBulkActions({
  selected,
  onDelete,
  onEnable,
  onDisable,
}: SectionBulkActionsProps) {
  const { t } = useI18nNamespace("section", translations);

  if (!selected.length) return null;

  return (
    <Bar>
      <Button
        variant="danger"
        size="sm"
        onClick={() => onDelete(selected)}
        disabled={!selected.length}
      >
        {t("deleteSelected", "Delete Selected")} ({selected.length})
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => onEnable(selected)}
        disabled={!selected.length}
      >
        {t("enableSelected", "Enable")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDisable(selected)}
        disabled={!selected.length}
      >
        {t("disableSelected", "Disable")}
      </Button>
    </Bar>
  );
}

const Bar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  align-items: center;

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacings.xs};

    button {
      width: 100%;
      font-size: ${({ theme }) => theme.fontSizes.sm};
    }
  }
`;


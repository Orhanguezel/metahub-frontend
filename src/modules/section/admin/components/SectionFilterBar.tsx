// components/SectionFilterBar.tsx
"use client";
import styled from "styled-components";
import { Button } from "@/shared";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

type SectionFilterBarProps = {
  search: string;
  setSearch: (v: string) => void;
  enabledFilter: "all" | "enabled" | "disabled";
  setEnabledFilter: (v: "all" | "enabled" | "disabled") => void;
};

export default function SectionFilterBar({
  search,
  setSearch,
  enabledFilter,
  setEnabledFilter,
}: SectionFilterBarProps) {
  // Standart dil modeli (her component kendi namespace'ini kullanır!)
  const { t } = useI18nNamespace("section", translations);

  return (
    <Bar>
      <Input
        placeholder={t("search", "Search...")}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
     <Button
  size="sm"
  variant={enabledFilter === "all" ? "primary" : "outline"}
  onClick={() => setEnabledFilter("all")}
>
  {t("all", "All")}
</Button>
<Button
  size="sm"
  variant={enabledFilter === "enabled" ? "primary" : "outline"}
  onClick={() => setEnabledFilter("enabled")}
>
  {t("active", "Active")}
</Button>
<Button
  size="sm"
  variant={enabledFilter === "disabled" ? "primary" : "outline"}
  onClick={() => setEnabledFilter("disabled")}
>
  {t("passive", "Passive")}
</Button>


    </Bar>
  );
}
const Bar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  align-items: center;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacings.xs};
    margin-bottom: ${({ theme }) => theme.spacings.md};
  }
`;

const Input = styled.input`
  min-width: 210px;
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: border 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    outline: 1.5px solid ${({ theme }) => theme.colors.inputOutline};
  }

  ${({ theme }) => theme.media.small} {
    min-width: 0;
    width: 100%;
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
  }
`;

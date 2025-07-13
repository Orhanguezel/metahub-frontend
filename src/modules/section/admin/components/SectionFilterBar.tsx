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
  gap: 0.75rem;
  margin-bottom: 1.2rem;
  align-items: center;
`;

const Input = styled.input`
  min-width: 210px;
  padding: 0.65rem 1.2rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  font-size: 1rem;
`;

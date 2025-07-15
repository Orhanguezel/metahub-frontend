"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {adminUserTranslations} from "@/modules/users";

interface FilterValues {
  query: string;
  role: string;
  isActive: string;
}

interface Props {
  onFilterChange: (filters: FilterValues) => void;
}

export default function UserTableFilters({ onFilterChange }: Props) {
  const { t } = useI18nNamespace("adminUser", adminUserTranslations);
  const [filters, setFilters] = useState<FilterValues>({
    query: "",
    role: "",
    isActive: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleClear = () => {
    const cleared = { query: "", role: "", isActive: "" };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  return (
    <Wrapper>
      <Input
        type="text"
        name="query"
        placeholder={t("users.filters.search")}
        value={filters.query}
        onChange={handleChange}
      />

      <Select name="role" value={filters.role} onChange={handleChange}>
        <option value="">{t("users.filters.allRoles")}</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
        <option value="moderator">Moderator</option>
        <option value="staff">Staff</option>
      </Select>

      <Select name="isActive" value={filters.isActive} onChange={handleChange}>
        <option value="">{t("users.filters.allStatuses")}</option>
        <option value="true">{t("users.filters.active")}</option>
        <option value="false">{t("users.filters.inactive")}</option>
      </Select>

      <ClearButton type="button" onClick={handleClear}>
        {t("users.filters.clear")}
      </ClearButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const ClearButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    opacity: 0.85;
  }
`;

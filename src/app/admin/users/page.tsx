"use client";

import { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import UserTableFilters from "@/components/admin/users/table/UserTableFilters";
import UserTable from "@/components/admin/users/table/UserTable";

const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.primary};
`;

export interface UserFilterState {
  query: string;
  role: string;
  isActive: string;
}

export default function UsersPage() {
  const { t } = useTranslation("admin");
  const [filters, setFilters] = useState<UserFilterState>({
    query: "",
    role: "",
    isActive: "",
  });

  return (
    <Container>
      <Title>{t("users.title") || "👤 Benutzerverwaltung"}</Title>
      <UserTableFilters onFilterChange={setFilters} />
      <UserTable filters={filters} />
    </Container>
  );
}

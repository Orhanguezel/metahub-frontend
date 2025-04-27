"use client";

import { useState, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import UserTableFilters from "@/components/admin/users/table/UserTableFilters";
import UserTable from "@/components/admin/users/table/UserTable";

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
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
      <Title>{t("users.title")}</Title>
      <UserTableFilters onFilterChange={setFilters} />
      <UserTable filters={filters} />
    </Container>
  );
}

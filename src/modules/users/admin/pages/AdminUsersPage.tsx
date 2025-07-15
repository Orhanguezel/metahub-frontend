"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {adminUserTranslations} from "@/modules/users";
import { UserTableFilters, UserTable } from "@/modules/users";





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
  const { t } = useI18nNamespace("adminUser", adminUserTranslations);
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

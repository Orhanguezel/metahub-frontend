"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { adminUserTranslations } from "@/modules/users";
import { UserTableFilters, UserTable } from "@/modules/users";

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
    <PageWrap>
      <Head>
        <Title>{t("users.title", "Kullanıcılar")}</Title>
        <Sub>{t("users.subtitle", "Kullanıcılarınızı yönetin, filtreleyin ve düzenleyin.")}</Sub>
      </Head>

      <UserTableFilters onFilterChange={setFilters} />

      <UserTable filters={filters} />
    </PageWrap>
  );
}



const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.md};
`;

const Head = styled.header`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacings.xl};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.title};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  letter-spacing: -0.01em;
  margin: 0 0 0.25em 0;
`;

const Sub = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

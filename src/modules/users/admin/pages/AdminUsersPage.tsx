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
      <Header>
        <TitleBlock>
          <h1>{t("users.title", "Kullanıcılar")}</h1>
          <Subtitle>
            {t("users.subtitle", "Kullanıcılarınızı yönetin, filtreleyin ve düzenleyin.")}
          </Subtitle>
        </TitleBlock>
      </Header>

      <Section>
        <SectionHead>
          <h2>{t("users.list", "Liste")}</h2>
          <SmallBtn disabled>{t("users.managed", "Filtrelerle yönetilir")}</SmallBtn>
        </SectionHead>

        <Card>
          <FiltersWrap>
            <UserTableFilters onFilterChange={setFilters} />
          </FiltersWrap>

          <Divider />

          <UserTableWrap>
            <UserTable filters={filters} />
          </UserTableWrap>
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled (shared admin pattern) ---- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column; align-items: flex-start; gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const TitleBlock = styled.div`
  display:flex; flex-direction:column; gap:4px;
  h1{ margin:0; }
`;

const Subtitle = styled.p`
  margin:0; color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.sm};
`;

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const SectionHead = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({ theme }) => theme.spacings.sm};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;

const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;

const FiltersWrap = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const Divider = styled.hr`
  border: 0;
  border-top: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  margin: ${({ theme }) => theme.spacings.md} 0;
`;

const UserTableWrap = styled.div`
  width: 100%;
`;

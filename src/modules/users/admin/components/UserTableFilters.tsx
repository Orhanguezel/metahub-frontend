"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { adminUserTranslations } from "@/modules/users";

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

  const update = (next: Partial<FilterValues>) => {
    const merged = { ...filters, ...next };
    setFilters(merged);
    onFilterChange(merged);
  };

  return (
    <Bar role="region" aria-label={t("users.filters.aria", "Kullanıcı filtreleri")}>
      <Grid>
        <Field>
          <Label className="sr-only" htmlFor="user-search">
            {t("users.filters.searchLabel", "Kullanıcı ara")}
          </Label>
          <InputWrap>
            <Icon aria-hidden="true" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23C15.99 6.01 13.48 3.5 10.5 3.5S5.01 6.01 5.01 9s2.51 5.5 5.49 5.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l4.25 4.25a1 1 0 0 0 1.41-1.41L15.5 14Zm-5 0C8.02 14 6 11.98 6 9.5S8.02 5 10.5 5 15 7.02 15 9.5 12.98 14 10.5 14Z" />
            </Icon>
            <Input
              id="user-search"
              type="text"
              name="query"
              placeholder={t("users.filters.search", "Ara: ad, e-posta...")}
              value={filters.query}
              onChange={(e) => update({ query: e.target.value })}
              aria-describedby="user-search-hint"
            />
          </InputWrap>
          <Hint id="user-search-hint">
            {t("users.filters.searchHint", "Ad veya e-posta ile ara")}
          </Hint>
        </Field>

        <Field>
          <Label htmlFor="user-role">{t("users.filters.role", "Rol")}</Label>
          <Select
            id="user-role"
            name="role"
            value={filters.role}
            onChange={(e) => update({ role: e.target.value })}
          >
            <option value="">{t("users.filters.allRoles", "Tüm roller")}</option>
            <option value="superadmin">superadmin</option>
            <option value="admin">admin</option>
            <option value="moderator">moderator</option>
            <option value="staff">staff</option>
            <option value="user">user</option>
            <option value="customer">customer</option>
          </Select>
        </Field>

        <Field>
          <Label htmlFor="user-status">{t("users.filters.status", "Durum")}</Label>
          <Select
            id="user-status"
            name="isActive"
            value={filters.isActive}
            onChange={(e) => update({ isActive: e.target.value })}
          >
            <option value="">{t("users.filters.allStatuses", "Tümü")}</option>
            <option value="true">{t("users.filters.active", "Aktif")}</option>
            <option value="false">{t("users.filters.inactive", "Pasif")}</option>
          </Select>
        </Field>

        <Actions>
          <ClearButton
            type="button"
            onClick={() => update({ query: "", role: "", isActive: "" })}
            aria-label={t("users.filters.clear", "Filtreleri temizle")}
            title={t("users.filters.clear", "Filtreleri temizle")}
          >
            {t("users.filters.clear", "Temizle")}
          </ClearButton>
        </Actions>
      </Grid>
    </Bar>
  );
}

/* ===================== styles ===================== */

const Bar = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderBright};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
  margin: ${({ theme }) => theme.spacings.lg} 0 ${({ theme }) => theme.spacings.xl};

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.md};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.8fr auto;
  gap: ${({ theme }) => theme.spacings.md};

  ${({ theme }) => theme.media.medium} {
    grid-template-columns: 1fr 1fr;
  }
  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 6px;

  &.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border: 0;
  }
`;

const InputWrap = styled.div`
  position: relative;
`;

const Icon = styled.svg`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  fill: ${({ theme }) => theme.colors.inputIcon};
  pointer-events: none;
  opacity: 0.9;
`;

const baseFieldCss = `
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  outline: none;
  transition: box-shadow 0.2s, border-color 0.2s, background 0.2s;
  ::placeholder { opacity: .8; }
  &:focus {
    box-shadow: var(--shadow-focus, 0 0 0 3px rgba(72,98,137,0.12));
  }
`;

const Input = styled.input`
  ${baseFieldCss}
  padding-left: 36px; /* icon için */
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  border: 1px solid ${({ theme }) => theme.inputs.border};

  &:focus {
    border-color: ${({ theme }) => theme.inputs.borderFocus};
  }
`;

const Select = styled.select`
  ${baseFieldCss}
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  border: 1px solid ${({ theme }) => theme.inputs.border};

  &:focus {
    border-color: ${({ theme }) => theme.inputs.borderFocus};
  }
`;

const Hint = styled.small`
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 6px;
`;

const Actions = styled.div`
  display: flex;
  align-items: end;
  justify-content: flex-end;

  ${({ theme }) => theme.media.small} {
    justify-content: stretch;
  }
`;

const ClearButton = styled.button`
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.textOnDanger};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: filter 0.15s, transform 0.05s, box-shadow 0.15s;

  &:hover { filter: brightness(0.98); }
  &:active { transform: translateY(1px); }

  ${({ theme }) => theme.media.small} {
    width: 100%;
  }
`;

"use client";

import React, { useEffect, useCallback } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchActivityCategories,
  deleteActivityCategory,
  ActivityCategory,
} from "@/modules/activity/slice/activityCategorySlice";

interface Props {
  onAdd: () => void;
  onEdit: (category: ActivityCategory) => void;
}

export default function ActivityCategoryListPage({ onAdd, onEdit }: Props) {
  const { t } = useTranslation("adminActivity");
  const dispatch = useAppDispatch();
  const { categories, loading, error } = useAppSelector(
    (state) => state.activityCategory
  );

  useEffect(() => {
    dispatch(fetchActivityCategories());
  }, [dispatch]);

  const handleDelete = useCallback(
    (id: string) => {
      const confirmed = confirm(
        t("confirm.delete", "Are you sure you want to delete this category?")
      );
      if (confirmed) dispatch(deleteActivityCategory(id));
    },
    [dispatch, t]
  );

  return (
    <Wrapper>
      <Header>
        <h2>{t("categories.title", "Activity Categories")}</h2>
        <PrimaryButton onClick={onAdd}>
          {t("categories.add", "Add Category")}
        </PrimaryButton>
      </Header>

      {loading ? (
        <Status>{t("loading", "Loading...")}</Status>
      ) : error ? (
        <Error>{error}</Error>
      ) : categories.length === 0 ? (
        <Status>{t("categories.empty", "No categories found.")}</Status>
      ) : (
        <StyledTable>
          <thead>
            <tr>
              <th>#</th>
              <th>{t("language.en", "EN")}</th>
              <th>{t("language.tr", "TR")}</th>
              <th>{t("language.de", "DE")}</th>
              <th>{t("slug", "Slug")}</th>
              <th>{t("actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat._id}>
                <td>{i + 1}</td>
                <td>{cat.name.en}</td>
                <td>{cat.name.tr}</td>
                <td>{cat.name.de}</td>
                <td>{cat.slug}</td>
                <td>
                  <ActionGroup>
                    <WarningButton onClick={() => onEdit(cat)}>
                      {t("edit", "Edit")}
                    </WarningButton>
                    <DangerButton onClick={() => handleDelete(cat._id)}>
                      {t("delete", "Delete")}
                    </DangerButton>
                  </ActionGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

const PrimaryButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.primary || "#007bff"};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm || "4px"};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover || "#0056b3"};
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  th,
  td {
    padding: 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.border || "#ddd"};
    text-align: left;
  }

  th {
    background: ${({ theme }) => theme.colors.tableHeader || "#f0f0f0"};
    color: ${({ theme }) => theme.colors.text || "#333"};
  }
`;

const Status = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary || "#666"};
  font-size: 0.95rem;
`;

const Error = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.danger || "red"};
  font-size: 0.95rem;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const BaseButton = styled.button`
  padding: 0.4rem 0.8rem;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
`;

const WarningButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.warning || "#f0ad4e"};
`;

const DangerButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.danger || "#d9534f"};
`;

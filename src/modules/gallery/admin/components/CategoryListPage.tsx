"use client";

import React, { useEffect, useCallback } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import translations from "../../locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteGalleryCategory,
  fetchGalleryCategories,
} from "@/modules/gallery/slice/galleryCategorySlice";
import type { IGalleryCategory } from "@/modules/gallery/types";

interface GalleryCategoryListPageProps {
  onAdd: () => void;
  onEdit: (category: IGalleryCategory) => void;
}

const GalleryCategoryListPage: React.FC<GalleryCategoryListPageProps> = ({
  onAdd,
  onEdit,
}) => {
  const { i18n, t } = useI18nNamespace("gallery", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const dispatch = useAppDispatch();
  const { categories = [], loading, error } = useAppSelector(
    (state) => state.galleryCategory || {}
  );

  useEffect(() => {
    dispatch(fetchGalleryCategories());
  }, [dispatch]);

  const handleDelete = useCallback(
    (id: string) => {
      if (
        window.confirm(
          t(
            "admin.confirm.delete",
            "Are you sure you want to delete this category?"
          )
        )
      ) {
        dispatch(deleteGalleryCategory(id));
      }
    },
    [dispatch, t]
  );

  return (
    <Wrapper>
      <Header>
        <Title>{t("admin.categories.title", "Gallery Categories")}</Title>
        <PrimaryButton type="button" onClick={onAdd}>
          {t("admin.categories.add", "Add Category")}
        </PrimaryButton>
      </Header>

      {loading ? (
        <Status>{t("loading", "Loading...")}</Status>
      ) : error ? (
        <Error>{error}</Error>
      ) : !categories || categories.length === 0 ? (
        <Status>{t("admin.categories.empty", "No categories found.")}</Status>
      ) : (
        <TableWrapper>
          <StyledTable>
            <thead>
              <tr>
                <TableHeaderCell>#</TableHeaderCell>
                {SUPPORTED_LOCALES.map((lng) => (
                  <TableHeaderCell key={lng}>
                    {t(`admin.language.${lng}`, lng.toUpperCase())}
                  </TableHeaderCell>
                ))}
                <TableHeaderCell>{t("admin.slug", "Slug")}</TableHeaderCell>
                <TableHeaderCell>
                  {t("admin.actions", "Actions")}
                </TableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <TableRow key={cat._id}>
                  <TableCell>{i + 1}</TableCell>
                  {SUPPORTED_LOCALES.map((lng) => (
                    <TableCell key={lng}>
                      {cat.name?.[lng] || <i>-</i>}
                    </TableCell>
                  ))}
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>
                    <ActionGroup>
                      <EditButton type="button" onClick={() => onEdit(cat)}>
                        {t("admin.edit", "Edit")}
                      </EditButton>
                      <DeleteButton
                        type="button"
                        onClick={() => handleDelete(cat._id)}
                      >
                        {t("admin.delete", "Delete")}
                      </DeleteButton>
                    </ActionGroup>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </StyledTable>
        </TableWrapper>
      )}
    </Wrapper>
  );
};

export default GalleryCategoryListPage;


const Wrapper = styled.section`
  margin-top: ${({ theme }) => theme.spacings.xl};
  width: 100%;
  max-width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.lg};

  @media ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacings: 0.01em;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: box-shadow ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal};

  @media ${({ theme }) => theme.media.mobile} {
    border-radius: ${({ theme }) => theme.radii.md};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const StyledTable = styled.table`
  width: 100%;
  min-width: 700px;
  border-collapse: collapse;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};

  @media ${({ theme }) => theme.media.mobile} {
    min-width: 360px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const TableHeaderCell = styled.th`
  background: ${({ theme }) => theme.colors.tableHeader};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacings.md};
  text-align: left;
  border-bottom: ${({ theme }) => theme.borders.thick}
    ${({ theme }) => theme.colors.border};
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacings.md};
  border-bottom: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  vertical-align: middle;

  &:first-child {
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const TableRow = styled.tr`
  &:nth-child(even) ${TableCell} {
    background: ${({ theme }) => theme.colors.backgroundSecondary};
  }
  transition: background ${({ theme }) => theme.transition.normal};

  &:hover ${TableCell} {
    background: ${({ theme }) => theme.colors.hoverBackground};
  }
`;

const Status = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: ${({ theme }) => theme.spacings.xl} 0;
  font-family: ${({ theme }) => theme.fonts.body};
`;

const Error = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: ${({ theme }) => theme.spacings.xl} 0;
  font-family: ${({ theme }) => theme.fonts.body};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.md};
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.xl};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
    opacity: ${({ theme }) => theme.opacity.disabled};
    box-shadow: none;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const EditButton = styled.button`
  background: ${({ theme }) => theme.colors.warning};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  padding: ${({ theme }) => theme.spacings.xs}
    ${({ theme }) => theme.spacings.lg};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) =>
      theme.colors.warningHover || theme.colors.warning};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const DeleteButton = styled.button`
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  padding: ${({ theme }) => theme.spacings.xs}
    ${({ theme }) => theme.spacings.lg};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.danger.backgroundHover};
    color: ${({ theme }) => theme.buttons.danger.textHover};
  }
`;

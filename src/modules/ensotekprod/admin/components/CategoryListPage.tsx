"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/ensotekprod";
import { useAppDispatch } from "@/store/hooks";
import { deleteEnsotekCategory } from "@/modules/ensotekprod/slice/ensotekCategorySlice";
import type { EnsotekCategory } from "@/modules/ensotekprod/types";
import { LANG_LABELS, SupportedLocale } from "@/types/common";
import Image from "next/image";

interface Props {
  onAdd: () => void;
  onEdit: (category: EnsotekCategory) => void;
}

export default function EnsotekprodCategoryListPage({ onAdd, onEdit }: Props) {
  const { i18n, t } = useI18nNamespace("ensotekprod", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const dispatch = useAppDispatch();
  const { categories, loading, error } = useAppSelector((state) => state.ensotekCategory);

  const handleDelete = (id: string) => {
    const confirmMessage = t("admin.confirm.delete", "Are you sure you want to delete this category?");
    if (window.confirm(confirmMessage)) {
      dispatch(deleteEnsotekCategory(id));
    }
  };

  return (
    <Wrapper>
      <Header>
        <Title>{t("admin.categories.title", "Product Categories")}</Title>
        <Primary onClick={onAdd}>{t("admin.categories.add", "Add Category")}</Primary>
      </Header>

      {loading ? (
        <Status>{t("admin.loading", "Loading...")}</Status>
      ) : error ? (
        <Error>❌ {error}</Error>
      ) : categories.length === 0 ? (
        <Status>{t("admin.categories.empty", "No categories found.")}</Status>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>{t(`admin.language.${lang}`, LANG_LABELS[lang])}</th>
              <th>{t("admin.slug", "Slug")}</th>
              <th>{t("admin.categories.image", "Image")}</th>
              <th>{t("admin.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => {
              const imageSrc =
                cat.images?.[0]?.thumbnail || cat.images?.[0]?.url || "";

              return (
                <tr key={cat._id}>
                  <td>{i + 1}</td>
                  <td>{cat.name?.[lang] || "—"}</td>
                  <td>{cat.slug}</td>
                  <td>
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt="category image"
                        width={60}
                        height={60}
                        style={{ borderRadius: 6, objectFit: "cover" }}
                      />
                    ) : (
                      <Muted>{t("admin.ensotekprod.no_images", "No images")}</Muted>
                    )}
                  </td>
                  <td>
                    <ButtonRow>
                      <Secondary onClick={() => onEdit(cat)}>{t("admin.edit", "Edit")}</Secondary>
                      <Danger onClick={() => handleDelete(cat._id)}>{t("admin.delete", "Delete")}</Danger>
                    </ButtonRow>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Wrapper>
  );
}

/* styled */
const Wrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;

  th, td {
    padding: ${({ theme }) => theme.spacings.sm};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    text-align: left;
    font-size: ${({ theme }) => theme.fontSizes.base};
  }
  th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }
  tr:last-child td { border-bottom: none; }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const Primary = styled.button`
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.buttons.primary.backgroundHover}; }
`;

const Secondary = styled.button`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor: pointer;
`;

const Danger = styled(Secondary)`
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};
  &:hover { filter: brightness(0.98); }
`;

const Status = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Error = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.danger};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const Muted = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

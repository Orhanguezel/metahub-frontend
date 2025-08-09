"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { fetchUsers } from "@/modules/users/slice/userCrudSlice";
import { UserTableRow } from "@/modules/users";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { adminUserTranslations } from "@/modules/users";
import type { User } from "@/modules/users/types/user";
import type { UserFilterState } from "@/app/admin/users/page";

interface Props {
  filters: UserFilterState;
}

export default function UserTable({ filters }: Props) {
  const { t } = useI18nNamespace("adminUser", adminUserTranslations);
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error, meta } = useSelector((s: RootState) => s.userCrud);

  // local pagination
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);

  // Filters → server query
  const queryObj = useMemo(() => {
    const q: Record<string, string | number> = { page, limit };
    if (filters.query) q.q = filters.query;
    if (filters.role) q.role = filters.role;
    if (filters.isActive) q.isActive = filters.isActive; // "true" | "false"
    return q;
  }, [filters, page, limit]);

  // Debounced fetch
  useEffect(() => {
    const id = setTimeout(() => {
      dispatch(fetchUsers(queryObj));
    }, 250);
    return () => clearTimeout(id);
  }, [dispatch, queryObj]);

  // Clamp page if backend meta changes (örn. filtreyle sayfa sayısı küçüldü)
  useEffect(() => {
    if (meta?.totalPages && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta?.totalPages, page]);

  // Row refresh callback (ör. işlemler sonrası)
  const refreshNow = useCallback(() => {
    dispatch(fetchUsers(queryObj));
  }, [dispatch, queryObj]);

  // Safety: UI bozulmasın diye boolean normalize
  const normalizedUsers: User[] = (users || []).map((u: any) => ({
    ...u,
    isActive: !!u.isActive,
  }));

  const totalLabel =
    typeof meta?.total === "number"
      ? t("table.count", "{{count}} kayıt", { count: meta.total })
      : t("table.count", "{{count}} kayıt", { count: normalizedUsers.length });

  return (
    <Card>
      <TopBar>
        <Meta>
          {loading
            ? t("table.loading", "Yükleniyor…")
            : error
            ? t("table.error", "Bir hata oluştu.")
            : totalLabel}
        </Meta>

        <RightControls>
          <Label htmlFor="perPage">{t("pager.perPage", "Sayfa başı")}</Label>
          <Select
            id="perPage"
            value={limit}
            onChange={(e) => {
              setPage(1); // limit değişince başa dön
              setLimit(parseInt(e.target.value, 10));
            }}
          >
            {[10, 12, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </RightControls>
      </TopBar>

      <ScrollX>
        <Table role="table" aria-label={t("users.title", "Kullanıcılar")}>
          <thead>
            <tr>
              <Th>{t("users.table.name", "Ad Soyad / E-posta")}</Th>
              <Th>{t("users.table.role", "Rol")}</Th>
              <Th>{t("users.table.active", "Durum")}</Th>
              <Th>{t("users.table.actions", "İşlemler")}</Th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <RowMessage>
                <td colSpan={4}>{t("users.loading", "Yükleniyor…")}</td>
              </RowMessage>
            ) : error ? (
              <RowMessage>
                <td colSpan={4}>{t("table.error", "Bir hata oluştu.")}</td>
              </RowMessage>
            ) : normalizedUsers.length > 0 ? (
              normalizedUsers.map((user) => (
                <UserTableRow key={user._id} user={user} onRefresh={refreshNow} />
              ))
            ) : (
              <RowMessage>
                <td colSpan={4}>{t("users.noResults", "Kullanıcı bulunamadı.")}</td>
              </RowMessage>
            )}
          </tbody>
        </Table>
      </ScrollX>

      <BottomBar>
        <Pager>
          <PageBtn
            type="button"
            disabled={loading || page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label={t("pager.prev", "Önceki")}
          >
            ‹ {t("pager.prev", "Önceki")}
          </PageBtn>

          <PageInfo>
            {t("pager.pageOf", "{{page}} / {{total}}", {
              page: meta?.page ?? page,
              total: meta?.totalPages ?? 1,
            })}
          </PageInfo>

          <PageBtn
            type="button"
            disabled={loading || !meta?.totalPages || page >= meta.totalPages}
            onClick={() =>
              setPage((p) =>
                meta?.totalPages ? Math.min(meta.totalPages, p + 1) : p + 1
              )
            }
            aria-label={t("pager.next", "Sonraki")}
          >
            {t("pager.next", "Sonraki")} ›
          </PageBtn>
        </Pager>
      </BottomBar>
    </Card>
  );
}

/* ===================== Styles ===================== */

const Card = styled.section`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.form};
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderBright};

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.md};
    gap: ${({ theme }) => theme.spacings.sm};
    flex-direction: column;
    align-items: stretch;
  }
`;

const Meta = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};

  ${({ theme }) => theme.media.small} {
    justify-content: flex-end;
  }
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Select = styled.select`
  padding: 0.5rem 0.65rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const ScrollX = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 720px; /* mobilde taşma yerine kaydırma */

  thead th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.textAlt};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    padding: 14px 16px;
    text-align: left;
    font-size: 0.95rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderBright};
  }

  tbody td {
    padding: 14px 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderBright};
    vertical-align: middle;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.cardBackground};
  }
`;

const Th = styled.th`
  text-align: left;
`;

const RowMessage = styled.tr`
  td {
    text-align: center;
    padding: ${({ theme }) => theme.spacings.xl};
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const BottomBar = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.cardBackground};
`;

const Pager = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const PageBtn = styled.button`
  padding: 0.45rem 0.8rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transition.fast};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  min-width: 84px;
  text-align: center;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

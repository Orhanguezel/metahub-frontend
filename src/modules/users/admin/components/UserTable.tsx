// UserTable.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { adminUserTranslations } from "@/modules/users";
import type { User } from "@/modules/users/types/user";
import type { UserFilterState } from "@/app/admin/users/page";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { UserTableRow } from "@/modules/users";
// import { fetchUsers } from "@/modules/users/slice/userCrudSlice"; // örn: server fetch (varsa)

interface Props {
  filters: UserFilterState;
}

export default function UserTable({ filters }: Props) {
  const { t } = useI18nNamespace("adminUser", adminUserTranslations);
  const dispatch = useAppDispatch();
  const { users, loading, error, meta } = useAppSelector((s) => s.userCrud);

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);

  const queryObj = useMemo(() => {
    const q: Record<string, string | number> = { page, limit };
    if (filters.query) q.q = filters.query;
    if (filters.role) q.role = filters.role;
    if (filters.isActive) q.isActive = filters.isActive;
    return q;
  }, [filters, page, limit]);

  // Debounced fetch (örnek)
  useEffect(() => {
    const id = setTimeout(() => {
      // dispatch(fetchUsers(queryObj) as any);
    }, 250);
    return () => clearTimeout(id);
  }, [dispatch, queryObj]);

  useEffect(() => {
    if (meta?.totalPages && page > meta.totalPages && meta.totalPages > 0) {
      setPage(meta.totalPages);
    }
  }, [meta?.totalPages, page]);

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
              setPage(1);
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

      <CardsWrap aria-label={t("users.title", "Kullanıcılar")}>
        {loading && <Empty>{t("users.loading", "Yükleniyor…")}</Empty>}
        {error && !loading && <Empty>{t("table.error", "Bir hata oluştu.")}</Empty>}
        {!loading && !error && normalizedUsers.length === 0 && (
          <Empty>{t("users.noResults", "Kullanıcı bulunamadı.")}</Empty>
        )}

        {normalizedUsers.map((user) => (
          <UserTableRow key={user._id} user={user} />
        ))}
      </CardsWrap>

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
              setPage((p) => (meta?.totalPages ? Math.min(meta.totalPages, p + 1) : p + 1))
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

const CardsWrap = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
  padding: ${({ theme }) => theme.spacings.md};
  grid-template-columns: 1fr;

  @media (min-width: ${({ theme }) => theme.breakpoints.laptopS}) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Empty = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
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

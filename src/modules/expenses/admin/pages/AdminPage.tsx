"use client";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/expenses";
import {
  fetchAllExpensesAdmin,
  clearExpenseMessages,
  deleteExpense,
} from "@/modules/expenses/slice/expensesSlice";
import type { IExpense } from "@/modules/expenses/types";
import { ExpenseList, ExpenseForm } from "@/modules/expenses";

export default function AdminExpensesPage() {
  const { t } = useI18nNamespace("expenses", translations);
  const dispatch = useAppDispatch();
  const { expensesAdmin, loading, error, successMessage } = useAppSelector((s) => s.expenses);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IExpense | null>(null);

  useEffect(() => {
    dispatch(fetchAllExpensesAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearExpenseMessages());
  }, [successMessage, error, dispatch]);

  const count = useMemo(
    () => (Array.isArray(expensesAdmin) ? expensesAdmin.length : 0),
    [expensesAdmin]
  );

  return (
    <PageWrap>
      <Header>
        <h1>{t("title", "Expenses")}</h1>
        <Right>
          <Counter aria-label={t("count", "Count")}>{count}</Counter>
          <PrimaryBtn
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + {t("new", "New")}
          </PrimaryBtn>
        </Right>
      </Header>

      {showForm && (
        <Card role="region" aria-label={t("form", "Expense Form")}>
          <ExpenseForm
            initial={editing || undefined}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              dispatch(fetchAllExpensesAdmin());
            }}
          />
        </Card>
      )}

      <Section>
        <SectionHead>
          <h2>{t("list", "Expenses")}</h2>
          <SmallBtn
            type="button"
            onClick={() => dispatch(fetchAllExpensesAdmin())}
            disabled={loading}
            aria-busy={loading}
          >
            {t("refresh", "Refresh")}
          </SmallBtn>
        </SectionHead>
        <Card role="region" aria-live="polite">
          <ExpenseList
            items={expensesAdmin || []}
            loading={loading}
            onEdit={(e) => {
              setEditing(e);
              setShowForm(true);
            }}
            onDelete={(id) => dispatch(deleteExpense(id))}
          />
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled ---- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;
const Right = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
`;
const Counter = styled.span`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacings.xl};
`;
const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;
const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;
const PrimaryBtn = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;
const SmallBtn = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;

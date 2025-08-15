"use client";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/cashbook/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearCashbookMessages,
} from "@/modules/cashbook/slice/cashbookSlice";
import type { ICashAccount } from "@/modules/cashbook/types";
import { CashAccountList, CashAccountForm, CashEntryList, CashEntryForm } from "@/modules/cashbook";

export default function AdminCashbookPage() {
  const { t } = useI18nNamespace("cashbook", translations);
  const dispatch = useAppDispatch();

  // Güvenli selector’lar (slice undefined olsa bile çökmemek için)
  const accounts = useAppSelector((s) =>
    Array.isArray(s.cashbook?.accounts) ? s.cashbook.accounts : []
  );
  const entries = useAppSelector((s) =>
    Array.isArray(s.cashbook?.entries) ? s.cashbook.entries : []
  );
  const loading = useAppSelector((s) => Boolean(s.cashbook?.loading));
  const error = useAppSelector((s) => s.cashbook?.error || null);
  const message = useAppSelector((s) => s.cashbook?.message || null);

  const [showAccForm, setShowAccForm] = useState(false);
  const [editingAcc, setEditingAcc] = useState<ICashAccount | null>(null);

  const [showEntryForm, setShowEntryForm] = useState(false);


  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);
    if (message || error) dispatch(clearCashbookMessages());
  }, [message, error, dispatch]);

  const accountCount = useMemo(() => accounts.length, [accounts]);

  return (
    <PageWrap>
      <Header>
        <h1>{t("title", "Cashbook Admin")}</h1>
        <Right>
          <Counter aria-label={t("labels.accountsCount", "Accounts count")}>
            {accountCount} {t("labels.accounts", "accounts")}
          </Counter>
          <PrimaryBtn
            type="button"
            onClick={() => {
              setEditingAcc(null);
              setShowAccForm(true);
            }}
            disabled={loading}
            aria-busy={loading}
            aria-label={t("actions.newAccount", "New Account")}
            title={t("actions.newAccount", "New Account")}
          >
            + {t("actions.newAccount", "New Account")}
          </PrimaryBtn>
          <SecondaryBtn
            type="button"
            onClick={() => setShowEntryForm(true)}
            disabled={loading}
            aria-busy={loading}
            aria-label={t("actions.newEntry", "New Entry")}
            title={t("actions.newEntry", "New Entry")}
          >
            + {t("actions.newEntry", "New Entry")}
          </SecondaryBtn>
        </Right>
      </Header>

      {showAccForm && (
        <Card aria-live="polite">
          <CashAccountForm
            initial={editingAcc || undefined}
            onClose={() => setShowAccForm(false)}
            onSaved={() => {
              setShowAccForm(false);
            }}
          />
        </Card>
      )}

      {showEntryForm && (
        <Card aria-live="polite">
          <CashEntryForm
            accounts={accounts}
            onClose={() => setShowEntryForm(false)}
            onSaved={() => {
              setShowEntryForm(false);
            }}
          />
        </Card>
      )}

      <Section role="region" aria-label={t("sections.accounts", "Accounts")}>
        <SectionHead>
          <h2>{t("sections.accounts", "Accounts")}</h2>
          <SmallBtn
            type="button"
            disabled={loading}
            aria-busy={loading}
          >
            {t("actions.refresh", "Refresh")}
          </SmallBtn>
        </SectionHead>
        <Card>
          <CashAccountList
            items={accounts}
            loading={loading}
            onEdit={(a) => {
              setEditingAcc(a);
              setShowAccForm(true);
            }}
          />
        </Card>
      </Section>

      <Section role="region" aria-label={t("sections.entries", "Entries")}>
        <SectionHead>
          <h2>{t("sections.entries", "Entries")}</h2>
          <SmallBtn
            type="button"
            disabled={loading}
            aria-busy={loading}
          >
            {t("actions.refresh", "Refresh")}
          </SmallBtn>
        </SectionHead>
        <Card>
          <CashEntryList items={entries} loading={loading} />
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled (theme-compliant) ---- */
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
`;

const Right = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
  flex-wrap: wrap;
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
  gap: ${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;

const BaseBtn = styled.button`
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transition.fast};
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

const PrimaryBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 12px;
  &:hover { opacity: ${({ theme }) => theme.opacity.hover}; }
`;

const SecondaryBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 8px 12px;
  &:hover { opacity: ${({ theme }) => theme.opacity.hover}; }
`;

const SmallBtn = styled(SecondaryBtn)`
  padding: 6px 10px;
`;

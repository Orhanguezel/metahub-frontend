"use client";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/contracts/locales";
import {
  clearContractMessages,
  changeContractStatus,
  deleteContract,
} from "@/modules/contracts/slice/contractsSlice";
import type { IContract, ContractStatus } from "@/modules/contracts/types";
import { ContractList, ContractForm } from "@/modules/contracts";

export default function AdminContractsPage() {
  const { t } = useI18nNamespace("contracts", translations);
  const dispatch = useAppDispatch();

  // contracts
  const contracts = useAppSelector(
    (s) => (Array.isArray(s.contracts.contractsAdmin) ? s.contracts.contractsAdmin : []) as IContract[]
  );
  const loading = useAppSelector((s) => s.contracts.loading);
  const error = useAppSelector((s) => s.contracts.error);
  const successMessage = useAppSelector((s) => s.contracts.successMessage);

  // ---- Toasts ----
  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearContractMessages());
  }, [successMessage, error, dispatch]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IContract | null>(null);

  const count = useMemo(() => contracts.length, [contracts]);

  return (
    <PageWrap>
      <Header>
        <h1>{t("title","Contracts Admin")}</h1>
        <Right>
          <Counter aria-label={t("a11y.count","Total count")}>{count}</Counter>
          <PrimaryBtn
            type="button"
            onClick={() => { setEditing(null); setShowForm(true); }}
            aria-label={t("actions.new","New Contract")}
          >
            + {t("actions.new","New Contract")}
          </PrimaryBtn>
        </Right>
      </Header>

      {showForm && (
        <Card role="region" aria-label={t("sections.form","Contract form")}>
          <ContractForm
            initial={editing || undefined}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); }}
          />
        </Card>
      )}

      <Section>
        <SectionHead>
          <h2>{t("sections.contracts","Contracts")}</h2>
          <SmallBtn type="button" disabled={loading} aria-busy={loading}>
            {t("actions.refresh","Refresh")}
          </SmallBtn>
        </SectionHead>
        <Card>
          <ContractList
            items={contracts}
            loading={loading}
            onEdit={(c) => { setEditing(c); setShowForm(true); }}
            onDelete={(id) => dispatch(deleteContract(id))}
            onChangeStatus={(id: string, status: ContractStatus) =>
              dispatch(changeContractStatus({ id, status }))
            }
          />
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled ---- */
const PageWrap = styled.div`
  max-width:${({theme})=>theme.layout.containerWidth};
  margin:0 auto;
  padding:${({theme})=>theme.spacings.xl};
`;
const Header = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:${({theme})=>theme.spacings.lg};
  ${({theme})=>theme.media.mobile}{flex-direction:column;align-items:flex-start;gap:${({theme})=>theme.spacings.sm};}
`;
const Right = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};align-items:center;`;
const Counter = styled.span`
  padding:6px 10px;border-radius:${({theme})=>theme.radii.pill};
  background:${({theme})=>theme.colors.backgroundAlt};
  font-weight:${({theme})=>theme.fontWeights.medium};
`;
const Section = styled.section`margin-top:${({theme})=>theme.spacings.xl};`;
const SectionHead = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:${({theme})=>theme.spacings.sm};
`;
const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;
const PrimaryBtn = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 12px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;

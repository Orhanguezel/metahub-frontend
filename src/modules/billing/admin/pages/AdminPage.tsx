"use client";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/billing/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deletePlan,
  changePlanStatus,
  clearBillingMessages,
} from "@/modules/billing/slice/billingSlice";
import type { IBillingPlan, BillingPlanStatus } from "@/modules/billing/types";
import { BillingPlanList, BillingPlanForm, OccurrenceList } from "@/modules/billing";

export default function AdminBillingPage() {
  const { t } = useI18nNamespace("billing", translations);

  const dispatch = useAppDispatch();
  const { plans, occurrences, loading, error, successMessage } = useAppSelector((s) => s.billing);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IBillingPlan | null>(null);


  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearBillingMessages());
  }, [successMessage, error, dispatch]);

  const onCreate = () => { setEditing(null); setShowForm(true); };
  const onEdit = (p: IBillingPlan) => { setEditing(p); setShowForm(true); };
  const onCloseForm = () => setShowForm(false);

  const onDelete = (id: string) => dispatch(deletePlan(id));
  const onChangeStatus = (id: string, status: BillingPlanStatus) =>
    dispatch(changePlanStatus({ id, status }));

  const planCount = useMemo(() => plans.length, [plans]);

  return (
    <PageWrap>
      <Header>
        <Title id="billing-admin-title">{t("admin.title", "Billing Admin")}</Title>
        <Right>
          <Counter
            aria-live="polite"
            aria-label={t("admin.planCount", "{{count}} plan", { count: planCount })}
          >
            {planCount} {t("common.plan", "plan")}
          </Counter>
          <PrimaryBtn
            type="button"
            onClick={onCreate}
            aria-label={t("actions.newPlan", "New Plan")}
          >
            {t("actions.newPlan", "+ New Plan")}
          </PrimaryBtn>
        </Right>
      </Header>

      {showForm && (
        <Card role="region" aria-label={t("admin.formRegion", "Plan Form")}>
          <BillingPlanForm
            initial={editing || undefined}
            onClose={onCloseForm}
            onSaved={() => {
              setShowForm(false);
            }}
          />
        </Card>
      )}

      <Section aria-labelledby="plans-heading">
        <SectionHead>
          <H2 id="plans-heading">{t("sections.plans", "Plans")}</H2>
          <SecondaryBtn
            type="button"
            disabled={loading}
            aria-busy={loading}
          >
            {t("actions.refresh", "Refresh")}
          </SecondaryBtn>
        </SectionHead>
        <Card role="region" aria-label={t("sections.plans", "Plans")}>
          <BillingPlanList
            plans={plans}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onChangeStatus={onChangeStatus}
          />
        </Card>
      </Section>

      <Section aria-labelledby="occurrences-heading">
        <SectionHead>
          <H2 id="occurrences-heading">{t("sections.occurrences", "Occurrences")}</H2>
          <SecondaryBtn
            type="button"
            disabled={loading}
            aria-busy={loading}
          >
            {t("actions.refresh", "Refresh")}
          </SecondaryBtn>
        </SectionHead>
        <Card role="region" aria-label={t("sections.occurrences", "Occurrences")}>
          <OccurrenceList items={occurrences} loading={loading} />
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---------------- styled (classicTheme) ---------------- */

const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
  background: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.title};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.h2};
  margin: 0;
`;

const Right = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;

  ${({ theme }) => theme.media.mobile} {
    justify-content: space-between;
  }
`;

const Counter = styled.span`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primaryTransparent};
  color: ${({ theme }) => theme.colors.primary};
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

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacings.sm};
    flex-wrap: wrap;
  }
`;

const H2 = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cards.background};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;

const BaseBtn = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  border: ${({ theme }) => theme.borders.thin} transparent;
  transition: opacity ${({ theme }) => theme.transition.fast};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

const PrimaryBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border-color: ${({ theme }) => theme.buttons.primary.background};
  &:hover { opacity: ${({ theme }) => theme.opacity.hover}; }
`;

const SecondaryBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border-color: ${({ theme }) => theme.colors.border};
  &:hover { background: ${({ theme }) => theme.buttons.secondary.backgroundHover}; }
`;

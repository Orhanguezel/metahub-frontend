// src/modules/scheduling/ui/SchedulingAdminPage.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/* Slice: successKey kullanıyoruz */
import { clearSchedulingMsgs, setSelectedPlan } from "@/modules/scheduling/slice/schedulingSlice";
import { selectSchedulingState } from "@/modules/scheduling/slice/schedulingSlice";

import type { ISchedulePlan } from "@/modules/scheduling/types";
import { PlanDetail, PlanForm, PlanList } from "@/modules/scheduling";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/scheduling";

export default function SchedulingAdminPage() {
  const dispatch = useAppDispatch();
  // ✔ Tüm state tek seçiciden
  const { plans, selected, loading, error, successKey } = useAppSelector(selectSchedulingState);
  const { t, i18n } = useI18nNamespace("scheduling", translations);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ISchedulePlan | null>(null);

  // ✔ i18n key → toast
  useEffect(() => {
    if (successKey) toast.success(t(successKey));
    if (error) toast.error(error);
    if (successKey || error) dispatch(clearSchedulingMsgs());
  }, [successKey, error, dispatch, t]);

  const nf = useMemo(() => new Intl.NumberFormat(i18n.language), [i18n.language]);
  const count = useMemo(() => plans.length, [plans]);

  return (
    <Page>
      <Head>
        <Title>{t("page.title", "Scheduling Plans")}</Title>
        <Right>
          <Counter title={t("list.title", "Plan List")}>
            {t("list.title", "Plan List")}: {nf.format(count)}
          </Counter>

          {/* Not: Refresh parent’ta; burada tetik yok */}
          <Primary
            onClick={() => { setEditing(null); setShowForm(true); }}
            aria-label={t("form.titleCreate", "Create Plan")}
            disabled={loading}
          >
            + {t("form.titleCreate", "Create Plan")}
          </Primary>
        </Right>
      </Head>

      {showForm && (
        <Card role="region" aria-label={t("form.titleCreate", "Create Plan")}>
          <PlanForm
            initial={editing || undefined}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); }}
          />
        </Card>
      )}

      <Section>
        <SectionHead>
          <h2>{t("list.title", "Plan List")}</h2>
          <SmallBtn disabled aria-label={t("actions.refresh", "Refresh")}>
            {loading ? t("common.loading", "Loading...") : t("actions.refresh", "Refresh")}
          </SmallBtn>
        </SectionHead>

        <Card>
          <PlanList
            items={plans}
            loading={loading}
            onEdit={(p) => { setEditing(p); setShowForm(true); }}
          />
        </Card>

        {selected && (
          <Card>
            <PlanDetail
              plan={selected}
              onClose={() => dispatch(setSelectedPlan(null))}
            />
          </Card>
        )}
      </Section>
    </Page>
  );
}

/* styled */
const Page = styled.div`
  max-width:${({theme})=>theme.layout.containerWidth};
  margin:0 auto;
  padding:${({theme})=>theme.spacings.xl};
`;

const Head = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:${({theme})=>theme.spacings.lg};
  ${({theme})=>theme.media.mobile}{
    flex-direction:column;
    align-items:flex-start;
    gap:${({theme})=>theme.spacings.sm};
  }
`;

const Title = styled.h1`
  color:${({theme})=>theme.colors.title};
  font-size:${({theme})=>theme.fontSizes.h2};
  line-height:1.2;
  margin:0;
`;

const Right = styled.div`
  display:flex;
  gap:${({theme})=>theme.spacings.sm};
  align-items:center;
  flex-wrap:wrap;
`;

const Counter = styled.span`
  padding:6px 10px;
  border-radius:${({theme})=>theme.radii.pill};
  background:${({theme})=>theme.colors.backgroundAlt};
  color:${({theme})=>theme.colors.textSecondary};
  font-weight:${({theme})=>theme.fontWeights.medium};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
`;

const Section = styled.section`
  margin-top:${({theme})=>theme.spacings.xl};
  display:flex;
  flex-direction:column;
  gap:${({theme})=>theme.spacings.md};
`;

const SectionHead = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
`;

const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
`;

const focusable = css`
  transition: background ${({theme})=>theme.transition.fast}, color ${({theme})=>theme.transition.fast}, border-color ${({theme})=>theme.transition.fast}, box-shadow ${({theme})=>theme.transition.fast};
  &:focus { outline:none; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
`;

const Primary = styled.button`
  ${focusable}
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 12px;
  border-radius:${({theme})=>theme.radii.md};
  cursor:pointer;

  &:hover{ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
`;

const SmallBtn = styled.button`
  ${focusable}
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px;
  border-radius:${({theme})=>theme.radii.md};
  cursor:not-allowed;
  opacity:${({theme})=>theme.opacity.disabled};
`;

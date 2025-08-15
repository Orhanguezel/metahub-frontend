"use client";
import { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearReportsMsgs, fetchDefinitions, fetchRuns,
  setSelectedDefinition, setSelectedRun
} from "@/modules/reports/slice/reportsSlice";
import type { IReportDefinition } from "@/modules/reports/types";
import { RunDetail, RunTriggerForm, RunList, DefinitionForm, DefinitionList } from "@/modules/reports";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/reports";

export default function ReportsAdminPage() {
  const dispatch = useAppDispatch();
  const { defs, runs, selectedDef, selectedRun, loading, error, success } = useAppSelector(s => s.reportsAdmin);

  const { t, i18n } = useI18nNamespace("reports", translations);

  const [showDefForm, setShowDefForm] = useState(false);
  const [editingDef, setEditingDef] = useState<IReportDefinition | null>(null);

  const [showRunTrigger, setShowRunTrigger] = useState(false);
  const [runForDef, setRunForDef] = useState<IReportDefinition | undefined>(undefined);

  useEffect(() => {
    dispatch(fetchDefinitions());
    dispatch(fetchRuns());
  }, [dispatch]);

  useEffect(() => {
    if (success) toast.success(success);
    if (error) toast.error(error);
    if (success || error) dispatch(clearReportsMsgs());
  }, [success, error, dispatch]);

  const nf = new Intl.NumberFormat(i18n.language);
  const defCount = useMemo(() => defs?.length ?? 0, [defs]);
  const runCount = useMemo(() => runs?.length ?? 0, [runs]);

  return (
    <PageWrap>
      <Header>
        <Title>{t("title")}</Title>
        <Right>
          <Counter title={t("counts.definitions")}>{t("counts.definitions")}: {nf.format(defCount)}</Counter>
          <Counter title={t("counts.runs")}>{t("counts.runs")}: {nf.format(runCount)}</Counter>
          <PrimaryBtn
            onClick={() => { setEditingDef(null); setShowDefForm(true); }}
            aria-label={t("newDef")}
            disabled={loading}
          >
            {t("newDef")}
          </PrimaryBtn>
        </Right>
      </Header>

      {showDefForm && (
        <Card role="region" aria-label={t("sections.defs")}>
          <DefinitionForm
            initial={editingDef || undefined}
            onClose={() => setShowDefForm(false)}
            onSaved={() => { setShowDefForm(false); dispatch(fetchDefinitions()); }}
          />
        </Card>
      )}

      {showRunTrigger && (
        <Card role="region" aria-label={t("sections.runs")}>
          <RunTriggerForm
            def={runForDef}
            onClose={() => setShowRunTrigger(false)}
            onQueued={() => { setShowRunTrigger(false); dispatch(fetchRuns()); }}
          />
        </Card>
      )}

      <Section>
        <SectionHead>
          <h2>{t("sections.defs")}</h2>
          <SmallBtn onClick={() => dispatch(fetchDefinitions())} disabled={loading} aria-label={t("actions.refresh")}>
            {loading ? t("common.loading") : t("actions.refresh")}
          </SmallBtn>
        </SectionHead>
        <Card>
          <DefinitionList
            items={defs || []}
            loading={loading}
            onEdit={(d: IReportDefinition) => { setEditingDef(d); setShowDefForm(true); }}
            onTrigger={(d: IReportDefinition) => { setRunForDef(d); setShowRunTrigger(true); }}
          />
        </Card>

        {selectedDef && (
          <Card>
            <DefJsonHead>
              <h3>
                {t("jsonTitle")} — <code>{selectedDef.code}</code>
              </h3>
              <SmallBtn onClick={() => dispatch(setSelectedDefinition(null))} aria-label={t("actions.hide")}>
                {t("actions.hide")}
              </SmallBtn>
            </DefJsonHead>
            <Pre>{JSON.stringify(selectedDef, null, 2)}</Pre>
          </Card>
        )}
      </Section>

      <Section>
        <SectionHead>
          <h2>{t("sections.runs")}</h2>
          <SmallBtn onClick={() => dispatch(fetchRuns())} disabled={loading} aria-label={t("actions.refresh")}>
            {loading ? t("common.loading") : t("actions.refresh")}
          </SmallBtn>
        </SectionHead>
        <Card>
          <RunList items={runs || []} loading={loading} />
        </Card>

        {selectedRun && (
          <Card>
            <RunDetail run={selectedRun} onClose={() => dispatch(setSelectedRun(null))} />
          </Card>
        )}
      </Section>
    </PageWrap>
  );
}

/* styled */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;

const Header = styled.header`
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

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.title};
  font-size: ${({ theme }) => theme.fontSizes.h2};
  line-height: 1.2;
  margin: 0;
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
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
`;

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacings.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
`;

const focusable = css`
  transition:
    background ${({ theme }) => theme.transition.fast},
    color ${({ theme }) => theme.transition.fast},
    border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};
  &:focus {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;


const PrimaryBtn = styled.button`
  ${focusable}
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;

  &:hover { background: ${({ theme }) => theme.buttons.primary.backgroundHover}; }
  &:disabled { opacity: ${({ theme }) => theme.opacity.disabled}; cursor: not-allowed; }
`;

const SmallBtn = styled.button`
  ${focusable}
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;

  &:hover { background: ${({ theme }) => theme.buttons.secondary.backgroundHover}; color: ${({ theme }) => theme.buttons.secondary.textHover}; }
  &:disabled { opacity: ${({ theme }) => theme.opacity.disabled}; cursor: not-allowed; }
`;

const DefJsonHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Pre = styled.pre`
  max-height: 420px;
  overflow: auto;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
`;

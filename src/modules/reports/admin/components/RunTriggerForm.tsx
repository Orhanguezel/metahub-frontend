"use client";
import styled, { css } from "styled-components";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { createRun } from "@/modules/reports/slice/reportsSlice";
import type { IReportDefinition, ReportKind } from "@/modules/reports/types";
import { REPORT_KINDS } from "@/modules/reports/types";
import { JSONEditor } from "@/modules/reports";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/reports";

export default function RunTriggerForm({
  def,
  onClose,
  onQueued,
}: {
  def?: IReportDefinition;
  onClose: () => void;
  onQueued?: () => void;
}) {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("reports", translations);

  // _id opsiyonel olduğundan state tipi string | undefined
  const [definitionRef] = useState<string | undefined>(def?._id);
  const [kind, setKind] = useState<ReportKind | "">((def?.kind as ReportKind) || "");
  const [filtersUsed, setFiltersUsed] = useState<any>(
    def?.defaultFilters || { date: { preset: "this_month" } }
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        createRun({
          definitionRef, // optional
          kind: definitionRef ? undefined : (kind as ReportKind), // definition yoksa zorunlu
          filtersUsed,
          triggeredBy: "manual",
        })
      ).unwrap();
      onQueued?.();
    } catch {
      // hata mesajı slice tarafında yönetiliyor
    }
  };

  return (
    <Form onSubmit={submit} aria-describedby="run-trigger-desc">
      <SrOnly id="run-trigger-desc">
        {t("runTrigger.desc", "Queue a report run from a definition or by selecting a kind.")}
      </SrOnly>

      {definitionRef ? (
        <Info>
          {t("runTrigger.definition", "Definition")}: <code>{def?.code}</code> — <b>{def?.name}</b>
        </Info>
      ) : (
        <Row>
          <Col>
            <Label htmlFor="run-kind">{t("runTrigger.kind", "Kind (no definition)")}</Label>
            <Select
              id="run-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as ReportKind | "")}
              required
              aria-label={t("runTrigger.kind", "Kind (no definition)")}
            >
              <option value="">{t("common.select", "Select...")}</option>
              {REPORT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(`kinds.${k}`, k)}
                </option>
              ))}
            </Select>
          </Col>
        </Row>
      )}

      <Card>
        <JSONEditor
          label={t("runTrigger.filters", "Filters Override (JSON)")}
          value={filtersUsed}
          onChange={setFiltersUsed}
        />
      </Card>

      <Actions>
        <Secondary type="button" onClick={onClose}>
          {t("actions.cancel", "Cancel")}
        </Secondary>
        <Primary type="submit">{t("runTrigger.queue", "Queue Run")}</Primary>
      </Actions>
    </Form>
  );
}

/* styled */
const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Row = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
  grid-template-columns: repeat(2, 1fr);
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const focusable = css`
  transition: border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  ${focusable}
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: flex-end;
`;

const buttonBase = css`
  ${focusable}
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

const Primary = styled.button`
  ${buttonBase}
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

const Secondary = styled.button`
  ${buttonBase}
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
`;

const Info = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
`;

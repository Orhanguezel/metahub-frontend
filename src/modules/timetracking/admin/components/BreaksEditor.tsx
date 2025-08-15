"use client";
import styled from "styled-components";
import type { IBreakEntry } from "@/modules/timetracking/types";
import { DateTimeInput } from "@/modules/timetracking";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/timetracking";

export default function BreaksEditor({
  value,
  onChange,
}: {
  value: IBreakEntry[];
  onChange: (v: IBreakEntry[]) => void;
}) {
  const { t } = useI18nNamespace("timetracking", translations);

  const add = () => onChange([...(value || []), { paid: false }]);
  const rm = (i: number) => onChange((value || []).filter((_, idx) => idx !== i));
  const set = (i: number, patch: Partial<IBreakEntry>) =>
    onChange(value.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  return (
    <Wrap>
      <Head>
        <Title>{t("breaks.title")}</Title>
        <Btn type="button" onClick={add} aria-label={t("breaks.add")}>
          {t("breaks.add")}
        </Btn>
      </Head>

      {(value || []).length === 0 && <Empty>{t("breaks.empty")}</Empty>}

      {(value || []).map((b, i) => (
        <Row key={i}>
          <Col>
            <Label>{t("breaks.fields.start")}</Label>
            <DateTimeInput
              value={b.start as any}
              onChange={(v) => set(i, { start: v })}
              placeholder=""
              ariaLabel={t("breaks.fields.start")}
            />
          </Col>
          <Col>
            <Label>{t("breaks.fields.end")}</Label>
            <DateTimeInput
              value={b.end as any}
              onChange={(v) => set(i, { end: v })}
              placeholder=""
              ariaLabel={t("breaks.fields.end")}
            />
          </Col>
          <Col>
            <Label>{t("breaks.fields.minutes")}</Label>
            <Input
              type="number"
              min={0}
              value={b.minutes ?? ""}
              onChange={(e) =>
                set(i, { minutes: e.target.value === "" ? undefined : Number(e.target.value) })
              }
              placeholder={t("breaks.fields.minutesPh")}
              aria-label={t("breaks.fields.minutes")}
            />
          </Col>
          <Col>
            <Label>{t("breaks.fields.paid")}</Label>
            <Check>
              <input
                type="checkbox"
                checked={!!b.paid}
                onChange={(e) => set(i, { paid: e.target.checked })}
                aria-label={t("breaks.fields.paid")}
              />
            </Check>
          </Col>
          <Col>
            <Label>{t("breaks.fields.reason")}</Label>
            <Input
              value={b.reason || ""}
              onChange={(e) => set(i, { reason: e.target.value })}
              aria-label={t("breaks.fields.reason")}
            />
          </Col>
          <ColRight>
            <Danger type="button" onClick={() => rm(i)} aria-label={t("breaks.remove")}>
              {t("breaks.remove")}
            </Danger>
          </ColRight>
        </Row>
      ))}
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;
const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const Title = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const Row = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  grid-template-columns: repeat(6, 1fr);
  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;
const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
const ColRight = styled(Col)`
  align-items: flex-end;
  justify-content: flex-end;
`;
const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const inputBase = `
  padding: 8px 10px;
  border-radius: var(--r-md);
  border: var(--b-thin) var(--c-input-border);
  background: var(--c-input-bg);
  color: var(--c-input-text);
  transition: box-shadow var(--t-fast), border-color var(--t-fast);
  &:focus {
    outline: none;
    border-color: var(--c-input-focus);
    box-shadow: var(--shadow-focus);
  }
`;
const Input = styled.input`
  --b-thin: ${({ theme }) => theme.borders.thin};
  --c-input-border: ${({ theme }) => theme.colors.inputBorder};
  --c-input-bg: ${({ theme }) => theme.inputs.background};
  --c-input-text: ${({ theme }) => theme.inputs.text};
  --c-input-focus: ${({ theme }) => theme.colors.inputBorderFocus};
  --shadow-focus: ${({ theme }) => theme.colors.shadowHighlight};
  --r-md: ${({ theme }) => theme.radii.md};
  --t-fast: ${({ theme }) => theme.durations.fast};
  ${inputBase}
`;
const Btn = styled.button`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
`;
const Danger = styled(Btn)`
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};
  &:hover {
    background: ${({ theme }) => theme.colors.dangerHover};
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.dangerHover};
  }
`;
const Check = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
`;
const Empty = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// src/modules/scheduling/ui/components/BlackoutsEditor.tsx
"use client";
import styled, { css } from "styled-components";
import { IBlackoutRange } from "@/modules/scheduling/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/scheduling";

export default function BlackoutsEditor({
  skipDates,
  blackouts,
  onChange,
}: {
  skipDates?: string[];
  blackouts?: IBlackoutRange[];
  onChange: (next: { skipDates: string[]; blackouts: IBlackoutRange[] }) => void;
}) {
  const { t } = useI18nNamespace("scheduling", translations);

  const s = Array.isArray(skipDates) ? skipDates : [];
  const b = Array.isArray(blackouts) ? blackouts : [];

  /* ---- helpers ---- */
  const todayISO = () => new Date().toISOString().slice(0, 10);

  const toISODate = (v: any): string => {
    if (!v) return "";
    const s = String(v);
    return s.length > 10 ? s.slice(0, 10) : s;
  };

  const uniqSortSkips = (arr: string[]) =>
    Array.from(new Set(arr.filter(Boolean).map(toISODate))).sort();

  const normalizeBlackouts = (arr: IBlackoutRange[]) =>
    arr
      .map((r) => {
        const from = toISODate(r.from);
        let to = toISODate(r.to);
        if (from && to && to < from) to = from; // clamp
        return { from, to: to || undefined, reason: r.reason || undefined };
      })
      // from zorunlu; boş from’ları at
      .filter((r) => !!r.from);

  const push = (nextS: string[], nextB: IBlackoutRange[]) => {
    onChange({
      skipDates: uniqSortSkips(nextS),
      blackouts: normalizeBlackouts(nextB),
    });
  };

  /* ---- skip handlers ---- */
  const addSkip = () => push([...s, todayISO()], b);
  const remSkip = (i: number) => {
    const next = s.slice();
    next.splice(i, 1);
    push(next, b);
  };
  const updSkip = (i: number, val: string) => {
    const next = s.slice();
    next[i] = toISODate(val);
    push(next, b);
  };
  const clearSkips = () => push([], b);

  /* ---- blackout handlers ---- */
  const addB = () => push(s, [...b, { from: todayISO() }]);
  const remB = (i: number) => {
    const next = b.slice();
    next.splice(i, 1);
    push(s, next);
  };
  const updB = (i: number, patch: Partial<IBlackoutRange>) => {
    const next = b.slice();
    next[i] = { ...next[i], ...patch };
    push(s, next);
  };
  const clearB = () => push(s, []);

  return (
    <Wrap>
      {/* Skip Dates */}
      <Card as="fieldset" role="group" aria-label={t("blackouts.titleSkipDates", "Skip Dates (YYYY-MM-DD)")}>
        <Legend>{t("blackouts.titleSkipDates", "Skip Dates (YYYY-MM-DD)")}</Legend>

        <List>
          {uniqSortSkips(s).map((d, i) => (
            <Row key={`${d}-${i}`}>
              <Input
                type="date"
                value={toISODate(d)}
                onChange={(e) => updSkip(i, e.target.value)}
                aria-label={t("blackouts.skipDate", "Skip Date")}
              />
              <Small type="button" onClick={() => remSkip(i)} aria-label={t("blackouts.remove", "Remove")}>
                {t("blackouts.remove", "Remove")}
              </Small>
            </Row>
          ))}

          <Row>
            <Small type="button" onClick={addSkip} aria-label={t("blackouts.add", "Add")}>
              + {t("blackouts.add", "Add")}
            </Small>
            {s.length > 0 && (
              <Small type="button" onClick={clearSkips}>
                {t("blackouts.clearAll", "Clear All")}
              </Small>
            )}
          </Row>
        </List>
      </Card>

      {/* Blackout Ranges */}
      <Card as="fieldset" role="group" aria-label={t("blackouts.titleBlackouts", "Blackouts")}>
        <Legend>{t("blackouts.titleBlackouts", "Blackouts")}</Legend>
        <Hint>{t("blackouts.hintLocal", "Dates are interpreted in local time (YYYY-MM-DD).")}</Hint>

        <List>
          {b.map((r, i) => {
            const from = toISODate(r.from);
            const to = toISODate(r.to);
            const invalid = !!to && !!from && to < from;

            return (
              <Row key={i}>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => updB(i, { from: e.target.value })}
                  aria-label={t("blackouts.from", "From")}
                />
                <Input
                  type="date"
                  min={from || undefined}
                  value={to}
                  onChange={(e) => updB(i, { to: e.target.value || undefined })}
                  aria-label={t("blackouts.to", "To")}
                  aria-invalid={invalid || undefined}
                />
                <Reason
                  placeholder={t("blackouts.reasonPh", "Reason")}
                  value={r.reason || ""}
                  onChange={(e) => updB(i, { reason: e.target.value || undefined })}
                  aria-label={t("blackouts.reason", "Reason")}
                />
                <Small type="button" onClick={() => remB(i)} aria-label={t("blackouts.remove", "Remove")}>
                  {t("blackouts.remove", "Remove")}
                </Small>

                {invalid && (
                  <Error role="status" aria-live="polite">
                    {t("blackouts.errorRange", "End date cannot be before start date.")}
                  </Error>
                )}
              </Row>
            );
          })}

          <Row>
            <Small type="button" onClick={addB} aria-label={t("blackouts.add", "Add")}>
              + {t("blackouts.add", "Add")}
            </Small>
            {b.length > 0 && (
              <Small type="button" onClick={clearB}>
                {t("blackouts.clearAll", "Clear All")}
              </Small>
            )}
          </Row>
        </List>
      </Card>
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
  grid-template-columns: repeat(2, 1fr);
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
`;

const Legend = styled.legend`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 6px;
`;

const Hint = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 8px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  flex-wrap: wrap;
  align-items: center;
`;

const focusable = css`
  transition: border-color ${({ theme }) => theme.transition.fast}, box-shadow ${({ theme }) => theme.transition.fast};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Input = styled.input`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  ${focusable}
`;

const Reason = styled.input`
  flex: 1 1 220px;
  min-width: 160px;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  ${focusable}
`;

const Small = styled.button`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  transition: background ${({ theme }) => theme.transition.fast}, color ${({ theme }) => theme.transition.fast};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
`;

const Error = styled.div`
  width: 100%;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 12px;
  margin-top: 2px;
`;

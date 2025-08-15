"use client";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearTTMsgs, fetchTimeEntries, setSelectedTE } from "@/modules/timetracking/slice/timeEntrySlice";
import type { ITimeEntry } from "@/modules/timetracking/types";
import { TimeEntryList, TimeEntryForm, TimeEntryDetail, translations } from "@/modules/timetracking";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";

export default function TimeTrackingAdminPage() {
  const dispatch = useAppDispatch();
  const { list, selected, loading, error, success, meta } = useAppSelector((s) => s.timetracking);

  const { t } = useI18nNamespace("timetracking", translations);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ITimeEntry | null>(null);

  useEffect(() => { dispatch(fetchTimeEntries()); }, [dispatch]);

  useEffect(() => {
    if (success) toast.success(success);
    if (error) toast.error(error);
    if (success || error) dispatch(clearTTMsgs());
  }, [success, error, dispatch]);

  const visibleCount = useMemo(() => list.length, [list]);
  const totalCount = meta?.total ?? visibleCount;

  return (
    <Page role="region" aria-labelledby="tt-admin-title">
      <Head>
        <Title id="tt-admin-title">{t("admin.title")}</Title>

        <Right>
          <Counter title={t("admin.counter.title")}>
            <span className="label">{t("admin.counter.title")}</span>
            <span className="value">{totalCount}</span>
          </Counter>

          <Primary
            type="button"
            aria-label={t("admin.new")}
            onClick={() => { setEditing(null); setShowForm(true); }}
          >
            {t("admin.new")}
          </Primary>
        </Right>
      </Head>

      {showForm && (
        <Card aria-live="polite">
          <TimeEntryForm
            initial={editing || undefined}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); dispatch(fetchTimeEntries()); }}
          />
        </Card>
      )}

      <Section>
        <SectionHead>
          <SectionTitle>{t("admin.entriesTitle")}</SectionTitle>
          <SmallBtn
            type="button"
            onClick={() => dispatch(fetchTimeEntries())}
            disabled={loading}
            aria-busy={loading}
            aria-label={t("admin.refresh")}
            title={t("admin.refresh")}
          >
            {loading ? t("common.loading") : t("admin.refresh")}
          </SmallBtn>
        </SectionHead>

        <Card>
          <TimeEntryList
            items={list}
            loading={loading}
            meta={meta}
            onEdit={(t) => { setEditing(t); setShowForm(true); }}
          />
        </Card>

        {selected && (
          <Card>
            <TimeEntryDetail item={selected} onClose={() => dispatch(setSelectedTE(null))} />
          </Card>
        )}
      </Section>
    </Page>
  );
}

/* ---------------- styled ---------------- */

const Page = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;

const Head = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.title};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.h2};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.large};
  }
`;

const Right = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
  flex-wrap: wrap;
`;

const Counter = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.xs};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};

  .label {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
  }
  .value {
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
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
  gap: ${({ theme }) => theme.spacings.sm};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.h3};
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.text};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
`;

const buttonBase = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform var(--t-fast) ease, opacity var(--t-fast) ease, background var(--t-fast) ease, color var(--t-fast) ease;
  text-align: center;
  white-space: nowrap;
  user-select: none;
  outline: none;
  border: none;
  line-height: 1.2;
`;

const Primary = styled.button`
  ${buttonBase}
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

const SmallBtn = styled.button`
  ${buttonBase}
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 6px 10px;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;


"use client";
import styled from "styled-components";
import { useCallback, useMemo } from "react";
import type { IReportRun } from "@/modules/reports/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/reports";

export default function RunDetail({
  run,
  onClose,
}: { run?: IReportRun | null; onClose: () => void }) {
  const { t, i18n } = useI18nNamespace("reports", translations);

  const fmtDateTime = useCallback(
    (d: any) =>
      d
        ? new Intl.DateTimeFormat(i18n.language, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(d))
        : "–",
    [i18n.language]
  );

  const nf = useMemo(() => new Intl.NumberFormat(i18n.language), [i18n.language]);

  const files = useMemo(() => run?.files || [], [run]);
  const sample = useMemo(() => run?.previewSample || [], [run]);

  const formatBytes = useCallback(
    (bytes?: number) => {
      if (!bytes || bytes < 0) return "";
      const units = ["B", "KB", "MB", "GB", "TB"];
      let n = bytes;
      let i = 0;
      while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
      }
      return `${nf.format(Number(n.toFixed(1)))} ${units[i]}`;
    },
    [nf]
  );

  return (
    <Wrap>
      <Head>
        <div>
          <h3>
            {t("runDetail.title", "Run")} <code>{run?.code}</code>
          </h3>
          <Small>
            {t("runDetail.status", "Status")}: <b>{t(`runs.status.${run?.status}`, run?.status || "")}</b> —{" "}
            {t("runDetail.kind", "Kind")}: <b>{t(`kinds.${run?.kind}`, run?.kind || "")}</b>
          </Small>
        </div>
        <Close onClick={onClose} aria-label={t("actions.close", "Close")}>
          {t("actions.close", "Close")}
        </Close>
      </Head>

      <Grid>
        <Card>
          <Title>{t("runDetail.meta", "Meta")}</Title>
          <KV>
            <K>{t("runDetail.started", "Started")}</K>
            <V>{fmtDateTime(run?.startedAt)}</V>
          </KV>
          <KV>
            <K>{t("runDetail.finished", "Finished")}</K>
            <V>{fmtDateTime(run?.finishedAt)}</V>
          </KV>
          <KV>
            <K>{t("runDetail.duration", "Duration")}</K>
            <V>
              {typeof run?.durationMs === "number"
                ? t("runDetail.durationMs", "{{ms}} ms", { ms: nf.format(run.durationMs) })
                : "–"}
            </V>
          </KV>
          <KV>
            <K>{t("runDetail.rows", "Rows")}</K>
            <V>{run?.rowCount != null ? nf.format(run.rowCount) : "–"}</V>
          </KV>
          <KV>
            <K>{t("runDetail.bytes", "Bytes")}</K>
            <V>{run?.bytes != null ? `${nf.format(run.bytes)} (${formatBytes(run.bytes)})` : "–"}</V>
          </KV>
          {run?.error && <Err>{run.error}</Err>}
        </Card>

        <Card>
          <Title>{t("runDetail.files", "Files")}</Title>
          {files.length === 0 && <Empty>∅</Empty>}
          <FileList>
            {files.map((f, i) => (
              <a key={i} href={f.url} target="_blank" rel="noreferrer">
                {f.name || f.url} {f.size ? `(${formatBytes(f.size)})` : ""}
              </a>
            ))}
          </FileList>
        </Card>

        <Card style={{ gridColumn: "span 2" }}>
          <Title>{t("runDetail.filtersUsed", "Filters Used (JSON)")}</Title>
          <Pre>{pretty(run?.filtersUsed)}</Pre>
        </Card>

        <Card style={{ gridColumn: "span 2" }}>
          <Title>{t("runDetail.preview", "Preview Sample (first rows)")}</Title>
          <Pre>{pretty(sample)}</Pre>
        </Card>
      </Grid>
    </Wrap>
  );
}

function pretty(v: any) {
  try {
    return JSON.stringify(v ?? {}, null, 2);
  } catch {
    return String(v ?? "");
  }
}

/* styled */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;
const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const Small = styled.div`
  opacity: 0.7;
  font-size: 12px;
`;
const Close = styled.button`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
`;
const Grid = styled.div`
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
const Title = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
`;
const KV = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  padding: 4px 0;
`;
const K = styled.div`
  min-width: 120px;
  opacity: 0.7;
`;
const V = styled.div``;
const Err = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-top: 8px;
`;
const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  a {
    text-decoration: underline;
  }
`;
const Pre = styled.pre`
  max-height: 360px;
  overflow: auto;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
`;
const Empty = styled.div`
  opacity: 0.6;
`;

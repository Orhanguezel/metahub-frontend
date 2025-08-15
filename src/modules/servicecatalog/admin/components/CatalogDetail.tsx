"use client";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/servicecatalog";
import type { SupportedLocale } from "@/types/common";
import type { IServiceCatalog, TranslatedLabel } from "@/modules/servicecatalog/types";

/** Dinamik, hard-code’suz locale seçimi */
function firstLocaleValue(obj?: TranslatedLabel, preferred?: SupportedLocale) {
  if (!obj) return "";
  // 1) Tercih edilen dil varsa önce onu dene
  if (preferred) {
    const v = obj[preferred];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  // 2) Objede tanımlı ilk dolu dili döndür
  for (const k of Object.keys(obj) as (keyof TranslatedLabel)[]) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

export default function CatalogDetail({
  item,
  onClose,
}: {
  item?: IServiceCatalog | null;
  onClose: () => void;
}) {
  const { i18n, t } = useI18nNamespace("servicecatalog", translations);
  if (!item) return null;

  // Aktif dilin ilk 2 karakteri; type-safe index için SupportedLocale olarak daraltıyoruz
  const preferred = (i18n.language?.slice(0, 2) ?? undefined) as SupportedLocale | undefined;

  const title = firstLocaleValue(item.name, preferred);
  const desc  = firstLocaleValue(item.description, preferred);

  return (
    <Card>
      <Head>
        <div>
          <Title>
            {t("detail.service", "Service")} <Code>{item.code}</Code>
          </Title>
          <Small>
            {t("detail.active", "Active")}:{" "}
            <b>{item.isActive ? t("common.yes", "Yes") : t("common.no", "No")}</b>
            {" — "}
            {t("detail.team", "Team")}: <b>{item.defaultTeamSize}</b>
            {" — "}
            {t("detail.duration", "Duration")}: <b>{item.defaultDurationMin}</b> {t("detail.minutes", "min")}
          </Small>

          {title && <Name>{title}</Name>}
          {desc && <Desc>{desc}</Desc>}
        </div>

        <Btn type="button" onClick={onClose} aria-label={t("detail.close", "Close")}>
          {t("detail.close", "Close")}
        </Btn>
      </Head>

      {!!item.images?.length && (
        <Grid aria-label={t("detail.images", "Images")}>
          {item.images.map((img) => (
            <Img
              key={img.url}
              $bg={img.thumbnail || img.webp || img.url}
              role="img"
              aria-label={title || item.code}
              title={title || item.code}
            />
          ))}
        </Grid>
      )}

      <Pre aria-label={t("detail.raw", "Raw JSON")}>{JSON.stringify(item, null, 2)}</Pre>
    </Card>
  );
}

/* styled */
const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.md};
  box-shadow: ${({ theme }) => theme.cards.shadow};
`;

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacings.xs} 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.title};
`;

const Code = styled.code`
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.title};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 2px 6px;
  font-family: ${({ theme }) => theme.fonts.mono};
`;

const Small = styled.div`
  opacity: 0.85;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Name = styled.div`
  margin-top: ${({ theme }) => theme.spacings.sm};
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Desc = styled.p`
  margin: ${({ theme }) => theme.spacings.xs} 0 0;
  color: ${({ theme }) => theme.colors.textAlt};
`;

const Btn = styled.button`
  align-self: flex-start;
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
  &:focus-visible {
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    outline: none;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacings.sm};
  margin: ${({ theme }) => theme.spacings.sm} 0;
`;

const Img = styled.div<{ $bg: string }>`
  padding-top: 66%;
  background-image: ${({ $bg }) => `url(${$bg})`};
  background-size: cover;
  background-position: center;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
`;

const Pre = styled.pre`
  max-height: 420px;
  overflow: auto;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
`;

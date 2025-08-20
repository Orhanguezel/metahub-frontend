import styled from "styled-components";

/* ================ KAPSAYICILAR ================ */

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacings.xs};
  }
`;

export const ErrorBox = styled.div`
  padding: ${({ theme }) => theme.spacings.sm};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.dangerBg};
`;

/* ============== TABLO KAPSAYICI ==============
   - büyük ekranda kart + gölge
   - küçük ekranlarda sade
================================================ */

export const TableWrap = styled.div<{ $embedded?: boolean }>`
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;

  border-radius: ${({ theme, $embedded }) => ($embedded ? theme.radii.md : theme.radii.lg)};
  box-shadow: ${({ theme, $embedded }) => ($embedded ? "none" : theme.cards.shadow)};
  background: ${({ theme, $embedded }) =>
    $embedded ? "transparent" : theme.colors.cardBackground};
  border: ${({ theme, $embedded }) =>
    $embedded ? `${theme.borders.thin} ${theme.colors.borderBright}` : "none"};

  /* scrollbar (webkit) */
  &::-webkit-scrollbar { height: 10px; }
  &::-webkit-scrollbar-track { background: ${({ theme }) => theme.colors.inputBackgroundLight}; }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
  }

  ${({ theme }) => theme.media.mobile} {
    box-shadow: none;
    border: none;
    background: transparent;
    border-radius: 0;
  }
`;

/* ============== MASAÜSTÜ TABLO ==============
   - kolon genişlikleri sabit
   - sticky thead
   - **yalnızca ≥1441px’de görünür**
=============================================== */

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacings.md};
    text-align: left;
    white-space: nowrap;
  }

  thead th:first-child { border-top-left-radius: ${({ theme }) => theme.radii.lg}; }
  thead th:last-child  { border-top-right-radius: ${({ theme }) => theme.radii.lg}; }

  tbody tr:nth-child(even) td {
    background: ${({ theme }) => theme.colors.inputBackgroundSofter};
  }

  td {
    padding: ${({ theme }) => theme.spacings.md};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    vertical-align: top;

    /* Varsayılan: kelime içinde kırma YOK (oda id’leri vs. bozulmasın) */
    word-break: normal;
    overflow-wrap: break-word;
    white-space: normal;
  }

  /* Kolon genişlikleri – mesaj (4.) kalan alanı alır */
  thead th:nth-child(1),
  tbody td:nth-child(1) { width: 42px;  text-align: center; }
  thead th:nth-child(2),
  tbody td:nth-child(2) { width: 172px; }   /* zaman */
  thead th:nth-child(3),
  tbody td:nth-child(3) { width: 220px; }   /* gönderen */
  thead th:nth-child(5),
  tbody td:nth-child(5) { width: 180px; }   /* bayraklar */
  thead th:nth-child(6),
  tbody td:nth-child(6) { width: 120px; text-align: right; } /* işlemler */

  /* Yardımcı sınıflar */
  td.mono { font-family: ${({ theme }) => theme.fonts.mono}; }
  td.actions { text-align: right; }
  .nowrap { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .clip { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .scrollx { display:block; max-width:100%; overflow-x:auto; white-space:nowrap; }
  .center { text-align: center; }
  .wrap { white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; }

  tbody tr:hover td { background: ${({ theme }) => theme.colors.hoverBackground}; }

  /* ≤1440px: tabloyu gizle (kart görünüm devreye girer) */
  ${({ theme }) => theme.media.large} {
    display: none;
  }
`;

/* ============== AKSİYON BUTONLARI ============== */

export const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  justify-content: flex-end;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.mobile} {
    justify-content: stretch;
    & > * { flex: 1 1 auto; }
  }
`;

export const Primary = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
  &:disabled { opacity: .6; cursor: not-allowed; }
`;

export const Secondary = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  transition: ${({ theme }) => theme.transition.fast};

  &:hover { background: ${({ theme }) => theme.buttons.secondary.backgroundHover}; }
  &:disabled { opacity: .6; cursor: not-allowed; }
`;

export const Danger = styled(Secondary)`
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};

  &:hover {
    background: ${({ theme }) => theme.colors.dangerHover};
    color: ${({ theme }) => theme.colors.textOnDanger};
    border-color: ${({ theme }) => theme.colors.dangerHover};
  }
`;

/* ============== ROZET & EMPTY ============== */

export const Badge = styled.span<{ $on: boolean }>`
  display: inline-block;
  padding: .2em .6em;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $on, theme }) => ($on ? theme.colors.successBg : theme.colors.inputBackgroundLight)};
  color: ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.textSecondary)};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  line-height: 1.4;
`;

export const Empty = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => theme.spacings.md};
  font-style: italic;

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSizes.xsmall};
    padding: ${({ theme }) => theme.spacings.sm};
  }
`;

/* ============== MOBİL KART (genel amaçlı) ==============
   - masaüstünde gizli
========================================================= */

export const MobileList = styled.div`
  display: none;
  ${({ theme }) => theme.media.mobile} {
    display: grid;
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

export const MobileCard = styled.div`
  background: ${({ theme }) => theme.colors.sectionBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.md};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

export const MobileCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

export const MobileRow = styled.div`
  display: grid;
  grid-template-columns: clamp(90px, 32%, 140px) 1fr;
  gap: ${({ theme }) => theme.spacings.sm};
  padding: 6px 0;

  &:not(:last-child) {
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  }
`;

export const MobileLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

export const MobileValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  word-break: break-word;
  overflow-wrap: anywhere;
  &.nowrap { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

export const MobileActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacings.sm};
  & > button { flex: 1 1 auto; }
`;

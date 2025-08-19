import styled from "styled-components";

/* styled */
export const Wrap = styled.div`
  display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};
`;
export const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
`;
export const ErrorBox = styled.div`
  padding:${({theme})=>theme.spacings.sm};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.danger};
  color:${({theme})=>theme.colors.danger};
  border-radius:${({theme})=>theme.radii.md};
`;

/**
 * $embedded=true → kart içinde kart görünümünü kaldır:
 * - box-shadow: none
 * - background: transparent
 * - hafif border ile tabloyu ana karttan ayır
 */
export const TableWrap = styled.div<{ $embedded?: boolean }>`
  width:100%;
  overflow-x:auto;
  border-radius:${({theme,$embedded})=>$embedded? theme.radii.md : theme.radii.lg};
  box-shadow:${({theme,$embedded})=>$embedded? "none" : theme.cards.shadow};
  background:${({theme,$embedded})=>$embedded? "transparent" : theme.colors.cardBackground};
  border:${({theme,$embedded})=>$embedded? `${theme.borders.thin} ${theme.colors.borderBright}` : "none"};
`;

export const Table = styled.table`
  width:100%; border-collapse:collapse;
  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};
    font-size:${({theme})=>theme.fontSizes.sm};
    padding:${({theme})=>theme.spacings.md};
    text-align:left; white-space:nowrap;
  }
  td{
    padding:${({theme})=>theme.spacings.md};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    font-size:${({theme})=>theme.fontSizes.sm};
    vertical-align:middle;
  }
  td.mono{font-family:${({theme})=>theme.fonts.mono};}
  td.actions{text-align:right;}
  tbody tr:hover td{background:${({theme})=>theme.colors.hoverBackground};}
`;

export const Row = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.xs}; justify-content:flex-end;
`;
export const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
export const Secondary = styled.button`
  padding:8px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;
export const Danger = styled(Secondary)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{
    background:${({theme})=>theme.colors.dangerHover};
    color:${({theme})=>theme.colors.textOnDanger};
    border-color:${({theme})=>theme.colors.dangerHover};
  }
`;
export const Badge = styled.span<{ $on:boolean }>`
  display:inline-block; padding:.2em .6em; border-radius:${({theme})=>theme.radii.pill};
  background:${({$on,theme})=>$on?theme.colors.successBg:theme.colors.inputBackgroundLight};
  color:${({$on,theme})=>$on?theme.colors.success:theme.colors.textSecondary};
`;
export const Empty = styled.div`
  text-align:center; color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.sm}; padding:${({theme})=>theme.spacings.md};
  font-style:italic;
  ${({theme})=>theme.media.mobile}{font-size:${({theme})=>theme.fontSizes.xsmall};}
`;

import styled from "styled-components";

/* shared form styles */
export const Form = styled.form`display:flex;flex-direction:column;gap:${({ theme }) => theme.spacings.md};`;
export const Row = styled.div`
  display:grid;grid-template-columns:repeat(4,1fr);gap:${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({ theme }) => theme.media.mobile}{grid-template-columns:1fr;}
`;
export const TopBar = styled.div`display:flex;gap:${({ theme }) => theme.spacings.md};align-items:flex-start;flex-wrap:wrap;`;
export const LangGroup = styled.div`display:flex;gap:6px;flex-wrap:wrap;align-items:center;`;
export const LangBtn = styled.button<{ $active?: boolean }>`
  padding:6px 10px;border-radius:${({ theme }) => theme.radii.pill};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ $active, theme }) => $active ? theme.colors.primaryLight : theme.colors.cardBackground};
  color:${({ theme }) => theme.colors.text};cursor:pointer;font-size:12px;
`;
export const SEOBox = styled.div`
  flex:1;min-width:260px;background:${({ theme }) => theme.colors.cardBackground};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius:${({ theme }) => theme.radii.lg};padding:10px 12px;
  .row1{font-size:12px;color:${({ theme }) => theme.colors.textSecondary};display:flex;gap:8px;flex-wrap:wrap}
  .host{font-weight:${({ theme }) => theme.fontWeights.medium};}
  .path{font-family:${({ theme }) => theme.fonts.mono};opacity:.9}
  .row2{margin-top:4px;font-weight:${({ theme }) => theme.fontWeights.semiBold};}
  .row3{font-size:13px;color:${({ theme }) => theme.colors.textSecondary};margin-top:2px}
`;
export const Col = styled.div`display:flex;flex-direction:column;gap:${({ theme }) => theme.spacings.xs};min-width:0;`;
export const BlockTitle = styled.h3`font-size:${({ theme }) => theme.fontSizes.md};margin:${({ theme }) => theme.spacings.sm} 0;`;
export const Label = styled.label`font-size:${({ theme }) => theme.fontSizes.xsmall};color:${({ theme }) => theme.colors.textSecondary};`;
export const Input = styled.input`
  padding:10px 12px;border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background:${({ theme }) => theme.inputs.background};color:${({ theme }) => theme.inputs.text};
  min-width:0;
`;
export const TextArea = styled.textarea`
  padding:10px 12px;border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background:${({ theme }) => theme.inputs.background};color:${({ theme }) => theme.inputs.text};
`;
export const CheckRow = styled.label`display:flex;gap:${({ theme }) => theme.spacings.xs};align-items:center;`;
export const Select = styled.select`
  padding:10px 12px;border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background:${({ theme }) => theme.inputs.background};color:${({ theme }) => theme.inputs.text};
`;
export const SmallRow = styled.div`margin-top:6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;`;
export const Small = styled.button`
  background:${({ theme }) => theme.buttons.secondary.background};
  color:${({ theme }) => theme.buttons.secondary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding:6px 10px;border-radius:${({ theme }) => theme.radii.pill};cursor:pointer;font-size:12px;
`;
export const Chips = styled.div`display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;`;
export const Chip = styled.button<{ $on?: boolean }>`
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ $on, theme }) => $on ? theme.colors.primaryLight : theme.colors.cardBackground};
  color:${({ theme }) => theme.colors.text};border-radius:999px;padding:6px 10px;cursor:pointer;font-size:12px;
`;
export const ModeRow = styled.div`display:flex;gap:${({ theme }) => theme.spacings.xs};align-items:center;margin-top:-6px;`;
export const ModeBtn = styled.button<{ $active?: boolean }>`
  padding:8px 10px;border-radius:${({ theme }) => theme.radii.pill};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ $active, theme }) => $active ? theme.colors.primaryLight : theme.colors.cardBackground};
  color:${({ theme }) => theme.colors.text};
  cursor:pointer;
`;
export const Actions = styled.div`display:flex;gap:${({ theme }) => theme.spacings.sm};justify-content:flex-end;`;
export const Primary = styled.button`
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding:8px 14px;border-radius:${({ theme }) => theme.radii.md};cursor:pointer;
`;
export const Secondary = styled.button`
  background:${({ theme }) => theme.buttons.secondary.background};
  color:${({ theme }) => theme.buttons.secondary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding:8px 14px;border-radius:${({ theme }) => theme.radii.md};cursor:pointer;
`;

/* AI panel styles */
export const AiCard = styled.div`
  background:${({ theme }) => theme.colors.cardBackground};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius:${({ theme }) => theme.radii.lg};
  margin-bottom:${({ theme }) => theme.spacings.md};
`;
export const AiHead = styled.button`
  width:100%;display:flex;align-items:center;justify-content:space-between;
  padding:10px 12px;border:0;background:transparent;cursor:pointer;
  border-bottom:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
`;
export const AiGrid = styled.div`
  padding:12px;display:grid;gap:12px;grid-template-columns:repeat(4,1fr);
  &[data-compact="1"]{grid-template-columns:repeat(4,1fr);}
  > div[data-full]{grid-column:1 / -1}
  ${({ theme }) => theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({ theme }) => theme.media.mobile}{grid-template-columns:1fr;}
`;
export const AiChecks = styled.div`
  display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:20px;
  grid-column:1 / -1;
  label{font-size:13px;color:${({ theme }) => theme.colors.textSecondary}}
`;
export const AiFoot = styled.div`grid-column:1 / -1;display:flex;align-items:center;justify-content:space-between;margin-top:4px;`;
export const Toggle = styled.div`display:flex;gap:10px;align-items:center;label{font-size:13px}`;
export const Note = styled.div`
  grid-column:1 / -1;font-size:13px;margin-top:4px;
  &.ok{color:#16a34a}
  &.err{color:#dc2626}
`;

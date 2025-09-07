import styled from "styled-components";

/* ========= Form genel (RecipesForm) ========= *

/* ========= Form genel (RecipesForm) ========= */
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
  background:${({ $active, theme }) => ($active ? theme.colors.primaryLight : theme.colors.cardBackground)};
  color:${({ theme }) => theme.colors.text};cursor:pointer;font-size:${({ theme }) => theme.fontSizes.xsmall};
  transition:background ${({ theme }) => theme.transition.fast};
  &:hover{ background:${({ theme, $active }) => ($active ? theme.colors.primaryLight : theme.cards.hoverBackground)}; }
`;

export const SEOBox = styled.div`
  flex:1;min-width:260px;background:${({ theme }) => theme.colors.cardBackground};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius:${({ theme }) => theme.radii.lg};padding:10px 12px;box-shadow:${({ theme }) => theme.shadows.sm};
  .row1{font-size:${({ theme }) => theme.fontSizes.xsmall};color:${({ theme }) => theme.colors.textSecondary};display:flex;gap:8px;flex-wrap:wrap;}
  .host{font-weight:${({ theme }) => theme.fontWeights.medium};}
  .path{font-family:${({ theme }) => theme.fonts.mono};opacity:.9;}
  .row2{margin-top:4px;font-weight:${({ theme }) => theme.fontWeights.semiBold};}
  .row3{font-size:${({ theme }) => theme.fontSizes.xsmall};color:${({ theme }) => theme.colors.textSecondary};margin-top:2px;}
`;

export const Col = styled.div`display:flex;flex-direction:column;gap:${({ theme }) => theme.spacings.xs};min-width:0;`;
export const BlockTitle = styled.h3`font-size:${({ theme }) => theme.fontSizes.md};margin:${({ theme }) => theme.spacings.sm} 0;color:${({ theme }) => theme.colors.title};`;
export const Label = styled.label`font-size:${({ theme }) => theme.fontSizes.xsmall};color:${({ theme }) => theme.colors.textSecondary};`;

export const Input = styled.input`
  padding:10px 12px;border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background:${({ theme }) => theme.inputs.background};color:${({ theme }) => theme.inputs.text};
  min-width:0;outline:none;transition:border-color ${({ theme }) => theme.transition.fast};
  &:focus{ border-color:${({ theme }) => theme.colors.inputBorderFocus}; box-shadow:${({ theme }) => theme.colors.shadowHighlight}; }
`;

export const TextArea = styled.textarea`
  padding:10px 12px;border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background:${({ theme }) => theme.inputs.background};color:${({ theme }) => theme.inputs.text};
  outline:none;resize:vertical;transition:border-color ${({ theme }) => theme.transition.fast};
  &:focus{ border-color:${({ theme }) => theme.colors.inputBorderFocus}; box-shadow:${({ theme }) => theme.colors.shadowHighlight}; }
`;

export const CheckRow = styled.label`
  display:flex;gap:${({ theme }) => theme.spacings.xs};align-items:center;
  font-size:${({ theme }) => theme.fontSizes.xsmall};color:${({ theme }) => theme.colors.textSecondary};
`;

export const Select = styled.select`
  appearance:none;padding:10px 12px;border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background:${({ theme }) => theme.inputs.background};color:${({ theme }) => theme.inputs.text};
  min-width:0;outline:none;transition:border-color ${({ theme }) => theme.transition.fast};
  &:focus{ border-color:${({ theme }) => theme.colors.inputBorderFocus}; box-shadow:${({ theme }) => theme.colors.shadowHighlight}; }
`;

export const SmallRow = styled.div`
  margin-top:6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;
  small{font-size:${({ theme }) => theme.fontSizes.xsmall};color:${({ theme }) => theme.colors.textSecondary};}
`;

export const Small = styled.button`
  background:${({ theme }) => theme.buttons.secondary.background};
  color:${({ theme }) => theme.buttons.secondary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding:6px 10px;border-radius:${({ theme }) => theme.radii.pill};cursor:pointer;
  font-size:${({ theme }) => theme.fontSizes.xsmall};
  transition:background ${({ theme }) => theme.transition.fast};
  &:hover{ background:${({ theme }) => theme.buttons.secondary.backgroundHover}; }
`;

export const Chips = styled.div`display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;`;
export const Chip = styled.button<{ $on?: boolean }>`
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ $on, theme }) => ($on ? theme.colors.primaryLight : theme.colors.cardBackground)};
  color:${({ theme }) => theme.colors.text};
  border-radius:999px;padding:6px 10px;cursor:pointer;font-size:${({ theme }) => theme.fontSizes.xsmall};
  transition:background ${({ theme }) => theme.transition.fast};
  &:hover{ background:${({ theme, $on }) => ($on ? theme.colors.primaryLight : theme.cards.hoverBackground)}; }
`;

export const ModeRow = styled.div`display:flex;gap:${({ theme }) => theme.spacings.xs};align-items:center;margin-top:-6px;`;
export const ModeBtn = styled.button<{ $active?: boolean }>`
  padding:8px 10px;border-radius:${({ theme }) => theme.radii.pill};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ $active, theme }) => ($active ? theme.colors.primaryLight : theme.colors.cardBackground)};
  color:${({ theme }) => theme.colors.text};cursor:pointer;font-size:${({ theme }) => theme.fontSizes.xsmall};
  transition:background ${({ theme }) => theme.transition.fast};
  &:hover{ background:${({ theme, $active }) => ($active ? theme.colors.primaryLight : theme.cards.hoverBackground)}; }
`;

export const Actions = styled.div`display:flex;gap:${({ theme }) => theme.spacings.sm};justify-content:flex-end;`;
export const Primary = styled.button`
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding:8px 14px;border-radius:${({ theme }) => theme.radii.md};cursor:pointer;
  font-weight:${({ theme }) => theme.fontWeights.medium};box-shadow:${({ theme }) => theme.shadows.button};
  transition:background ${({ theme }) => theme.transition.fast}, transform ${({ theme }) => theme.transition.fast};
  &:hover{ background:${({ theme }) => theme.buttons.primary.backgroundHover}; transform: translateY(-1px); }
  &:disabled{ opacity:${({ theme }) => theme.opacity.disabled}; cursor:not-allowed; transform:none; }
`;

export const Secondary = styled.button`
  background:${({ theme }) => theme.buttons.secondary.background};
  color:${({ theme }) => theme.buttons.secondary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding:8px 14px;border-radius:${({ theme }) => theme.radii.md};cursor:pointer;
  transition:background ${({ theme }) => theme.transition.fast};
  &:hover{ background:${({ theme }) => theme.buttons.secondary.backgroundHover}; }
`;

/* ========= Ortak “chip input” ========= */
export const TagRow = styled.div`
  display:flex;flex-wrap:wrap;gap:8px;padding:6px;border-radius:${({ theme }) => theme.radii.md};
  background:${({ theme }) => theme.colors.inputBackgroundLight};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
`;
export const TagChip = styled.button`
  display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:${({ theme }) => theme.radii.pill};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ theme }) => theme.colors.primaryLight};
  color:${({ theme }) => theme.colors.text};font-size:${({ theme }) => theme.fontSizes.xsmall};
  cursor:pointer;transition:background ${({ theme }) => theme.transition.fast};
  &:hover{ background:${({ theme }) => theme.cards.hoverBackground}; }
  &[data-variant="danger"]{ background:${({ theme }) => theme.colors.dangerBg}; }
`;
export const TagInputBox = styled.input`
  flex:1;min-width:160px;border:0;outline:none;background:transparent;padding:6px 4px;
  font-size:${({ theme }) => theme.fontSizes.small};color:${({ theme }) => theme.colors.text};
  &::placeholder{ color:${({ theme }) => theme.colors.placeholder}; }
`;

export const Help = styled.div`margin-top:4px;font-size:${({ theme }) => theme.fontSizes.xsmall};color:${({ theme }) => theme.colors.textSecondary};`;
export const PromptChips = styled.div`display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;`;
export const PromptChip = styled.button`
  padding:6px 10px;border-radius:${({ theme }) => theme.radii.pill};
  background:${({ theme }) => theme.colors.secondaryTransparent};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor:pointer;font-size:${({ theme }) => theme.fontSizes.xsmall};
  transition:background ${({ theme }) => theme.transition.fast};
  &:hover{ background:${({ theme }) => theme.colors.secondaryLight}; }
`;
export const Divider = styled.hr`grid-column:1 / -1;border:none;height:1px;background:${({ theme }) => theme.colors.borderBright};margin:4px 0;`;

export const Field = styled.div`display:flex;flex-direction:column;gap:${({ theme }) => theme.spacings.xs};min-width:0;`;
export const FieldWide = styled(Field)`grid-column:1 / -1;`;
export const SectionTitle = styled.h4`grid-column:1 / -1;margin:${({ theme }) => theme.spacings.sm} 0 0;font-size:${({ theme }) => theme.fontSizes.md};color:${({ theme }) => theme.colors.title};`;

export const AiCard = styled.div`
  background:${({ theme }) => theme.colors.cardBackground};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius:${({ theme }) => theme.radii.lg};
  box-shadow:${({ theme }) => theme.shadows.form};
  margin-bottom:${({ theme }) => theme.spacings.md};
`;
export const AiHead = styled.button`
  width:100%;display:flex;align-items:center;justify-content:space-between;
  padding:12px 14px;border:0;background:transparent;cursor:pointer;
  border-bottom:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  font-weight:${({ theme }) => theme.fontWeights.semiBold};font-size:${({ theme }) => theme.fontSizes.md};
`;
export const AiGrid = styled.div`
  padding:12px;display:grid;gap:12px;grid-template-columns:repeat(4,1fr);
  > div[data-full]{ grid-column:1 / -1; }
  ${({ theme }) => theme.media.tablet}{ grid-template-columns:repeat(2,1fr); }
  ${({ theme }) => theme.media.mobile}{ grid-template-columns:1fr; }
`;
export const AiChecks = styled.div`
  display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:8px;grid-column:1 / -1;
  label{ font-size:${({ theme }) => theme.fontSizes.xsmall}; color:${({ theme }) => theme.colors.textSecondary}; }
`;
export const AiFoot = styled.div`grid-column:1 / -1;display:flex;align-items:center;justify-content:space-between;margin-top:4px;`;
export const Toggle = styled.div`display:flex;gap:12px;align-items:center;label{ font-size:${({ theme }) => theme.fontSizes.xsmall}; }`;
export const Note = styled.div`
  grid-column:1 / -1;font-size:${({ theme }) => theme.fontSizes.xsmall};margin-top:6px;
  &.ok{ color:${({ theme }) => theme.colors.success}; }
  &.err{ color:${({ theme }) => theme.colors.danger}; }
`;

/* ===== Basit modal (tema uyumlu) ===== */
export const Backdrop = styled.div`
  position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:${({ theme }) => theme.zIndex.modal};
`;
export const Modal = styled.div`
  width:min(980px,96vw);max-height:90vh;background:${({ theme }) => theme.colors.cardBackground};
  color:${({ theme }) => theme.colors.text};border-radius:${({ theme }) => theme.radii.lg};
  box-shadow:${({ theme }) => theme.cards.shadow};display:grid;grid-template-rows:auto 1fr;overflow:hidden;
`;
export const ModalHead = styled.div`
  display:flex;align-items:center;justify-content:space-between;padding:12px 14px;
  border-bottom:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  button{font-size:20px;line-height:1;background:transparent;border:0;cursor:pointer;color:inherit;padding:4px 8px;}
`;
export const ModalBody = styled.div`padding:10px 12px;overflow:auto;`;







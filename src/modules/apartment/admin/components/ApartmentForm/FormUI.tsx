"use client";
import styled from "styled-components";

export const Form = styled.form`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};`;
export const Row = styled.div`display:flex; flex-direction:column; gap:.5rem;`;
export const RowGrid = styled.div`display:grid; gap:${({theme})=>theme.spacings.sm}; grid-template-columns:repeat(auto-fit,minmax(180px,1fr));`;

export const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall}; color:${({theme})=>theme.colors.textSecondary};`;
export const Hint = styled.div`font-size:${({theme})=>theme.fontSizes.xsmall}; color:${({theme})=>theme.colors.textSecondary};`;
export const Info = styled.div`font-size:${({theme})=>theme.fontSizes.xsmall}; color:${({theme})=>theme.colors.textSecondary}; margin-top:.25rem;`;
export const Req = styled.span`color:${({theme})=>theme.colors.danger};`;

export const Small = styled.small`display:block; margin-top:.35rem; color:${({theme})=>theme.colors.textSecondary};`;
export const SmallRow = styled.div`display:flex; align-items:center; gap:.5rem; margin-top:.35rem;`;

export const Input = styled.input`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
  &::placeholder{ color:${({theme})=>theme.colors.placeholder}; }
  &:focus{ outline:none; border-color:${({theme})=>theme.inputs.borderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
`;
export const Select = styled.select`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
  &:focus{ outline:none; border-color:${({theme})=>theme.inputs.borderFocus}; box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
`;
export const Textarea = styled.textarea`
  min-height:96px; padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;

export const Card = styled.div`background:${({theme})=>theme.colors.cardBackground}; border-radius:${({theme})=>theme.radii.lg}; padding:${({theme})=>theme.spacings.md}; box-shadow:${({theme})=>theme.cards.shadow};`;
export const Sub = styled.div`font-weight:${({theme})=>theme.fontWeights.semiBold}; margin-bottom:${({theme})=>theme.spacings.xs}; color:${({theme})=>theme.colors.textAlt};`;
export const Check = styled.div`display:flex; align-items:center; gap:.5rem;`;

export const Actions = styled.div`display:flex; gap:${({theme})=>theme.spacings.sm}; justify-content:flex-end;`;
export const BaseBtn = styled.button`padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer; border:${({theme})=>theme.borders.thin} transparent;`;
export const Primary = styled(BaseBtn)`background:${({theme})=>theme.buttons.primary.background}; color:${({theme})=>theme.buttons.primary.text};`;
export const Secondary = styled(BaseBtn)`background:${({theme})=>theme.buttons.secondary.background}; color:${({theme})=>theme.buttons.secondary.text};`;
export const Danger = styled(BaseBtn)`background:${({theme})=>theme.colors.dangerBg}; color:${({theme})=>theme.colors.danger};`;

export const Segmented = styled.div`display:inline-flex; padding:2px; background:${({theme})=>theme.colors.backgroundAlt}; border:1px solid ${({theme})=>theme.colors.border}; border-radius:${({theme})=>theme.radii.xl}; gap:2px;`;
export const SegBtn = styled.button`
  padding:8px 12px; border-radius:${({theme})=>theme.radii.xl};
  border:none; cursor:pointer; background:transparent; color:${({theme})=>theme.colors.textSecondary};
  transition: background .15s ease, color .15s ease, transform .08s ease;
  &[data-active="true"]{ background:${({theme})=>theme.colors.cardBackground}; color:${({theme})=>theme.colors.text}; box-shadow:${({theme})=>theme.shadows.sm}; }
  &:hover{ background:${({theme})=>theme.colors.hoverBackground}; }
`;

export const Bindings = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.sm};`;
export const BindingsHead = styled.div`display:flex; align-items:center; justify-content:space-between;`;
export const BindingRow = styled.div`display:grid; gap:${({theme})=>theme.spacings.xs}; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); align-items:end;`;
export const Empty = styled.div`padding:${({theme})=>theme.spacings.sm}; color:${({theme})=>theme.colors.textSecondary}; text-align:center;`;

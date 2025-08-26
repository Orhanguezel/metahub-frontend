"use client";
import styled from "styled-components";

export const Form = styled.form`
  display: flex; flex-direction: column; gap: ${({theme})=>theme.spacings.md};
`;

export const Row = styled.div`
  display:grid; grid-template-columns:repeat(4,1fr); gap:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{ grid-template-columns:repeat(2,1fr); }
  ${({theme})=>theme.media.mobile}{ grid-template-columns:1fr; }
`;
export const Col = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.xs}; min-width:0;`;

export const BlockTitle = styled.h3`
  font-size:${({theme})=>theme.fontSizes.md}; margin:${({theme})=>theme.spacings.sm} 0;
`;
export const SubTitle = styled.h4`
  font-size:${({theme})=>theme.fontSizes.sm}; margin:${({theme})=>theme.spacings.xs} 0;
`;

export const VarCard = styled.div`
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.md};
  padding:${({theme})=>theme.spacings.sm};
  margin-bottom:${({theme})=>theme.spacings.sm};
  background:${({theme})=>theme.colors.cardBackground};
`;

export const Label = styled.label`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
`;
export const Input = styled.input`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
  min-width:0;
`;
export const Select = styled.select`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;
export const TextArea = styled.textarea`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;

export const CheckRow = styled.label`display:flex; gap:${({theme})=>theme.spacings.xs}; align-items:center;`;

export const ModeRow = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs}; align-items:center; margin:-4px 0 4px;`;
export const ModeBtn = styled.button<{ $active?: boolean }>`
  padding:8px 10px; border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({$active,theme})=>$active?theme.colors.primaryLight:theme.colors.cardBackground};
  color:${({theme})=>theme.colors.text}; cursor:pointer;
`;

export const HelpText = styled.p`
  margin:0; color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;

export const Actions = styled.div`display:flex; gap:${({theme})=>theme.spacings.sm}; justify-content:flex-end;`;
export const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
export const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
export const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
export const AddBtn = styled(SmallBtn)`margin:6px 0;`;

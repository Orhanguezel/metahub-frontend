"use client";
import styled from "styled-components";

export default function DateTimeInput({
  value,
  onChange,
  type = "datetime-local",
  placeholder,
  ariaLabel,
}: {
  value?: string | number;
  onChange: (v: string) => void;
  type?: "date" | "datetime-local";
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <Input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
    />
  );
}

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  transition: box-shadow ${({ theme }) => theme.durations.fast},
    border-color ${({ theme }) => theme.durations.fast};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

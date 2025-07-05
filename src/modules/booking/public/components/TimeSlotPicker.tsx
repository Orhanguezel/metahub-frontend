// components/booking/TimeSlotPicker.tsx
"use client";

import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface Props {
  availableSlots: string[];
  bookedSlots: string[];
  value: string;
  onChange: (v: string) => void;
}

export default function TimeSlotPicker({
  availableSlots,
  bookedSlots,
  value,
  onChange,
}: Props) {
  const { t } = useTranslation("booking");

  return (
    <Select
      name="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{t("form.selectTime", "Please select a time")}</option>
      {availableSlots.map((slot) => (
        <option key={slot} value={slot} disabled={bookedSlots.includes(slot)}>
          {slot}{" "}
          {bookedSlots.includes(slot)
            ? "— " + t("form.fullyBooked", "Fully Booked")
            : ""}
        </option>
      ))}
    </Select>
  );
}

const Select = styled.select`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.inputs.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.sm};
  width: 100%;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

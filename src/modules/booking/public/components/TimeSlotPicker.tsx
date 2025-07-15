"use client";

import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/booking";

interface Props {
  availableSlots?: string[]; // opsiyonel yaptık
  bookedSlots?: string[];    // opsiyonel yaptık
  value: string;
  onChange: (v: string) => void;
}

export default function TimeSlotPicker({
  availableSlots = [],
  bookedSlots = [],
  value,
  onChange,
}: Props) {
  const { t } = useI18nNamespace("booking", translations);

  // UX: Eğer hiç slot yoksa, dropdown'u disable yap
  const isDisabled = availableSlots.length === 0;

  return (
    <Select
      name="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      <option value="">
        {isDisabled
          ? t("form.noAvailableTimes", "No available times")
          : t("form.selectTime", "Please select a time")}
      </option>
      {availableSlots.map((slot) => {
        const isBooked = bookedSlots.includes(slot);
        return (
          <option
            key={slot}
            value={slot}
            disabled={isBooked && value !== slot} // Seçili olan disable olamaz
          >
            {slot}
            {isBooked
              ? " — " + t("form.fullyBooked", "Fully Booked")
              : ""}
          </option>
        );
      })}
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
  transition: border ${({ theme }) => theme.transition.normal};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

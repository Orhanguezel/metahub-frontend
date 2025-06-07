"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { updateSlotRule } from "@/modules/booking/slice/bookingSlotSlice";
import { toast } from "react-toastify";

// Haftanın günleri
const weekDays = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

interface SlotRule {
  _id: string;
  dayOfWeek?: number;
  appliesToAll?: boolean;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  breakBetweenAppointments: number;
}

interface Props {
  rule: SlotRule;
  onClose: () => void;
}

export default function SlotRuleModal({ rule, onClose }: Props) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<Omit<SlotRule, "_id">>({
    dayOfWeek: rule.dayOfWeek ?? 1,
    appliesToAll: rule.appliesToAll ?? false,
    startTime: rule.startTime || "09:00",
    endTime: rule.endTime || "23:00",
    intervalMinutes: rule.intervalMinutes || 60,
    breakBetweenAppointments: rule.breakBetweenAppointments || 15,
  });

  useEffect(() => {
    setForm({
      dayOfWeek: rule.dayOfWeek ?? 1,
      appliesToAll: rule.appliesToAll ?? false,
      startTime: rule.startTime,
      endTime: rule.endTime,
      intervalMinutes: rule.intervalMinutes,
      breakBetweenAppointments: rule.breakBetweenAppointments,
    });
  }, [rule]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => {
      if (name === "appliesToAll") {

        return {
          ...prev,
          appliesToAll: checked,
        };
      }
      if (type === "number") {
        return { ...prev, [name]: +value };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async () => {
    try {
      await dispatch(updateSlotRule({ id: rule._id, data: form })).unwrap();
      toast.success("Rule updated successfully.");
      onClose();
    } catch {
      toast.error("Failed to update rule.");
    }
  };

  return (
    <Overlay>
      <Modal>
        <ModalTitle>
          {form.appliesToAll ? "Edit General Slot Rule" : "Edit Slot Rule"}
        </ModalTitle>
        <Fields>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              name="appliesToAll"
              checked={!!form.appliesToAll}
              onChange={handleChange}
            />
            Apply to all days
          </CheckboxLabel>
          {!form.appliesToAll && (
            <Label>
              Day of Week
              <Select
                name="dayOfWeek"
                value={form.dayOfWeek}
                onChange={handleChange}
                disabled={!!form.appliesToAll}
              >
                {weekDays.map((d, i) => (
                  <option value={i} key={i}>{d}</option>
                ))}
              </Select>
            </Label>
          )}
          <Label>
            Start Time
            <Input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
            />
          </Label>
          <Label>
            End Time
            <Input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
            />
          </Label>
          <Label>
            Interval Minutes
            <Input
              type="number"
              name="intervalMinutes"
              min={1}
              value={form.intervalMinutes}
              onChange={handleChange}
            />
          </Label>
          <Label>
            Break Between Appointments
            <Input
              type="number"
              name="breakBetweenAppointments"
              min={0}
              value={form.breakBetweenAppointments}
              onChange={handleChange}
            />
          </Label>
        </Fields>
        <ButtonGroup>
          <PrimaryButton type="button" onClick={handleSubmit}>
            Update
          </PrimaryButton>
          <DangerButton type="button" onClick={onClose}>
            Cancel
          </DangerButton>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}

// 💅 Styled Components

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayEnd};
  backdrop-filter: blur(2px);
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  max-width: 430px;
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin: ${({ theme }) => theme.spacing.lg};

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radii.md};
    margin: ${({ theme }) => theme.spacing.sm};
  }
`;

const ModalTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Select = styled.select`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.inputs.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.sm};
  transition: border ${({ theme }) => theme.transition.normal};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const Input = styled.input`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.inputs.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.sm};
  transition: border ${({ theme }) => theme.transition.normal};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
`;

const Checkbox = styled.input`
  accent-color: ${({ theme }) => theme.colors.primary};
  width: 18px;
  height: 18px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    opacity: ${({ theme }) => theme.opacity.hover};
    outline: none;
  }
`;

const DangerButton = styled(PrimaryButton)`
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.danger.backgroundHover};
    color: ${({ theme }) => theme.buttons.danger.textHover};
  }
`;

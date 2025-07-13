"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { updateSlotRuleAdmin } from "@/modules/booking/slice/bookingSlotSlice";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import type { IBookingSlotRule } from "@/modules/booking/types";

const weekDays = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

interface Props {
  rule: IBookingSlotRule;
  onClose: () => void;
}

export default function SlotRuleModal({ rule, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("booking", translations);

  const [form, setForm] = useState<Omit<IBookingSlotRule, "_id" | "createdAt" | "updatedAt" | "isActive">>({
    dayOfWeek: rule.dayOfWeek ?? undefined,
    appliesToAll: rule.appliesToAll ?? false,
    startTime: rule.startTime,
    endTime: rule.endTime,
    intervalMinutes: rule.intervalMinutes,
    breakBetweenAppointments: rule.breakBetweenAppointments,
    tenant: rule.tenant,
  });

  useEffect(() => {
    setForm({
      dayOfWeek: rule.dayOfWeek ?? undefined,
      appliesToAll: rule.appliesToAll ?? false,
      startTime: rule.startTime,
      endTime: rule.endTime,
      intervalMinutes: rule.intervalMinutes,
      breakBetweenAppointments: rule.breakBetweenAppointments,
      tenant: rule.tenant,
    });
  }, [rule]);

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value, type } = e.target;
  if (type === "checkbox") {
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      appliesToAll: checked,
      // appliesToAll true ise dayOfWeek'i 0 (veya herhangi bir default gün) yap
      // (Çünkü type: number, undefined olamaz!)
      dayOfWeek: checked ? 0 : prev.dayOfWeek,
    }));
    return;
  }
  if (type === "number") {
    setForm((prev) => ({
      ...prev,
      [name]: +value,
    }));
    return;
  }
  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};


  const handleSubmit = async () => {
    try {
      await dispatch(updateSlotRuleAdmin({ id: rule._id, data: form })).unwrap();
      toast.success(t("admin.slotRule.updateSuccess", "Rule updated successfully."));
      onClose();
    } catch {
      toast.error(t("admin.slotRule.updateError", "Failed to update rule."));
    }
  };

  return (
    <Overlay tabIndex={-1} onClick={e => e.target === e.currentTarget && onClose()}>
      <Modal>
        <ModalTitle>
          {form.appliesToAll
            ? t("admin.slotRule.editGeneral", "Edit General Slot Rule")
            : t("admin.slotRule.edit", "Edit Slot Rule")}
        </ModalTitle>
        <Fields>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              name="appliesToAll"
              checked={!!form.appliesToAll}
              onChange={handleChange}
            />
            {t("admin.slotRule.applyAll", "Apply to all days")}
          </CheckboxLabel>
          {!form.appliesToAll && (
            <Label>
              {t("admin.slotRule.dayOfWeek", "Day of Week")}
              <Select
                name="dayOfWeek"
                value={form.dayOfWeek ?? 0}
                onChange={handleChange}
                disabled={!!form.appliesToAll}
              >
                {weekDays.map((d, i) => (
                  <option value={i} key={i}>{t(`common.weekdays.${i}`, d)}</option>
                ))}
              </Select>
            </Label>
          )}
          <Label>
            {t("admin.slotRule.startTime", "Start Time")}
            <Input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
            />
          </Label>
          <Label>
            {t("admin.slotRule.endTime", "End Time")}
            <Input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
            />
          </Label>
          <Label>
            {t("admin.slotRule.intervalMinutes", "Interval Minutes")}
            <Input
              type="number"
              name="intervalMinutes"
              min={1}
              value={form.intervalMinutes}
              onChange={handleChange}
            />
          </Label>
          <Label>
            {t("admin.slotRule.break", "Break Between Appointments")}
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
            {t("common.update", "Update")}
          </PrimaryButton>
          <DangerButton type="button" onClick={onClose}>
            {t("common.cancel", "Cancel")}
          </DangerButton>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}

// --- Styled Components ---
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
  padding: ${({ theme }) => theme.spacings.xl};
  width: 100%;
  max-width: 430px;
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin: ${({ theme }) => theme.spacings.lg};
  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.md};
    border-radius: ${({ theme }) => theme.radii.md};
    margin: ${({ theme }) => theme.spacings.sm};
  }
`;

const ModalTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  text-align: center;
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const Select = styled.select`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.inputs.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.sm};
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
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.inputs.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.sm};
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
  gap: ${({ theme }) => theme.spacings.xs};
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
  gap: ${({ theme }) => theme.spacings.md};
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.xl};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal};
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    opacity: 0.8;
  }
`;

const DangerButton = styled.button`
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.xl};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal};
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.danger.backgroundHover};
    color: ${({ theme }) => theme.buttons.danger.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    opacity: 0.8;
  }
`;

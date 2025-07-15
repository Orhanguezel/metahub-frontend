"use client";

import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/booking";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteSlotRuleAdmin,
  deleteSlotOverrideAdmin,
  createSlotRuleAdmin,
  createSlotOverrideAdmin,
} from "@/modules/booking/slice/bookingSlotSlice";
import { toast } from "react-toastify";
import { SlotRuleModal } from "@/modules/booking";
import type { IBookingSlotRule } from "@/modules/booking";

// Haftanın günleri
const weekDays = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

export default function SlotManager() {
  const { t } = useI18nNamespace("booking", translations);
  const dispatch = useAppDispatch();

  const { rulesAdmin: rules, overridesAdmin: overrides, loading } = useAppSelector(
    (state) => state.bookingSlot
  );

  const allRule = useMemo(() => rules.find((r) => r.appliesToAll), [rules]);
  const dailyRules = useMemo(() => rules.filter((r) => !r.appliesToAll), [rules]);

  const [newRule, setNewRule] = useState<Omit<IBookingSlotRule, "_id" | "createdAt" | "updatedAt" | "isActive"> & { isActive?: boolean }>({
    tenant: "",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "23:00",
    intervalMinutes: 60,
    breakBetweenAppointments: 15,
    appliesToAll: false,
    isActive: true,
  });

  const [overrideDate, setOverrideDate] = useState("");
  const [fullDayOff, setFullDayOff] = useState(false);
  const [editRule, setEditRule] = useState<IBookingSlotRule | null>(null);

  const handleRuleCreate = async () => {
    try {
      if (newRule.appliesToAll) {
        if (allRule) {
          toast.error(t("slot.error.generalExists", "There is already a general rule for all days."));
          return;
        }
        await dispatch(createSlotRuleAdmin({ ...newRule, appliesToAll: true, dayOfWeek: undefined })).unwrap();
        toast.success(t("slot.success.generalCreated", "General rule created."));
      } else {
        const exists = dailyRules.find((r) => r.dayOfWeek === newRule.dayOfWeek);
        if (exists) {
          toast.error(t("slot.error.dayExists", "There is already a rule for this day."));
          return;
        }
        await dispatch(createSlotRuleAdmin(newRule)).unwrap();
        toast.success(t("slot.success.created", "Rule created."));
      }
      setNewRule((prev) => ({ ...prev, appliesToAll: false }));
    } catch {
      toast.error(t("slot.error.create", "Failed to create rule."));
    }
  };

  const handleOverrideCreate = async () => {
    if (!overrideDate) {
      toast.error(t("slot.error.dateRequired", "Please select a date."));
      return;
    }
    try {
      await dispatch(createSlotOverrideAdmin({ date: overrideDate, fullDayOff })).unwrap();
      toast.success(t("slot.success.overrideCreated", "Override created."));
      setOverrideDate("");
      setFullDayOff(false);
    } catch {
      toast.error(t("slot.error.overrideCreate", "Failed to create override."));
    }
  };

  const handleRuleDelete = async (id: string) => {
    await dispatch(deleteSlotRuleAdmin(id));
  };

  const handleOverrideDelete = async (id: string) => {
    await dispatch(deleteSlotOverrideAdmin(id));
  };

  return (
    <Container>
      {/* Slot Rule Section */}
      <Section>
        <SectionTitle>{t("slot.title.rules", "📅 Slot Rules")}</SectionTitle>
        <RuleForm
          onSubmit={(e) => {
            e.preventDefault();
            handleRuleCreate();
          }}
        >
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={!!newRule.appliesToAll}
              onChange={(e) => setNewRule((prev) => ({ ...prev, appliesToAll: e.target.checked }))}
            />
            <span>{t("slot.form.applyAllDays", "Apply to all days")}</span>
          </CheckboxLabel>
          {!newRule.appliesToAll && (
            <Select
              value={newRule.dayOfWeek}
              onChange={(e) => setNewRule((prev) => ({ ...prev, dayOfWeek: +e.target.value }))}
            >
              {weekDays.map((day, index) => (
                <option key={index} value={index}>
                  {t(`slot.weekdays.${index}`, day)}
                </option>
              ))}
            </Select>
          )}
          <Input
            type="time"
            value={newRule.startTime}
            onChange={(e) => setNewRule((prev) => ({ ...prev, startTime: e.target.value }))}
          />
          <Input
            type="time"
            value={newRule.endTime}
            onChange={(e) => setNewRule((prev) => ({ ...prev, endTime: e.target.value }))}
          />
          <Input
            type="number"
            min={1}
            value={newRule.intervalMinutes}
            onChange={(e) => setNewRule((prev) => ({ ...prev, intervalMinutes: +e.target.value }))}
          />
          <Input
            type="number"
            min={0}
            value={newRule.breakBetweenAppointments}
            onChange={(e) => setNewRule((prev) => ({ ...prev, breakBetweenAppointments: +e.target.value }))}
          />
          <PrimaryButton type="submit" disabled={loading}>
            {newRule.appliesToAll
              ? t("slot.form.addGeneralRule", "Add General Rule")
              : t("slot.form.addRule", "Add Rule")}
          </PrimaryButton>
        </RuleForm>

        {allRule && (
          <List>
            <ListItem>
              <b>{t("slot.weekdays.all", "All Days")}</b>: {allRule.startTime} - {allRule.endTime} ({allRule.intervalMinutes}min, break: {allRule.breakBetweenAppointments}min)
              <ActionButtons>
                <DangerButton type="button" onClick={() => handleRuleDelete(allRule._id)}>❌</DangerButton>
              </ActionButtons>
            </ListItem>
          </List>
        )}

        {dailyRules.length > 0 ? (
          <List>
            {dailyRules.map((rule) => (
              <ListItem key={rule._id}>
                <b>{t(`slot.weekdays.${rule.dayOfWeek}`, weekDays[rule.dayOfWeek])}</b>: {rule.startTime} - {rule.endTime} ({rule.intervalMinutes}min, break: {rule.breakBetweenAppointments}min)
                <ActionButtons>
                  <EditButton type="button" onClick={() => setEditRule(rule)}>✏️</EditButton>
                  <DangerButton type="button" onClick={() => handleRuleDelete(rule._id)}>❌</DangerButton>
                </ActionButtons>
              </ListItem>
            ))}
          </List>
        ) : (
          <MutedText>{t("slot.info.noDayRules", "No day-specific rules defined.")}</MutedText>
        )}
      </Section>

      {/* Overrides Section */}
      <Section>
        <SectionTitle>{t("slot.title.overrides", "📌 Overrides")}</SectionTitle>
        <OverrideForm
          onSubmit={(e) => {
            e.preventDefault();
            handleOverrideCreate();
          }}
        >
          <Input
            type="date"
            value={overrideDate}
            onChange={(e) => setOverrideDate(e.target.value)}
          />
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={fullDayOff}
              onChange={(e) => setFullDayOff(e.target.checked)}
            />
            {t("slot.form.fullDayOff", "Full Day Off")}
          </CheckboxLabel>
          <PrimaryButton type="submit" disabled={loading}>
            {t("slot.form.addOverride", "Add")}
          </PrimaryButton>
        </OverrideForm>

        {overrides.length > 0 ? (
          <List>
            {overrides.map((o) => (
              <ListItem key={o._id}>
                <b>{o.date}</b>
                {o.fullDayOff && (
                  <span style={{ marginLeft: 8, color: "#c96" }}>
                    ({t("slot.form.fullDayOff", "Full Day Off")})
                  </span>
                )}
                <ActionButtons>
                  <DangerButton type="button" onClick={() => handleOverrideDelete(o._id)}>❌</DangerButton>
                </ActionButtons>
              </ListItem>
            ))}
          </List>
        ) : (
          <MutedText>{t("slot.info.noOverrides", "No overrides defined.")}</MutedText>
        )}
      </Section>

      {editRule && <SlotRuleModal rule={editRule} onClose={() => setEditRule(null)} />}
    </Container>
  );
}

// --- Styled Components ---
const Container = styled.div`
  padding: ${({ theme }) => theme.spacings.xxl};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  max-width: 900px;
  margin: 0 auto;

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.lg};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacings.xl};
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
`;

const RuleForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  align-items: flex-end;
`;

const OverrideForm = styled(RuleForm)`
  align-items: center;
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
  min-width: 110px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder};
    opacity: 1;
  }
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
  min-width: 110px;

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

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacings.xs}
    ${({ theme }) => theme.spacings.lg};
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

const EditButton = styled(PrimaryButton)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
`;

const ActionButtons = styled.span`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacings.xs};
  margin-left: ${({ theme }) => theme.spacings.sm};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${({ theme }) => theme.shadows.xs};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
`;

const MutedText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacings.sm};
  font-family: ${({ theme }) => theme.fonts.body};
`;

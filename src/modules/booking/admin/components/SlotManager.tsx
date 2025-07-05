"use client";

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSlotRules,
  fetchSlotOverrides,
  deleteSlotRule,
  deleteSlotOverride,
  createSlotRule,
  createSlotOverride,
} from "@/modules/booking/slice/bookingSlotSlice";
import { toast } from "react-toastify";
import { SlotRuleModal } from "@/modules/booking";
import type { IBookingSlotRule } from "@/modules/booking";

// Haftanın günleri isimleri
const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function SlotManager() {
  const dispatch = useAppDispatch();
  const { rules, overrides, loading } = useAppSelector(
    (state) => state.bookingSlot
  );

  // appliesToAll (genel kural) ve diğerleri ayrımı
  const allRule = useMemo(
    () => rules.find((r) => (r as any).appliesToAll),
    [rules]
  );
  const dailyRules = useMemo(
    () => rules.filter((r) => !(r as any).appliesToAll),
    [rules]
  );

  // Form state
  const [newRule, setNewRule] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "23:00",
    intervalMinutes: 60,
    breakBetweenAppointments: 15,
    appliesToAll: false,
  });

  const [overrideDate, setOverrideDate] = useState("");
  const [fullDayOff, setFullDayOff] = useState(false);

  const [editRule, setEditRule] = useState<IBookingSlotRule | null>(null);

  useEffect(() => {
    dispatch(fetchSlotRules());
    dispatch(fetchSlotOverrides());
  }, [dispatch]);

  // Kural ekleme: appliesToAll ise unique, dayOfWeek ise unique
  const handleRuleCreate = async () => {
    try {
      // Genel (appliesToAll) için
      if (newRule.appliesToAll) {
        if (allRule) {
          toast.error("There is already a general rule for all days.");
          return;
        }
        await dispatch(
          createSlotRule({ ...newRule, appliesToAll: true })
        ).unwrap();
        toast.success("General rule created.");
      } else {
        // Günlük kural için (aynı güne iki tane eklenemez)
        const exists = dailyRules.find(
          (r) => r.dayOfWeek === newRule.dayOfWeek
        );
        if (exists) {
          toast.error("There is already a rule for this day.");
          return;
        }
        await dispatch(createSlotRule(newRule)).unwrap();
        toast.success("Rule created.");
      }
      setNewRule((p) => ({ ...p, appliesToAll: false })); // formu resetle
    } catch {
      toast.error("Failed to create rule.");
    }
  };

  // Override ekleme
  const handleOverrideCreate = async () => {
    if (!overrideDate) {
      toast.error("Please select a date.");
      return;
    }
    try {
      await dispatch(
        createSlotOverride({ date: overrideDate, fullDayOff })
      ).unwrap();
      toast.success("Override created.");
      setOverrideDate("");
      setFullDayOff(false);
    } catch {
      toast.error("Failed to create override.");
    }
  };

  const handleRuleDelete = async (id: string) => {
    await dispatch(deleteSlotRule(id));
  };

  const handleOverrideDelete = async (id: string) => {
    await dispatch(deleteSlotOverride(id));
  };

  return (
    <Container>
      {/* GENEL KURAL */}
      <Section>
        <SectionTitle>📅 Slot Rules</SectionTitle>
        <RuleForm>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={newRule.appliesToAll}
              onChange={(e) =>
                setNewRule((prev) => ({
                  ...prev,
                  appliesToAll: e.target.checked,
                }))
              }
            />
            <span>Apply to all days</span>
          </CheckboxLabel>
          {!newRule.appliesToAll && (
            <Select
              value={newRule.dayOfWeek}
              onChange={(e) =>
                setNewRule((p) => ({ ...p, dayOfWeek: +e.target.value }))
              }
            >
              {weekDays.map((d, i) => (
                <option value={i} key={i}>
                  {d}
                </option>
              ))}
            </Select>
          )}
          <Input
            type="time"
            value={newRule.startTime}
            onChange={(e) =>
              setNewRule((p) => ({ ...p, startTime: e.target.value }))
            }
            placeholder="Start"
          />
          <Input
            type="time"
            value={newRule.endTime}
            onChange={(e) =>
              setNewRule((p) => ({ ...p, endTime: e.target.value }))
            }
            placeholder="End"
          />
          <Input
            type="number"
            value={newRule.intervalMinutes}
            min={1}
            onChange={(e) =>
              setNewRule((p) => ({ ...p, intervalMinutes: +e.target.value }))
            }
            placeholder="Interval"
          />
          <Input
            type="number"
            value={newRule.breakBetweenAppointments}
            min={0}
            onChange={(e) =>
              setNewRule((p) => ({
                ...p,
                breakBetweenAppointments: +e.target.value,
              }))
            }
            placeholder="Break"
          />
          <PrimaryButton
            type="button"
            onClick={handleRuleCreate}
            disabled={loading}
          >
            {newRule.appliesToAll ? "Add General Rule" : "Add Rule"}
          </PrimaryButton>
        </RuleForm>

        {/* General Rule */}
        {allRule && (
          <List>
            <ListItem>
              <b>All Days</b>: {allRule.startTime} - {allRule.endTime} (
              {allRule.intervalMinutes}min, break:{" "}
              {allRule.breakBetweenAppointments}min)
              <ActionButtons>
                <DangerButton
                  type="button"
                  onClick={() => handleRuleDelete(allRule._id)}
                >
                  ❌
                </DangerButton>
              </ActionButtons>
            </ListItem>
          </List>
        )}

        {/* Daily Rules */}
        {dailyRules.length > 0 ? (
          <List>
            {dailyRules.map((r) => (
              <ListItem key={r._id}>
                <b>{weekDays[r.dayOfWeek]}</b>: {r.startTime} - {r.endTime} (
                {r.intervalMinutes}min, break: {r.breakBetweenAppointments}min)
                <ActionButtons>
                  <EditButton type="button" onClick={() => setEditRule(r)}>
                    ✏️
                  </EditButton>
                  <DangerButton
                    type="button"
                    onClick={() => handleRuleDelete(r._id)}
                  >
                    ❌
                  </DangerButton>
                </ActionButtons>
              </ListItem>
            ))}
          </List>
        ) : (
          <MutedText>No day-specific rules defined.</MutedText>
        )}
      </Section>

      {/* OVERRIDES */}
      <Section>
        <SectionTitle>📌 Overrides</SectionTitle>
        <OverrideForm>
          <Input
            type="date"
            value={overrideDate}
            onChange={(e) => setOverrideDate(e.target.value)}
            placeholder="Date"
          />
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={fullDayOff}
              onChange={(e) => setFullDayOff(e.target.checked)}
            />
            Full Day Off
          </CheckboxLabel>
          <PrimaryButton
            type="button"
            onClick={handleOverrideCreate}
            disabled={loading}
          >
            Add
          </PrimaryButton>
        </OverrideForm>

        {overrides.length > 0 ? (
          <List>
            {overrides.map((o) => (
              <ListItem key={o._id}>
                <b>{o.date}</b>
                {o.fullDayOff && (
                  <span style={{ marginLeft: 8, color: "#c96" }}>
                    (Full Day Off)
                  </span>
                )}
                <ActionButtons>
                  <DangerButton
                    type="button"
                    onClick={() => handleOverrideDelete(o._id)}
                  >
                    ❌
                  </DangerButton>
                </ActionButtons>
              </ListItem>
            ))}
          </List>
        ) : (
          <MutedText>No overrides defined.</MutedText>
        )}
      </Section>

      {/* SlotRuleModal ile düzenleme */}
      {editRule && (
        <SlotRuleModal rule={editRule} onClose={() => setEditRule(null)} />
      )}
    </Container>
  );
}

// 💅 Styled Components

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

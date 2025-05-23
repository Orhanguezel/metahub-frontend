"use client";

import React, { useEffect, useState } from "react";
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
import {SlotRuleModal} from "@/modules/booking";
import type { IBookingSlotRule } from "@/modules/booking";

export default function SlotManager() {
  const dispatch = useAppDispatch();
  const { rules, overrides} = useAppSelector((state) => state.bookingSlot);

  const [newRule, setNewRule] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "23:00",
    intervalMinutes: 60,
    breakBetweenAppointments: 15,
  });

  const [overrideDate, setOverrideDate] = useState("");
  const [fullDayOff, setFullDayOff] = useState(false);

  const [editRule, setEditRule] = useState<IBookingSlotRule | null>(null);

  useEffect(() => {
    dispatch(fetchSlotRules());
    dispatch(fetchSlotOverrides());
  }, [dispatch]);

  const handleRuleCreate = async () => {
    try {
      const existingRule = rules.find((r) => r.dayOfWeek === newRule.dayOfWeek);
      if (existingRule) {
        await dispatch(deleteSlotRule(existingRule._id));
      }
      await dispatch(createSlotRule(newRule)).unwrap();
      toast.success("Rule updated.");
    } catch {
      toast.error("Failed to create or update rule.");
    }
  };

  const handleOverrideCreate = async () => {
    try {
      await dispatch(createSlotOverride({ date: overrideDate, fullDayOff })).unwrap();
      toast.success("Override created.");
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
      <Section>
        <h2>📅 Slot Rules</h2>
        <RuleForm>
          <input
            type="number"
            min={0}
            max={6}
            value={newRule.dayOfWeek}
            onChange={(e) => setNewRule((p) => ({ ...p, dayOfWeek: +e.target.value }))}
            placeholder="Day of Week"
          />
          <input
            type="time"
            value={newRule.startTime}
            onChange={(e) => setNewRule((p) => ({ ...p, startTime: e.target.value }))}
          />
          <input
            type="time"
            value={newRule.endTime}
            onChange={(e) => setNewRule((p) => ({ ...p, endTime: e.target.value }))}
          />
          <input
            type="number"
            value={newRule.intervalMinutes}
            onChange={(e) => setNewRule((p) => ({ ...p, intervalMinutes: +e.target.value }))}
            placeholder="Interval"
          />
          <input
            type="number"
            value={newRule.breakBetweenAppointments}
            onChange={(e) => setNewRule((p) => ({ ...p, breakBetweenAppointments: +e.target.value }))}
            placeholder="Break"
          />
          <button onClick={handleRuleCreate}>Add</button>
        </RuleForm>

        {Array.isArray(rules) && rules.length > 0 ? (
          <ul>
            {rules.map((r) => (
              <li key={r._id}>
                Day {r.dayOfWeek} → {r.startTime} - {r.endTime} (
                {r.intervalMinutes}min, break: {r.breakBetweenAppointments}min)
                <button onClick={() => setEditRule(r)}>✏️</button>
                <button onClick={() => handleRuleDelete(r._id)}>❌</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No rules defined.</p>
        )}
      </Section>

      <Section>
        <h2>📌 Overrides</h2>
        <OverrideForm>
          <input
            type="date"
            value={overrideDate}
            onChange={(e) => setOverrideDate(e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              checked={fullDayOff}
              onChange={(e) => setFullDayOff(e.target.checked)}
            /> Full Day Off
          </label>
          <button onClick={handleOverrideCreate}>Add</button>
        </OverrideForm>

        {Array.isArray(overrides) && overrides.length > 0 ? (
          <ul>
            {overrides.map((o) => (
              <li key={o._id}>
                {o.date} {o.fullDayOff && "(Full Day Off)"}
                <button onClick={() => handleOverrideDelete(o._id)}>❌</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No overrides defined.</p>
        )}
      </Section>

      {editRule && (
        <SlotRuleModal rule={editRule} onClose={() => setEditRule(null)} />
      )}
    </Container>
  );
}

// 💅 Styled
const Container = styled.div`
  padding: 2rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const RuleForm = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  input,
  button {
    padding: 0.4rem;
  }
`;

const OverrideForm = styled(RuleForm)`
  align-items: center;
  input[type="checkbox"] {
    margin-left: 0.5rem;
    margin-right: 0.25rem;
  }
`;

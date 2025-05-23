"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { updateSlotRule } from "@/modules/booking/slice/bookingSlotSlice";
import { toast } from "react-toastify";

interface SlotRule {
  _id: string;
  dayOfWeek: number;
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
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "23:00",
    intervalMinutes: 60,
    breakBetweenAppointments: 15,
  });

  useEffect(() => {
    if (rule) {
      const { ...rest } = rule;
      setForm(rest);
    }
  }, [rule]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "dayOfWeek" || name.includes("Minutes") ? +value : value,
    }));
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
        <h3>Edit Slot Rule</h3>
        <Fields>
          <input
            type="number"
            name="dayOfWeek"
            min={0}
            max={6}
            value={form.dayOfWeek}
            onChange={handleChange}
          />
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
          />
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
          />
          <input
            type="number"
            name="intervalMinutes"
            value={form.intervalMinutes}
            onChange={handleChange}
          />
          <input
            type="number"
            name="breakBetweenAppointments"
            value={form.breakBetweenAppointments}
            onChange={handleChange}
          />
        </Fields>
        <ButtonGroup>
          <button onClick={handleSubmit}>Update</button>
          <button onClick={onClose}>Cancel</button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 2rem;
  width: 90%;
  max-width: 480px;
  margin: 10vh auto;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;

  input {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;

  button {
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    background: ${({ theme }) => theme.colors.success};
    color: #fff;
    cursor: pointer;

    &:last-child {
      background: ${({ theme }) => theme.colors.danger};
    }
  }
`;

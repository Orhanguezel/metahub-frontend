"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchServices } from "@/modules/services/slice/servicesSlice";
import {
  fetchAvailableSlots,
  clearSlotMessages,
} from "@/modules/booking/slice/bookingSlotSlice";
import { createBooking } from "@/modules/booking/slice/bookingSlice";
import { toast } from "react-toastify";
import type { BookingFormInput } from "@/modules/booking";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

export default function BookingForm() {
  const { t, i18n } = useTranslation("booking");
  const dispatch = useAppDispatch();
  const { services } = useAppSelector((state) => state.services);
  const { availableSlots } = useAppSelector((state) => state.bookingSlot);

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [form, setForm] = useState<Omit<BookingFormInput, "language">>({
    name: { tr: "", en: "", de: "" },
    email: "",
    phone: "",
    service: "",
    serviceType: "",
    note: "",
    date: "",
    time: "",
    durationMinutes: 60,
  });

  useEffect(() => {
    dispatch(fetchServices(lang));
  }, [dispatch, lang]);

  useEffect(() => {
    if (form.date) {
      dispatch(fetchAvailableSlots(form.date));
    }
  }, [dispatch, form.date]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "service") {
      const selected = services.find((s) => s._id === value);
      setForm((prev) => ({
        ...prev,
        service: value,
        serviceType: selected?.title?.[lang] || "",
      }));
    } else if (name === "name") {
      setForm((prev) => ({
        ...prev,
        name: { ...prev.name, [lang]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const formatted = format(date, "yyyy-MM-dd");
      setForm((prev) => ({ ...prev, date: formatted }));
    }
  };

  const handleSubmit = async () => {
    const { name, email, service, date, time } = form;

    if (!name[lang] || !email || !service || !date || !time) {
      toast.error(t("form.required", "Please fill all required fields."));
      return;
    }

    try {
      await dispatch(createBooking({ ...form, language: lang })).unwrap();
      toast.success(
        t("form.success", "Your booking was successfully submitted!")
      );
      dispatch(clearSlotMessages());
      setForm({
        name: { tr: "", en: "", de: "" },
        email: "",
        phone: "",
        service: "",
        serviceType: "",
        note: "",
        date: "",
        time: "",
        durationMinutes: 60,
      });
      setSelectedDate(null);
    } catch {
      toast.error(t("form.error", "Something went wrong. Please try again."));
    }
  };

  return (
    <Form>
      <Field>
        <Label>{t("form.name", "Name")}</Label>
        <Input name="name" value={form.name[lang]} onChange={handleChange} />
      </Field>

      <Field>
        <Label>{t("form.email", "Email")}</Label>
        <Input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
      </Field>

      <Field>
        <Label>{t("form.phone", "Phone")}</Label>
        <Input name="phone" value={form.phone} onChange={handleChange} />
      </Field>

      <Field>
        <Label>{t("form.service", "Service")}</Label>
        <Select name="service" value={form.service} onChange={handleChange}>
          <option value="">
            {t("form.selectService", "Please select a service")}
          </option>
          {services.map((s) => (
            <option key={s._id} value={s._id}>
              {s.title?.[lang] || s._id}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <Label>{t("form.date", "Date")}</Label>
        <StyledDatePicker
          selected={selectedDate as Date}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          placeholderText={t("form.selectDate", "Select a date")}
        />
      </Field>

      <Field>
        <Label>{t("form.time", "Time")}</Label>
        <Select name="time" value={form.time} onChange={handleChange}>
          <option value="">
            {t("form.selectTime", "Please select a time")}
          </option>
          {availableSlots.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <Label>{t("form.note", "Note")}</Label>
        <TextArea
          name="note"
          value={form.note}
          onChange={handleChange}
          rows={3}
        />
      </Field>

      <SubmitButton onClick={handleSubmit}>
        {t("form.submit", "Book Appointment")}
      </SubmitButton>
    </Form>
  );
}

// 💅 Styled Components
const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
`;

const Select = styled.select`
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
`;

const TextArea = styled.textarea`
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;
`;

const SubmitButton = styled.button`
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background: ${({ theme }) => theme.colors.success};
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  padding: 0.6rem;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
`;

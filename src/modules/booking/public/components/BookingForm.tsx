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
import TimeSlotPicker from "./TimeSlotPicker";

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
    } else if (name === "time") {
      setForm((prev) => ({ ...prev, time: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (
    date: Date | null
  ) => {
    setSelectedDate(date);
    if (date) {
      const formatted = format(date, "yyyy-MM-dd");
      setForm((prev) => ({ ...prev, date: formatted, time: "" }));
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
        <DatePicker
          selected={selectedDate ?? undefined}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          placeholderText={t("form.selectDate", "Select a date")}
          minDate={new Date()}
        />
      </Field>
      <Field>
        <Label>{t("form.time", "Time")}</Label>
        {/* Eğer sadece availableSlots varsa, bookedSlots propunu kaldır */}
        <TimeSlotPicker
          availableSlots={availableSlots}
          bookedSlots={[]} // Şimdilik boş array gönder, gerekirse slice'a eklenir
          value={form.time}
          onChange={(time) => setForm((prev) => ({ ...prev, time }))}
        />
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
      <SubmitButton type="button" onClick={handleSubmit}>
        {t("form.submit", "Book Appointment")}
      </SubmitButton>
    </Form>
  );
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.form};
  padding: ${({ theme }) => theme.spacing.xl};
  margin: 0 auto;

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Input = styled.input`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.inputs.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.sm};
  transition: border ${({ theme }) => theme.transition.normal};

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
  padding: ${({ theme }) => theme.spacing.sm};
  transition: border ${({ theme }) => theme.transition.normal};
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const TextArea = styled.textarea`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.inputs.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.sm};
  resize: vertical;
  min-height: 70px;
  transition: border ${({ theme }) => theme.transition.normal};

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

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal};

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    text-decoration: none;
    opacity: ${({ theme }) => theme.opacity.hover};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

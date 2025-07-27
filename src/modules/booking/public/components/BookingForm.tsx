"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/booking";
import { SupportedLocale } from "@/types/common";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
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
import { useSearchParams } from "next/navigation";


// --- STYLED COMPONENTS & CUSTOM INPUT ---

const DatePickerWrapper = styled.div`
  .react-datepicker__input-container {
    width: 100%;
  }
  .custom-date-input {
    width: 100%;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
    background: ${({ theme }) => theme.inputs.background};
    color: ${({ theme }) => theme.inputs.text};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.inputs.border};
    border-radius: ${({ theme }) => theme.radii.md};
    padding: ${({ theme }) => theme.spacings.sm};
    transition: border ${({ theme }) => theme.transition.normal};
    cursor: pointer;
    &:focus, &:hover {
      outline: none;
      border-color: ${({ theme }) => theme.inputs.borderFocus};
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
    &::placeholder {
      color: ${({ theme }) => theme.inputs.placeholder};
      opacity: 1;
    }
  }
  // Takvim popup'ı
  .react-datepicker {
    border-radius: ${({ theme }) => theme.radii.lg};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    font-family: ${({ theme }) => theme.fonts.body};
    background: ${({ theme }) => theme.colors.cardBackground};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
  .react-datepicker__header {
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
    border-radius: ${({ theme }) => theme.radii.lg} ${({ theme }) => theme.radii.lg} 0 0;
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }
  .react-datepicker__day--today {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
`;

const DateInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onClick, placeholder }, ref) => (
    <input
      className="custom-date-input"
      onClick={onClick}
      value={value}
      readOnly
      placeholder={placeholder}
      ref={ref}
    />
  )
);
DateInput.displayName = "DateInput";

// --- BOOKING FORM ---

export default function BookingForm() {
  const { t, i18n } = useI18nNamespace("booking", translations);
  const dispatch = useAppDispatch();
  const { services } = useAppSelector((state) => state.services);
  const { availableSlots } = useAppSelector((state) => state.bookingSlot);

  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const params = useSearchParams();
const preselectedService = params.get("service");

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [form, setForm] = useState<Omit<BookingFormInput, "language">>({
    name: "",
    email: "",
    phone: "",
    service: "",
    serviceType: "",
    note: "",
    date: "",
    time: "",
    durationMinutes: 60,
  });

  // Mevcut date değişimi için
useEffect(() => {
  if (form.date) {
    dispatch(fetchAvailableSlots(form.date));
  }
}, [dispatch, form.date]);

// Yeni: Preselected service (URL'den)
useEffect(() => {
  if (!form.service && services.length && preselectedService) {
    const selected = services.find(
      (s) => s._id === preselectedService || s.slug === preselectedService
    );
    if (selected) {
      setForm((prev) => ({
        ...prev,
        service: selected._id,
        serviceType: selected.title?.[lang] || "",
      }));
    }
  }
}, [form.service, services, preselectedService, lang]);


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
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const formatted = format(date, "yyyy-MM-dd");
      setForm((prev) => ({ ...prev, date: formatted, time: "" }));
    }
  };

  const handleSubmit = async () => {
    const { name, email, service, date, time } = form;
    if (!name || !email || !service || !date || !time) {
      toast.error(t("form.required", "Please fill all required fields."));
      return;
    }
    try {
      await dispatch(createBooking({ ...form, language: lang })).unwrap();
      toast.success(t("form.success", "Your booking was successfully submitted!"));
      dispatch(clearSlotMessages());
      setForm({
        name: "",
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
    <Form autoComplete="off" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
      <Field>
        <Label>{t("form.name", "Name")}</Label>
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          autoComplete="name"
        />
      </Field>
      <Field>
        <Label>{t("form.email", "Email")}</Label>
        <Input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
      </Field>
      <Field>
        <Label>{t("form.phone", "Phone")}</Label>
        <Input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          autoComplete="tel"
        />
      </Field>
      <Field>
        <Label>{t("form.service", "Service")}</Label>
        <Select name="service" value={form.service} onChange={handleChange} required>
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
        <DatePickerWrapper>
          <DatePicker
            selected={selectedDate ?? undefined}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText={t("form.selectDate", "Tarih seçiniz")}
            minDate={new Date()}
            name="date"
            required
            customInput={<DateInput />}
          />
        </DatePickerWrapper>
      </Field>
      <Field>
        <Label>{t("form.time", "Time")}</Label>
        <TimeSlotPicker
          availableSlots={availableSlots}
          bookedSlots={[]} // Gerekirse buraya gerçek bookedSlots prop'u eklenir
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
      <SubmitButton type="submit">
        {t("form.submit", "Book Appointment")}
      </SubmitButton>
    </Form>
  );
}

// --- Styled Components ---
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.form};
  padding: ${({ theme }) => theme.spacings.xl};
  margin: 0 auto;

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.md};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
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
  padding: ${({ theme }) => theme.spacings.sm};
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
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.xl};
  margin-top: ${({ theme }) => theme.spacings.lg};
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

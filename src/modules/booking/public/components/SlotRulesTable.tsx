"use client";

import React, { useEffect, useMemo } from "react";
import styled from "styled-components";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchAvailableSlots,
  fetchSlotRules,
  fetchSlotOverrides,
} from "@/modules/booking/slice/bookingSlotSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/booking";

// Haftanın günleri
const weekDays = [
  { key: 0, label: { tr: "Pazar", en: "Sunday", de: "Sonntag", pl: "Niedziela", fr: "Dimanche", es: "Domingo" } },
  { key: 1, label: { tr: "Pazartesi", en: "Monday", de: "Montag", pl: "Poniedziałek", fr: "Lundi", es: "Lunes" } },
  { key: 2, label: { tr: "Salı", en: "Tuesday", de: "Dienstag", pl: "Wtorek", fr: "Mardi", es: "Martes" } },
  { key: 3, label: { tr: "Çarşamba", en: "Wednesday", de: "Mittwoch", pl: "Środa", fr: "Mercredi", es: "Miércoles" } },
  { key: 4, label: { tr: "Perşembe", en: "Thursday", de: "Donnerstag", pl: "Czwartek", fr: "Jeudi", es: "Jueves" } },
  { key: 5, label: { tr: "Cuma", en: "Friday", de: "Freitag", pl: "Piątek", fr: "Vendredi", es: "Viernes" } },
  { key: 6, label: { tr: "Cumartesi", en: "Saturday", de: "Samstag", pl: "Sobota", fr: "Samedi", es: "Sábado" } },
];

export default function SlotRulesTable() {
  const dispatch = useAppDispatch();
  const {
    availableSlots = [],
    rules = [],
    overrides = [],
    loading,
  } = useAppSelector((state) => state.bookingSlot);

  const { t, i18n } = useI18nNamespace("booking", translations);
  const lang = (i18n.language?.split("-")[0] ?? "tr") as keyof typeof weekDays[0]["label"];
  const today = new Date().toISOString().split("T")[0];

  // Yalnızca PUBLIC thunks kullan
  useEffect(() => {
    dispatch(fetchSlotRules());
    dispatch(fetchSlotOverrides());
    dispatch(fetchAvailableSlots(today));
  }, [dispatch, today]);

  // Bugünün override'ı (tam gün kapalı mı)
  const todayOverride = useMemo(
    () => overrides.find((o) => o.date === today && o.fullDayOff),
    [overrides, today]
  );

  // Gün gün slot kuralları:
  const dailyRules = useMemo(() => {
    const result = weekDays.map((wd) => {
      const rule = rules.find((r) => r.dayOfWeek === wd.key && r.isActive);
      return {
        ...wd,
        rule,
      };
    });
    return result;
  }, [rules]);

  return (
    <Box>
      <Section>
        <SectionTitle>🗓️ {t("form.title")}</SectionTitle>
        <RulesList>
          {dailyRules.map((d) => (
            <RuleRow key={d.key}>
              <Day>{d.label[lang]}</Day>
              <Hours>
                {d.rule
                  ? (
                    <>
                      {d.rule.startTime} - {d.rule.endTime}
                      <span style={{ color: "#bbb", fontSize: 12, marginLeft: 6 }}>
                        ({d.rule.intervalMinutes}min, break: {d.rule.breakBetweenAppointments}min)
                      </span>
                    </>
                  )
                  : <span style={{ color: "#aaa" }}>{t("form.closed")}</span>
                }
              </Hours>
            </RuleRow>
          ))}
        </RulesList>
        {/* Override (bugün kapalı mı) */}
        {todayOverride && (
          <ClosedBanner>
            {t("form.todayClosed")}
          </ClosedBanner>
        )}
      </Section>
      <Section>
        <SectionTitle>⏰ {t("form.availableSlots")}</SectionTitle>
        <SlotsGrid>
          {loading
            ? <Loader>{t("form.loading", "Yükleniyor...")}</Loader>
            : availableSlots.length
              ? availableSlots.map((slot) => (
                  <SlotBadge key={slot}>{slot}</SlotBadge>
                ))
              : <NoData>{t("form.noAvailableSlots", "Uygun slot bulunamadı.")}</NoData>
          }
        </SlotsGrid>
      </Section>
    </Box>
  );
}

// --- Styled Components ---
const Box = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const Section = styled.section``;

const SectionTitle = styled.h3`
  font-size: 1.12rem;
  margin-bottom: 0.6rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RulesList = styled.ul`
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const RuleRow = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.15rem 0.3rem;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.borderLight};
`;

const Day = styled.span`
  font-weight: 500;
  min-width: 100px;
`;

const Hours = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ClosedBanner = styled.div`
  margin-top: 10px;
  background: ${({ theme }) => theme.colors.danger};
  color: #fff;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 10px;
  text-align: center;
`;

const SlotsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 0.6rem;
`;

const SlotBadge = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: #222;
  font-weight: 600;
  border-radius: 20px;
  padding: 0.4rem 1.2rem;
  font-size: 1rem;
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 6%);
`;

const Loader = styled.div`
  color: ${({ theme }) => theme.colors.primary};
`;

const NoData = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
  padding: 0.4rem 0;
`;

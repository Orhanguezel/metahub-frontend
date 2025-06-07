"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchSlotRules } from "@/modules/booking/slice/bookingSlotSlice";
import { useTranslation } from "react-i18next";

// Haftanın günleri (çeviriler için anahtarlar var)
const weekDays = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

export default function SlotRulesTable() {
  const dispatch = useAppDispatch();
  const { rules, loading } = useAppSelector((state) => state.bookingSlot);
  const { t } = useTranslation("booking");

  useEffect(() => {
    // Sadece rules boşsa fetchle!
    if (!rules || rules.length === 0) {
      dispatch(fetchSlotRules());
    }
  }, [dispatch, rules]);

  const allDaysRule = rules?.find((r) => r.appliesToAll);

  const rows = Array.from({ length: 7 }, (_, day) => {
    const dayRule = rules.find((r) => r.dayOfWeek === day && !r.appliesToAll);
    const rule = dayRule || allDaysRule;
    if (!rule) return null;
    return (
      <tr key={day}>
        <td>{t(`form.weekdays.${day}`, weekDays[day])}</td>
        <td>{rule.startTime}</td>
        <td>{rule.endTime}</td>
        <td>{rule.intervalMinutes}</td>
        <td>{rule.breakBetweenAppointments}</td>
      </tr>
    );
  }).filter(Boolean);

  if (loading) return <Loader>{t("form.loading", "Loading working hours...")}</Loader>;
  if (!rules || (!allDaysRule && rows.length === 0))
    return <NoData>{t("form.noWorkingHours", "No working hours defined yet.")}</NoData>;

  return (
    <TableWrapper>
      <TableTitle>
        {t("form.openingHours", "Working Hours & Available Slots")}
      </TableTitle>
      <StyledTable>
        <thead>
          <tr>
            <th>{t("form.day", "Day")}</th>
            <th>{t("form.startTime", "Start")}</th>
            <th>{t("form.endTime", "End")}</th>
            <th>{t("form.interval", "Interval (min)")}</th>
            <th>{t("form.break", "Break (min)")}</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </StyledTable>
    </TableWrapper>
  );
}

// Styled Components %100 Temaya Uyumlu
const TableWrapper = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-x: auto;

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const TableTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const StyledTable = styled.table`
  width: 100%;
  min-width: 540px;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 auto;

  th, td {
    padding: ${({ theme }) => theme.spacing.md};
    text-align: center;
    border-bottom: ${({ theme }) => theme.borders.thin}
      ${({ theme }) => theme.colors.border};
    font-size: ${({ theme }) => theme.fontSizes.md};
  }

  th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    border-bottom: ${({ theme }) => theme.borders.thick}
      ${({ theme }) => theme.colors.borderBright};
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const Loader = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

const NoData = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

"use client";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/employees/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearEmployeeMessages,
  deleteEmployee,
} from "@/modules/employees/slice/employeesSlice";
import type { IEmployee } from "@/modules/employees/types";
import { EmployeeList, EmployeeForm } from "@/modules/employees";

type Props = { onRefresh?: () => void };

export default function AdminEmployeesPage({ onRefresh }: Props) {
  const { t } = useI18nNamespace("employees", translations);
  const dispatch = useAppDispatch();

  // Employees slice (yalnız state)
  const { employeesAdmin, loading, error, successMessage } = useAppSelector(
    (s) => s.employees
  );

  // ✅ İlişkili modüller: slice'lara uygun selector
  const serviceItems =
    useAppSelector((s) => (s as any)?.servicecatalog?.items) ?? [];
  const contactItems =
    useAppSelector((s) => (s as any)?.contacts?.contactsAdmin) ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IEmployee | null>(null);

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearEmployeeMessages());
  }, [successMessage, error, dispatch]);

  const employeeCount = useMemo(
    () => (Array.isArray(employeesAdmin) ? employeesAdmin.length : 0),
    [employeesAdmin]
  );

  return (
    <PageWrap>
      <Header>
        <h1>{t("title", "Employees")}</h1>
        <Right>
          <Badge title={t("labels.count", "Count")}>{employeeCount}</Badge>

          {/* tamamen state'ten */}
          <SoftBadge title={t("labels.services", "Services")}>
            {(serviceItems as any[]).length || 0}
          </SoftBadge>
          <SoftBadge title={t("labels.contacts", "Contacts")}>
            {(contactItems as any[]).length || 0}
          </SoftBadge>

          <PrimaryBtn
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + {t("actions.new", "New")}
          </PrimaryBtn>

          {onRefresh && (
            <SmallBtn onClick={onRefresh} aria-busy={loading} disabled={loading}>
              {t("actions.refresh", "Refresh")}
            </SmallBtn>
          )}
        </Right>
      </Header>

      {showForm && (
        <Card>
          <EmployeeForm
            initial={editing || undefined}
            onClose={() => setShowForm(false)}
            onSaved={() => setShowForm(false)} // re-fetch yok; slice güncelliyor
          />
        </Card>
      )}

      <Section>
        <SectionHead>
          <h2>{t("sections.list", "Employees")}</h2>
        </SectionHead>

        <Card>
          <EmployeeList
            items={employeesAdmin || []}
            loading={loading}
            onEdit={(e) => {
              setEditing(e);
              setShowForm(true);
            }}
            onDelete={(id) => dispatch(deleteEmployee(id))}
          />
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled ---- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;
const Right = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
  flex-wrap: wrap;
`;
const Badge = styled.span`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const SoftBadge = styled(Badge)`
  opacity: 0.85;
`;
const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacings.xl};
`;
const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;
const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;
const PrimaryBtn = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;
const SmallBtn = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;

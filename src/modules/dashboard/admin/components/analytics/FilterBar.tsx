"use client";

import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales";
import { useId } from "react";

interface Props {
  module: string;
  eventType: string;
  onChange: (filters: { module: string; eventType: string }) => void;
  availableModules: string[];
  availableEventTypes: string[];
}

export default function FilterBar({
  module,
  eventType,
  onChange,
  availableModules,
  availableEventTypes,
}: Props) {
  const { t } = useI18nNamespace("admin-dashboard", translations);
  const moduleSelectId = useId();
  const eventTypeSelectId = useId();

  return (
    <Wrapper>
      <Field>
        <Label htmlFor={moduleSelectId}>
          {t("analytics.moduleFilter", "Modül")}
        </Label>
        <Select
          id={moduleSelectId}
          value={module}
          onChange={(e) => onChange({ module: e.target.value, eventType })}
          aria-label={t("analytics.moduleFilter", "Modül")}
        >
          <option value="">{t("analytics.all", "Tümü")}</option>
          {availableModules.map((mod) => (
            <option key={mod} value={mod}>
              {t(`modules.${mod}`, mod)}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <Label htmlFor={eventTypeSelectId}>
          {t("analytics.eventTypeFilter", "Etkinlik Türü")}
        </Label>
        <Select
          id={eventTypeSelectId}
          value={eventType}
          onChange={(e) => onChange({ module, eventType: e.target.value })}
          aria-label={t("analytics.eventTypeFilter", "Etkinlik Türü")}
        >
          <option value="">{t("analytics.all", "Tümü")}</option>
          {availableEventTypes.map((type) => (
            <option key={type} value={type}>
              {t(`events.${type}`, type)}
            </option>
          ))}
        </Select>
      </Field>
    </Wrapper>
  );
}

// --- Styled Components ---
const Wrapper = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 220px;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: 0.3rem;
`;

const Select = styled.select`
  padding: 0.6rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.borderInput};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
  outline: none;
  transition: 0.2s ease;
  appearance: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

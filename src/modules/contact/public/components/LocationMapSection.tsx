"use client";

import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

export default function LocationMapSection() {
  const { t } = useI18nNamespace("contact", translations);
  return (
    <MapSection>
      <MapTitle>{t("location.title", "Our Location")}</MapTitle>
      <MapWrapper>
        <iframe
          src="https://maps.google.com/maps?q=Berlin&t=&z=13&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="260"
          loading="lazy"
          style={{ border: 0, borderRadius: 8 }}
          title="Location Map"
        />
      </MapWrapper>
    </MapSection>
  );
}

const MapSection = styled.section`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 24px 14px;
  border-radius: 12px;
`;

const MapTitle = styled.h3`
  margin-bottom: 14px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 1.18rem;
`;

const MapWrapper = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
`;

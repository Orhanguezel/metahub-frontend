"use client";

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Section = styled(motion.section)`
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
`;

const ContactGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ContactCard = styled.div`
  flex: 1 1 320px;
  max-width: 500px;
  text-align: left;
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: transform ${({ theme }) => theme.transition.fast};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CardTitle = styled.h4`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const CardText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MapWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};

  iframe {
    width: 100%;
    height: 250px;
    border: 0;
    border-radius: ${({ theme }) => theme.radii.md};
  }
`;

export default function ContactSection() {
  const { t } = useTranslation("contact");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Title>📍 {t("title", "İletişim")}</Title>

      <ContactGrid>
        <ContactCard>
          <CardTitle>{t("mainOffice.title", "Hauptadresse")}</CardTitle>
          <CardText>
            {t("mainOffice.address")}<br />
            <strong>{t("mainOffice.phoneLabel")}</strong><br />
            +90 212 613 33 09<br />
            +90 531 880 31 51<br />
            +90 531 880 32 15
          </CardText>
          <MapWrapper>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30087.51162522182!2d28.913109103322386!3d41.03833918686434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac8f2c1de2e15%3A0xe7e1c9f7fb9e92f7!2sENSOTEK%20CTP%20Su%20So%C4%9Futma%20Kuleleri%20ve%20Teknolojileri%20M%C3%BChendislik%20San.Tic.%20Ltd.%20%C5%9Eti!5e0!3m2!1str!2str!4v1648764267997"
              allowFullScreen
              loading="lazy"
            />
          </MapWrapper>
        </ContactCard>

        <ContactCard>
          <CardTitle>{t("factory.title", "Fabrikadresse")}</CardTitle>
          <CardText>
            {t("factory.address")}<br />
            <strong>{t("factory.phoneLabel")}</strong><br />
            +90 312 802 02 92<br />
            +90 531 880 32 15
          </CardText>
          <MapWrapper>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3026.442336792944!2d32.55559681543859!3d39.8147959794267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14e78a6c803f8c91%3A0xc0240123f08fa485!2sEnsotek%20Su%20So%C4%9Futma%20Kuleleri!5e0!3m2!1str!2str!4v1649782942337"
              allowFullScreen
              loading="lazy"
            />
          </MapWrapper>
        </ContactCard>
      </ContactGrid>
    </Section>
  );
}

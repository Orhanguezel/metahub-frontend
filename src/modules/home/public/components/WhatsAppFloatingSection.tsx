"use client";

import styled from "styled-components";
import { FaWhatsapp } from "react-icons/fa";
import { useAppSelector } from "@/store/hooks";
import { motion } from "framer-motion";

// Telefon numarasını company slice’tan alıyoruz
export default function WhatsAppFloatingSection() {
  const company = useAppSelector((state) => state.company.company);
  if (!company || !company.phone) return null;

  // Telefon formatı: +49... veya 0... gibi, WhatsApp için rakam filtrele
  const phoneNumber = company.phone.replace(/[^\d]/g, "");
  const whatsUrl = `https://wa.me/${phoneNumber}`;
  const tooltip = "WhatsApp ile bize ulaşın!";

  return (
    <FloatingWrapper
      as={motion.a}
      href={whatsUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={tooltip}
      initial={{ opacity: 0, y: 70 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      aria-label="WhatsApp"
    >
      <FaWhatsapp size={32} />
      <span>WhatsApp</span>
    </FloatingWrapper>
  );
}

// ---- Styled Components ----
const FloatingWrapper = styled.a`
  position: fixed;
  left: 30px;
  bottom: 30px;
  z-index: ${({ theme }) => theme.zIndex.overlay};
  display: flex;
  align-items: center;
  gap: 0.68em;
  padding: 0.92em 1.2em;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.17s;
  cursor: pointer;
  text-decoration: none;

  &:hover, &:focus-visible {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: #fff;
    transform: scale(1.06) translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
    text-decoration: none;
  }

  svg {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    color: #fff;
    filter: drop-shadow(0 2px 6px #2225);
  }

  span {
    display: inline-block;
    @media (max-width: 600px) {
      display: none;
    }
  }

  @media (max-width: 600px) {
    left: 14px;
    bottom: 14px;
    padding: 0.7em 0.85em;
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;


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
    </FloatingWrapper>
  );
}

// ---- Styled Components ----
const FloatingWrapper = styled.a`
  position: fixed;
  left: 234px;
  bottom: 28px;
  z-index: 1201;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 0.85em 1.15em;
  box-shadow: ${({ theme }) => theme.shadows.md};
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  display: flex;
  align-items: center;
  gap: 0.6em;

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

  @media (max-width: 600px) {
    left: 84px;
    bottom: 14px;
    padding: 0.7em 0.85em;
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;


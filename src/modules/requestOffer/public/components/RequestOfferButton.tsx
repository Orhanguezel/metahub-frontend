// src/modules/requestOffer/components/RequestOfferButton.tsx
"use client";

import styled from "styled-components";
import { useState } from "react";
import { HiOutlineTag } from "react-icons/hi";
import RequestOfferModal from "./RequestOfferModal";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

export default function RequestOfferButton() {
  const [open, setOpen] = useState(false);
  const { t } = useI18nNamespace("requestOffer", translations);

  return (
    <>
      <FloatingButton onClick={() => setOpen(true)}>
        <HiOutlineTag size={28} />
        <span>{t("buttonText", "Teklif İste")}</span>
      </FloatingButton>
      {open && <RequestOfferModal open={open} onClose={() => setOpen(false)} />}
    </>
  );
}

const FloatingButton = styled.button`
  position: fixed;
  top: 390px;
  right: 0;
  z-index: 1201;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md} 0 0 ${({ theme }) => theme.radii.md};
  padding: 1.1em 1.25em 1.1em 0.9em;
  box-shadow: ${({ theme }) => theme.shadows.md};
  font-size: 1.1em;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75em;
  cursor: pointer;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);

  span {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 1.04em;
    letter-spacing: 0.01em;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

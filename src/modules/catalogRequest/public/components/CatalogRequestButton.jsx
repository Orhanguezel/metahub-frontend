// src/modules/catalogRequest/components/CatalogRequestButton.tsx
"use client";

import styled from "styled-components";
import { useState } from "react";
import { HiOutlineDocumentText } from "react-icons/hi";
import CatalogRequestModal from "./CatalogRequestModal";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

export default function CatalogRequestButton() {
  const [open, setOpen] = useState(false);
  const { t } = useI18nNamespace("catalogRequest", translations);

  return (
    <>
      <FloatingButton onClick={() => setOpen(true)}>
        <HiOutlineDocumentText size={28} />
        <span>{t("buttonText", "Katalog Talebi")}</span>
      </FloatingButton>
      {open && <CatalogRequestModal open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
const FloatingButton = styled.button`
  position: fixed;
  top: 160px;
  right: 0;
  z-index: 1201;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md} 0 0 ${({ theme }) => theme.radii.md};
  padding: 1.1em 0.25em 1.1em 0.45em;
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
    display: inline;
    transition: opacity 0.16s;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  // SADECE MOBİLDE YAZIYI GİZLE, BUTONU KÜÇÜLT
  @media (max-width: 600px) {
    padding: 0;
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    border-radius: 14px 0 0 14px;
    box-shadow: 0 3px 16px 0 rgba(20,80,180,0.08);
    justify-content: center;
    align-items: center;

    span {
      display: none;
    }
    svg {
      width: 21px;
      height: 21px;
      margin: 0;
    }
  }
`;

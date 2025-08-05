"use client";

import styled from "styled-components";
import { useState } from "react";
import { HiOutlineDocumentText } from "react-icons/hi";
import CatalogRequestModal from "./CatalogRequestModal";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../catalog/locales";

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
}const FloatingButton = styled.button`
  position: fixed;
  top: 160px;
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.modal + 1};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg} 0 0 ${({ theme }) => theme.radii.lg};
  padding: 1.1em 0.32em 1.1em 0.47em;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-family: ${({ theme }) => theme.fonts.body};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  cursor: pointer;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  transition:
    background ${({ theme }) => theme.transition.fast},
    color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  span {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: ${({ theme }) => theme.fontSizes.base};
    letter-spacing: 0.01em;
    display: inline;
    font-family: ${({ theme }) => theme.fonts.body};
    transition: opacity ${({ theme }) => theme.transition.fast};
  }

  &:hover, &:focus-visible {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: ${({ theme }) => theme.colors.buttonText};
    box-shadow: ${({ theme }) => theme.shadows.xl};
    outline: none;
  }

  &:active {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  // SADECE MOBİLDE YAZIYI GİZLE, BUTONU KÜÇÜLT (aynen önceki gibi)
  @media (max-width: 600px) {
    top: 114px;
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    border-radius: 14px 0 0 14px;
    box-shadow: 0 3px 16px 0 rgba(20,80,180,0.08);
    justify-content: center;
    align-items: center;
    padding: 0;

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

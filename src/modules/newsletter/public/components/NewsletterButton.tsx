"use client";

import styled from "styled-components";
import { useState } from "react";
import { HiOutlineMailOpen } from "react-icons/hi";
import NewsletterModal from "./NewsletterModal";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

export default function NewsletterButton() {
  const [open, setOpen] = useState(false);
  const { t } = useI18nNamespace("newsletter", translations);

  return (
    <>
      <FloatingButton
        aria-label={t("buttonText", "E-Bülten")}
        onClick={() => setOpen(true)}
      >
        <HiOutlineMailOpen size={28} />
        <span>{t("buttonText", "E-Bülten")}</span>
      </FloatingButton>
      {open && <NewsletterModal open={open} onClose={() => setOpen(false)} />}
    </>
  );
}

const FloatingButton = styled.button`
  position: fixed;
  top: 600px;
  right: 0;
  z-index: 1201;
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md} 0 0 ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  align-items: center;
  gap: 0.75em;
  cursor: pointer;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  padding: 1.1em 0.25em 1.1em 0.45em;
  font-size: 1.1em;
  font-weight: 600;

  span {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 1.04em;
    letter-spacing: 0.01em;
    display: inline;
    transition: opacity 0.16s;
  }

  &:hover, &:focus-visible {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  // Mobilde: sadece ikon!
  @media (max-width: 600px) {
    top: 224px;
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

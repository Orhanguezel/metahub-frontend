"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  subscribeNewsletter,
  clearNewsletterState,
} from "@/modules/newsletter/slice/newsletterSlice";

export default function NewsletterModal({
  onClose,
  top = 120, // px ya da "3rem"
}: {
  open: boolean;
  onClose: () => void;
  top?: number | string;
}) {
  const { t } = useI18nNamespace("newsletter", translations);
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const { loading, error, successMessage } = useAppSelector((state) => state.newsletter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(subscribeNewsletter({ email })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setTimeout(() => {
          dispatch(clearNewsletterState());
          onClose();
        }, 1400);
      }
    });
  };

  const handleClose = () => {
    dispatch(clearNewsletterState());
    onClose();
  };

  const offsetTop = typeof top === "number" ? `${top}px` : top;

  return (
    <Overlay onClick={handleClose}>
      <Modal
        initial={{ x: 360, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 360, opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
        $offsetTop={offsetTop}   // <-- transient prop (DOM'a gitmez)
        role="dialog"
        aria-modal="true"
        aria-label={t("modalTitle", "E-Bülten Aboneliği")}
      >
        <CloseButton onClick={handleClose} aria-label={t("admin.close", "Kapat")}>
          ×
        </CloseButton>
        <ModalTitle>{t("modalTitle", "E-Bülten Aboneliği")}</ModalTitle>

        {successMessage ? (
          <SuccessMsg>{t("success", "Teşekkürler! E-bültenimize abone oldunuz.")}</SuccessMsg>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off">
            <Input
              placeholder={t("form.email", "E-posta adresiniz")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              aria-label={t("form.email", "E-posta adresiniz")}
            />
            <SubmitBtn type="submit" disabled={loading}>
              {loading ? t("form.loading", "Gönderiliyor...") : t("form.subscribe", "Abone Ol")}
            </SubmitBtn>
            {error && <ErrorMsg>{error}</ErrorMsg>}
          </form>
        )}
      </Modal>
    </Overlay>
  );
}

/* ---------------- THEME-SUPPORTED STYLES ---------------- */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayBackground};
  z-index: ${({ theme }) => theme.zIndex.overlay};
`;

const Modal = styled(motion.div)<{ $offsetTop: string }>`
  width: 370px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl} 0 0 ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacings.xl} ${({ theme }) => theme.spacings.lg}
    ${({ theme }) => theme.spacings.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  flex-direction: column;
  min-height: 180px;
  font-family: ${({ theme }) => theme.fonts.main};

  /* Sağdan kayan panel: üst boşluk props ile kontrol ediliyor */
  position: fixed;
  right: 0;
  top: ${({ $offsetTop }) => $offsetTop};
  margin: 0;

  /* Mobilde tam genişlik ve top:0 */
  ${({ theme }) => theme.media.small} {
    width: 100vw;
    right: 0;
    left: 0;
    top: 0;
    border-radius: 0;
    min-height: unset;
    padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.sm};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 18px;
  font-size: 2em;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.65;
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transition.fast};
  &:hover { opacity: 1; }
`;

const ModalTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: -0.5px;
`;

const Input = styled.input`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacings.sm};
  padding: 0.9em 1em;
  font-size: ${({ theme }) => theme.fontSizes.base};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.fonts.body};
  transition: border ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    outline: 0;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
    opacity: 1;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.85em 1em;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    outline: none;
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabledBg};
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
    opacity: ${({ theme }) => theme.opacity.disabled};
  }
`;

const SuccessMsg = styled.div`
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacings.xl};
  font-family: ${({ theme }) => theme.fonts.body};
`;

const ErrorMsg = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.base};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacings.md};
  font-family: ${({ theme }) => theme.fonts.body};
`;

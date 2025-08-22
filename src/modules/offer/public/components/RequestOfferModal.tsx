"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../offer/locales";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  sendRequestOffer,
  clearRequestOfferMessages,
} from "@/modules/offer/slice/requestOfferSlice";
import type { RequestOfferPayload } from "@/modules/offer/types";
import { useRouter } from "next/navigation";

type PT = RequestOfferPayload["productType"];

export default function RequestOfferModal({
  onClose,
  defaultProductId,
  defaultProductType,
  top = 120, // üst boşluk (px ya da "3rem")
}: {
  open?: boolean;
  onClose: () => void;
  defaultProductId?: string;
  defaultProductType?: RequestOfferPayload["productType"];
  top?: number | string;
}) {
  const { t, i18n } = useI18nNamespace("offer", translations);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, successMessage, customerId, offerId } = useAppSelector(
    (s) => s.requestOffer
  );

  // ürün state'leri
  const { ensotekprod: ensotekProducts } = useAppSelector((s) => s.ensotekprod);
  const { sparepart: spareparts } = useAppSelector((s) => s.sparepart);
  const { bikes: bikesList } = useAppSelector((s) => s.bikes);

  // i18n dili
  const lang = (i18n.language?.split("-")[0] || "en") as string;

  // i18n label getter (callback)
  const getTypeLabel = useCallback(
    (value: Exclude<PT, undefined>) => t(`productTypes.${value}`),
    [t]
  );

  // Dinamik ürün tipleri
  const productTypes = useMemo(
    () =>
      ([
        ensotekProducts?.length
          ? {
              value: "ensotekprod" as const,
              label: getTypeLabel("ensotekprod"),
              options: ensotekProducts,
            }
          : null,
        spareparts?.length
          ? {
              value: "sparepart" as const,
              label: getTypeLabel("sparepart"),
              options: spareparts,
            }
          : null,
        bikesList?.length
          ? {
              value: "bikes" as const,
              label: getTypeLabel("bikes"),
              options: bikesList,
            }
          : null,
      ].filter(Boolean) as {
        value: Exclude<PT, undefined>;
        label: string;
        options: any[];
      }[]),
    [ensotekProducts, spareparts, bikesList, getTypeLabel]
  );

  const [form, setForm] = useState<RequestOfferPayload>({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    productId: defaultProductId || "",
    productType: defaultProductType || (productTypes[0]?.value ?? undefined),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "productType") {
      setForm((prev) => ({ ...prev, productType: value as PT, productId: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const currentType = productTypes.find((pt) => pt.value === form.productType);
  const currentOptions = currentType?.options || [];

  // başarıda yönlendir
  useEffect(() => {
    if (successMessage && customerId && offerId) {
      const timeout = setTimeout(() => {
        onClose();
        router.push(`/offer?customerId=${customerId}&offerId=${offerId}`);
        dispatch(clearRequestOfferMessages());
      }, 1700);
      return () => clearTimeout(timeout);
    }
  }, [successMessage, customerId, offerId, onClose, router, dispatch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch(sendRequestOffer(form));
  }

  // çok dilli alan seçici
  const pickLocalized = (obj: any, lng: string) =>
    obj?.[lng] ?? obj?.tr ?? obj?.en ?? (obj ? Object.values(obj)[0] : "");

  const offsetTop = typeof top === "number" ? `${top}px` : top;

  return (
    <Overlay onClick={onClose}>
      <Modal
        initial={{ x: 360, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 360, opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
        $offsetTop={offsetTop}        // <-- transient prop
        role="dialog"
        aria-modal="true"
        aria-label={t("modalTitle")}
      >
        <CloseButton onClick={onClose} aria-label={t("admin.close", "Close")}>
          ×
        </CloseButton>
        <ModalTitle>{t("modalTitle")}</ModalTitle>

        {successMessage ? (
          <SuccessMsg>{successMessage}</SuccessMsg>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off">
            <Input
              name="name"
              placeholder={t("form.name")}
              required
              value={form.name}
              onChange={handleChange}
              disabled={loading}
            />
            <Input
              name="email"
              type="email"
              placeholder={t("form.email")}
              required
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
            <Input
              name="company"
              placeholder={t("form.company")}
              required
              value={form.company}
              onChange={handleChange}
              disabled={loading}
            />
            <Input
              name="phone"
              placeholder={t("form.phone")}
              required
              value={form.phone}
              onChange={handleChange}
              disabled={loading}
            />

            {productTypes.length > 0 && (
              <Select
                name="productType"
                value={form.productType || ""}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="">{t("form.productType")}</option>
                {productTypes.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </Select>
            )}

            {currentOptions?.length > 0 && (
              <Select
                name="productId"
                value={form.productId}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="">{t("form.productId")}</option>
                {currentOptions.map((item: any) => (
                  <option key={item._id} value={item._id}>
                    {typeof item.name === "object" ? pickLocalized(item.name, lang) : item.name}
                  </option>
                ))}
              </Select>
            )}

            <Textarea
              name="message"
              placeholder={t("form.message")}
              value={form.message}
              onChange={handleChange}
              disabled={loading}
            />
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <SubmitBtn
              type="submit"
              disabled={
                loading ||
                !form.productId ||
                !form.productType ||
                !form.name ||
                !form.email ||
                !form.company ||
                !form.phone
              }
            >
              {loading ? t("form.sending") : t("form.send")}
            </SubmitBtn>
          </form>
        )}
      </Modal>
    </Overlay>
  );
}

/* ---------- styled ---------- */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayBackground};
  z-index: ${({ theme }) => theme.zIndex.overlay};
`;

const Modal = styled(motion.div)<{ $offsetTop: string }>`
  width: 380px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.xl} 0 0 ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.xl}
    ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.xl};
  box-shadow: ${({ theme }) => theme.shadows.form};
  position: fixed;
  right: 0;
  top: ${({ $offsetTop }) => $offsetTop};   /* <-- transient prop DOM’a gitmez */
  display: flex;
  flex-direction: column;
  min-height: 350px;
  font-family: ${({ theme }) => theme.fonts.body};

  ${({ theme }) => theme.media.xsmall} {
    width: 100vw;
    border-radius: 0;
    right: 0;
    left: 0;
    top: 0;
    padding: ${({ theme }) => theme.spacings.lg};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacings.md};
  right: ${({ theme }) => theme.spacings.lg};
  font-size: 2.1em;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.66;
  cursor: pointer;
  z-index: 2;
  transition: opacity ${({ theme }) => theme.transition.fast};
  &:hover { opacity: 1; }
`;

const ModalTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: 0.01em;
`;

const Input = styled.input`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacings.md};
  padding: 0.95em 1em;
  font-size: ${({ theme }) => theme.fontSizes.base};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  transition: border ${({ theme }) => theme.transition.fast};
  font-family: ${({ theme }) => theme.fonts.body};
  &:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    outline: none;
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
    opacity: 1;
  }
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 66px;
  margin-bottom: ${({ theme }) => theme.spacings.md};
  padding: 0.95em 1em;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.inputBackground};
  font-family: ${({ theme }) => theme.fonts.body};
  resize: vertical;
  transition: border ${({ theme }) => theme.transition.fast};
  &:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    outline: none;
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
    opacity: 1;
  }
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
    cursor: not-allowed;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1em 1em;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  margin-top: ${({ theme }) => theme.spacings.sm};
  transition: background ${({ theme }) => theme.transition.fast};
  font-family: ${({ theme }) => theme.fonts.body};
  letter-spacing: 0.01em;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.buttons.primary.backgroundHover}; }
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.disabledBg};
  }
`;

const SuccessMsg = styled.div`
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacings.xl};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const ErrorMsg = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.body};
`;

const Select = styled.select`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacings.md};
  padding: 0.95em 1em;
  font-size: ${({ theme }) => theme.fontSizes.base};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  transition: border ${({ theme }) => theme.transition.fast};
  &:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    outline: none;
  }
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
    cursor: not-allowed;
  }
`;

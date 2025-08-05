"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../offer/locales";
import { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  sendRequestOffer,
  clearRequestOfferMessages,
} from "@/modules/offer/slice/requestOfferSlice";
import type { RequestOfferPayload } from "@/modules/offer/types";
import { useRouter } from "next/navigation"; // <-- eklendi

interface Props {
  open: boolean;
  onClose: () => void;
  defaultProductId?: string;
  defaultProductType?: RequestOfferPayload["productType"];
}

export default function RequestOfferModal({
  onClose,
  defaultProductId,
  defaultProductType,
}: Props) {
  const { t, i18n } = useI18nNamespace("offer", translations);
  const lang = (i18n.language?.slice(0, 2) as any) || "en";
  const dispatch = useAppDispatch();
  const router = useRouter(); // <-- eklendi
  const { loading, error, successMessage, customerId, offerId } = useAppSelector((s) => s.requestOffer);

  // Tüm ürün state'lerini alın
  const { ensotekprod } = useAppSelector((s) => s.ensotekprod);
  const { sparepart } = useAppSelector((s) => s.sparepart);
  const { bikes } = useAppSelector((s) => s.bikes);

  // Dinamik ürün tipleri ve seçenekler
  const productTypes = useMemo(
    () =>
      [
        ensotekprod?.length ? { value: "ensotekprod", label: "Ensotek Ürünü", options: ensotekprod } : null,
        sparepart?.length ? { value: "sparepart", label: "Yedek Parça", options: sparepart } : null,
        bikes?.length ? { value: "bikes", label: "Bisiklet", options: bikes } : null,
      ].filter(Boolean) as {
        value: RequestOfferPayload["productType"];
        label: string;
        options: any[];
      }[],
    [ensotekprod, sparepart, bikes]
  );

  // Adres bilgisi gerekiyorsa state'e ekle
  const [form, setForm] = useState<RequestOfferPayload>({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    productId: defaultProductId || "",
    productType: defaultProductType || (productTypes[0]?.value ?? undefined),
  });

  // Ürün tipi değişirse ürün id sıfırlanır!
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "productType") {
      setForm((prev) => ({ ...prev, productType: value as any, productId: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Seçili ürün tipi ve ürünler
  const currentType = productTypes.find((pt) => pt.value === form.productType);
  const currentOptions = currentType?.options || [];

  // --- BAŞARIYLA YANIT ALINCA YÖNLENDİR ---
  useEffect(() => {
    if (successMessage && customerId && offerId) {
      // 1.7 saniye sonra yönlendir ve modalı kapat
      const timeout = setTimeout(() => {
        onClose(); // modalı kapat
        router.push(`/offer?customerId=${customerId}&offerId=${offerId}`);
        dispatch(clearRequestOfferMessages());
      }, 1700);
      return () => clearTimeout(timeout);
    }
  }, [successMessage, customerId, offerId, onClose, router, dispatch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch(sendRequestOffer(form));
    // Unwrap artık gerek yok, yönlendirme useEffect ile
  }

  return (
    <Overlay onClick={onClose}>
      <Modal
        as={motion.div}
        initial={{ x: 360, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 360, opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={e => e.stopPropagation()}
      >
        <CloseButton onClick={onClose}>×</CloseButton>
        <ModalTitle>{t("modalTitle", "Teklif İste Formu")}</ModalTitle>
        {successMessage ? (
          <SuccessMsg>{successMessage}</SuccessMsg>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off">
            <Input
              name="name"
              placeholder={t("form.name", "Ad Soyad")}
              required
              value={form.name}
              onChange={handleChange}
              disabled={loading}
            />
            <Input
              name="email"
              type="email"
              placeholder={t("form.email", "E-posta")}
              required
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
            <Input
              name="company"
              placeholder={t("form.company", "Firma Adı")}
              required
              value={form.company}
              onChange={handleChange}
              disabled={loading}
            />
            <Input
              name="phone"
              placeholder={t("form.phone", "Telefon")}
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
                <option value="">{t("form.productType", "Ürün tipi seçiniz")}</option>
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
                <option value="">{t("form.productId", "Ürün seçiniz")}</option>
                {currentOptions.map((item) => (
                  <option key={item._id} value={item._id}>
                    {typeof item.name === "object"
                      ? item.name[lang] ||
                        item.name.tr ||
                        item.name.en ||
                        Object.values(item.name)[0]
                      : item.name}
                  </option>
                ))}
              </Select>
            )}
            <Textarea
              name="message"
              placeholder={t("form.message", "İstediğiniz ürün/hizmet ve ek notunuz...")}
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
              {loading ? t("form.sending", "Gönderiliyor...") : t("form.send", "Gönder")}
            </SubmitBtn>
          </form>
        )}
      </Modal>
    </Overlay>
  );
}

// --- Styled Components (aynen kalsın) ---
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(30, 38, 51, 0.42);
  z-index: 1400;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
`;
const Modal = styled.div`
  width: 360px;
  background: #fff;
  border-radius: 16px 0 0 16px;
  margin: 2.7rem 0 0 0;
  padding: 2.1rem 2rem 1.5rem 2rem;
  box-shadow: 0 10px 32px #2227;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 350px;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 12px; right: 18px;
  font-size: 2em;
  background: none;
  border: none;
  color: #444;
  opacity: 0.6;
  cursor: pointer;
  &:hover { opacity: 1; }
`;
const ModalTitle = styled.div`
  font-size: 1.36em;
  font-weight: 700;
  margin-bottom: 1.1em;
  color: #1e2633;
`;
const Input = styled.input`
  width: 100%; margin-bottom: 1em;
  padding: 0.9em 1em; font-size: 1em; border-radius: 7px;
  border: 1.4px solid #e0e0e0;
  &:focus { border-color: #F97316; outline: none; }
`;
const Textarea = styled.textarea`
  width: 100%; min-height: 60px;
  margin-bottom: 1em; padding: 0.9em 1em;
  border-radius: 7px; border: 1.4px solid #e0e0e0; font-size: 1em;
  &:focus { border-color: #F97316; outline: none; }
`;
const SubmitBtn = styled.button`
  width: 100%; background: #F97316;
  color: #fff; border: none; border-radius: 7px;
  padding: 0.87em 1em; font-size: 1.08em;
  font-weight: 600; cursor: pointer;
  box-shadow: 0 2px 14px #F9731633;
  transition: background 0.18s;
  &:hover { background: #EA580C; }
`;
const SuccessMsg = styled.div`
  color: #0b933c; font-size: 1.19em; text-align: center; margin-top: 2.5em;
`;
const ErrorMsg = styled.div`
  color: #c62a2a;
  font-size: 1.03em;
  margin-bottom: 1.1em;
  text-align: center;
`;
const Select = styled.select`
  width: 100%;
  margin-bottom: 1em;
  padding: 0.85em 1em;
  font-size: 1em;
  border-radius: 7px;
  border: 1.4px solid #e0e0e0;
  background: #fff;
  &:focus { border-color: #F97316; outline: none; }
`;

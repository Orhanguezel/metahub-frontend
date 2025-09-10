"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/coupon/locales";
import type { SupportedLocale } from "@/types/common";
import { motion } from "framer-motion";
import { PiTicketFill } from "react-icons/pi";
import { MdClose } from "react-icons/md";

export default function WelcomeCouponBanner() {
  const { i18n, t } = useI18nNamespace("coupon", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // store
  const coupons = useAppSelector((s) => s.coupon.coupons);

  // aktif/geçerli kuponu hesapla (now'ı dependency yapmayalım; her render değişmesin)
  const activeCoupon = useMemo(() => {
    if (!coupons?.length) return undefined;
    const now = Date.now();
    return coupons.find(
      (c) => c.isActive && (!c.expiresAt || new Date(c.expiresAt).getTime() > now)
    );
  }, [coupons]);

  // ⬇️ Hook'lar her zaman çalışır (erken return'dan önce)
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!activeCoupon) {
      setVisible(false);
      return;
    }
    if (typeof window === "undefined") return;
    const key = `coupon:dismissed:${activeCoupon.code}`;
    const isDismissed = window.localStorage.getItem(key) === "1";
    setVisible(!isDismissed);
  }, [activeCoupon]);

  const close = () => {
    if (activeCoupon) {
      try {
        window?.localStorage?.setItem(`coupon:dismissed:${activeCoupon.code}`, "1");
      } catch {}
    }
    setVisible(false);
  };

  if (!activeCoupon || !visible) return null;

  const title =
    activeCoupon.title?.[lang] ||
    activeCoupon.title?.en ||
    t("defaultTitle", "Welcome Coupon!");
  const desc =
    activeCoupon.description?.[lang] ||
    activeCoupon.description?.en ||
    t("defaultDesc", "Enjoy your special welcome discount!");

  return (
    <FixedWrap
      as={motion.div}
      role="region"
      aria-label="Welcome Coupon Banner"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <BannerCard>
        <CloseBtn onClick={close} aria-label={t("close", "Close")}>
          <MdClose size={18} />
        </CloseBtn>

        <IconWrap aria-hidden>
          <PiTicketFill size={40} />
        </IconWrap>

        <TextCol>
          <TopRow>
            <PromoBadge aria-hidden>Promo</PromoBadge>
            <BannerTitle>{title}</BannerTitle>
          </TopRow>

          <BannerDesc>{desc}</BannerDesc>

          <Row>
            <Code>
              {t("code", "Code")}: <b>{activeCoupon.code}</b>
            </Code>
            <Discount>
              {t("discount", "Discount")}: <b>%{activeCoupon.discount}</b>
            </Discount>
            {activeCoupon.expiresAt && (
              <Expires>
                {t("expires", "Expires")}:{" "}
                <b>{new Date(activeCoupon.expiresAt).toLocaleDateString(lang)}</b>
              </Expires>
            )}
          </Row>
        </TextCol>
      </BannerCard>
    </FixedWrap>
  );
}

/* ===== Styles ===== */

const FixedWrap = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
  z-index: ${({ theme }) => (theme.zIndex?.overlay ?? 1200) + 2};
  display: flex;
  justify-content: center;
  pointer-events: none;
  padding: 0 12px;
`;

const BannerCard = styled.div`
  pointer-events: auto;
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacings.md};
  box-sizing: border-box;

  width: clamp(300px, 92vw, 600px);
  min-height: 96px;

  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.xl};
  background-image: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.inputBackgroundSofter} 0%,
    ${({ theme }) => theme.colors.cardBackground} 100%
  );
  overflow: hidden;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: ${({ theme }) => theme.radii.circle};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 2;
  box-shadow: ${({ theme }) => theme.shadows.xs};
  transition: transform ${({ theme }) => theme.transition.fast},
              background ${({ theme }) => theme.transition.fast},
              box-shadow ${({ theme }) => theme.transition.fast};
  &:hover { transform: scale(1.06); background: ${({ theme }) => theme.colors.hoverBackground}; box-shadow: ${({ theme }) => theme.shadows.sm}; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.colors.shadowHighlight}; }
`;

const IconWrap = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  filter: drop-shadow(0 2px 8px rgba(0,0,0,.12));
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const TextCol = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  min-width: 0;
`;

const PromoBadge = styled.span`
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.warningBackground};
  color: ${({ theme }) => theme.colors.textOnWarning};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  flex-shrink: 0;
`;

const BannerTitle = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  line-height: 1.15;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BannerDesc = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Row = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xs};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  overflow-wrap: anywhere;
`;

const Code = styled.span`
  background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px 12px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.primary};
`;

const Discount = styled.span`
  color: ${({ theme }) => theme.colors.success};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Expires = styled.span`
  color: ${({ theme }) => theme.colors.warning};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

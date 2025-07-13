// src/shared/WelcomeCouponBanner.tsx
"use client";

import styled, { useTheme } from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { SupportedLocale } from "@/types/common";
import { motion } from "framer-motion";
import { PiTicketFill } from "react-icons/pi";

export default function WelcomeCouponBanner() {
   const { i18n, t } = useI18nNamespace("coupon", translations);
    const lang = (i18n.language?.slice(0, 2)) as SupportedLocale; 
  // Sadece admin tarafından current'a set edilen coupon gösterilecek
  const coupon = useAppSelector((s) => s.coupon.current);
  const theme = useTheme();

  // Eğer hoşgeldin kuponu yoksa veya özel gösterim kuralı varsa burada kontrol et
  if (!coupon) return null;

  // (Opsiyonel) — Müşteri segmentasyonu (örn. sadece üyelere göster)
  // const isMember = useAppSelector((s) => s.account.profile?.isMember); // örnek
  // if (!isMember) return null;

  // Çok dilli title/desc çek
  const title =
    coupon.title?.[lang] ||
    coupon.title?.en ||
    t("defaultTitle", "Welcome Coupon!");
  const desc =
    coupon.description?.[lang] ||
    coupon.description?.en ||
    t("defaultDesc", "Enjoy your special welcome discount!");

  const bgColor = (theme.colors.primaryLight ?? "#f1e3c0") + "22";

  return (
    <Banner
      as={motion.div}
      initial={{ opacity: 0, y: -28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", delay: 0.1, stiffness: 170 }}
      $bg={bgColor}
      aria-label="Welcome Coupon Banner"
    >
      <Left>
        <TicketIcon>
          <PiTicketFill size={46} color={theme.colors.primary} />
        </TicketIcon>
        <div>
          <BannerTitle>{title}</BannerTitle>
          <BannerDesc>{desc}</BannerDesc>
          <BannerRow>
            <Code>
              {t("code", "Code")}: <b>{coupon.code}</b>
            </Code>
            <Discount>
              {t("discount", "Discount")}: <b>%{coupon.discount}</b>
            </Discount>
            {coupon.expiresAt && (
              <Expires>
                {t("expires", "Expires")}:{" "}
                <b>{new Date(coupon.expiresAt).toLocaleDateString(lang)}</b>
              </Expires>
            )}
          </BannerRow>
        </div>
      </Left>
      <CtaButton
        as={motion.button}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        {t("cta", "Use Now")}
      </CtaButton>
    </Banner>
  );
}

// --- Styled Components ---
const Banner = styled.div<{ $bg: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: ${({ $bg }) => $bg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => `${theme.spacings.xl} ${theme.spacings.xxl}`};
  gap: ${({ theme }) => theme.spacings.lg};
  margin: ${({ theme }) => theme.spacings.xl} 0 0 0;
  min-height: 110px;

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    padding: ${({ theme }) => theme.spacings.lg};
    gap: ${({ theme }) => theme.spacings.sm};
    align-items: flex-start;
  }
`;

const Left = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.md};
  align-items: flex-start;
`;

const TicketIcon = styled.div`
  margin-right: ${({ theme }) => theme.spacings.sm};
  flex-shrink: 0;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
`;

const BannerTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2px;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const BannerDesc = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

const BannerRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  align-items: center;
  flex-wrap: wrap;
`;

const Code = styled.span`
  background: ${({ theme }) => theme.colors.primary + "10"};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px 12px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacings: 1px;
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

const CtaButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  padding: 10px 34px;
  border-radius: 999px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: none;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  margin-left: auto;
  font-family: ${({ theme }) => theme.fonts.body};
  transition: background 0.22s;

  ${({ theme }) => theme.media.small} {
    width: 100%;
    margin-left: 0;
    margin-top: ${({ theme }) => theme.spacings.sm};
  }
`;

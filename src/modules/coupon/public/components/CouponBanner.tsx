"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/coupon/locales";
import { SupportedLocale } from "@/types/common";
import { motion } from "framer-motion";
import { PiTicketFill } from "react-icons/pi";

// 🔥 En güncel, aktif ve geçerli kuponu göstermek için filtre uygula
export default function WelcomeCouponBanner() {
  const { i18n, t } = useI18nNamespace("coupon", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Tüm public couponlar slice'ta coupons dizisi olarak bulunuyor
  const coupons = useAppSelector((s) => s.coupon.coupons);

  // Publicte aktif/geçerli bir kuponu göster (örneğin ilk aktif/valid kuponu al)
  const now = Date.now();
  const activeCoupon = coupons?.find(
    (c) =>
      c.isActive &&
      (!c.expiresAt || new Date(c.expiresAt).getTime() > now)
  );

  if (!activeCoupon) return null; // Aktif kupon yoksa banner gösterme

  const title =
    activeCoupon.title?.[lang] ||
    activeCoupon.title?.en ||
    t("defaultTitle", "Welcome Coupon!");

  const desc =
    activeCoupon.description?.[lang] ||
    activeCoupon.description?.en ||
    t("defaultDesc", "Enjoy your special welcome discount!");

  // Banner için arka plan rengi (temadan alabilirsin veya sabit verebilirsin)
  const bgColor = "#f2f6ff"; // veya theme'den theme.colors.primaryLight gibi

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
          <PiTicketFill size={46} />
        </TicketIcon>
        <div>
          <BannerTitle>{title}</BannerTitle>
          <BannerDesc>{desc}</BannerDesc>
          <BannerRow>
            <Code>
              {t("code", "Code")}: <b>{activeCoupon.code}</b>
            </Code>
            <Discount>
              {t("discount", "Discount")}: <b>%{activeCoupon.discount}</b>
            </Discount>
            {activeCoupon.expiresAt && (
              <Expires>
                {t("expires", "Expires")}:{" "}
                <b>
                  {new Date(activeCoupon.expiresAt).toLocaleDateString(lang)}
                </b>
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

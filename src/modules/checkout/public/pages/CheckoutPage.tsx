"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import styled from "styled-components";
import checkoutTranslations from "@/modules/checkout/locales";
import { accountTranslations } from "@/modules/users";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { clearCart } from "@/modules/cart/slice/cartSlice";
import { createOrder } from "@/modules/order/slice/ordersSlice";
import { getMultiLang } from "@/types/common";
import type { SupportedLocale } from "@/types/common";
import type { Address } from "@/modules/users/types/address";
import type { PaymentMethod } from "@/modules/order/types";

// Payment methods: Çeviri anahtarları!
const PAYMENT_METHODS = [
  { value: "credit_card", label: "checkout:payment_credit_card" },
  { value: "paypal", label: "checkout:payment_paypal" },
  { value: "cash_on_delivery", label: "checkout:payment_cash_on_delivery" },
];

const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { cart, loading, error } = useAppSelector((state) => state.cart);
  const { profile } = useAppSelector((state) => state.account);
  const { addresses } = useAppSelector((state) => state.address);

  const { t, i18n } = useI18nNamespace("checkout", checkoutTranslations);
  const { t: tAccount } = useI18nNamespace("account", accountTranslations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Sadece "shipping" adresleri
  const shippingAddresses: Address[] = useMemo(
    () => (addresses || []).filter(a => a.addressType === "shipping"),
    [addresses]
  );

  // Default teslimat adresi
  const defaultShippingAddress: Address | undefined = useMemo(
    () =>
      shippingAddresses.find(a => a.isDefault) ||
      shippingAddresses[0],
    [shippingAddresses]
  );

  // Router korumaları
  useEffect(() => {
    if (!profile) router.replace("/login?redirected=checkout");
  }, [profile, router]);

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) router.replace("/cart");
  }, [cart, router]);

  useEffect(() => {
    if (profile && (!shippingAddresses || shippingAddresses.length === 0)) {
      setTimeout(() => {
        alert(t("no_shipping_address", "Lütfen önce bir teslimat adresi ekleyin. Yönlendiriliyorsunuz..."));
        router.replace("/account");
      }, 300);
    }
  }, [profile, shippingAddresses, router, t]);

  if (!profile || !defaultShippingAddress || !cart) return null;

  // Sipariş oluşturma
  const handleCompleteOrder = async () => {
    if (placingOrder) return;
    setPlacingOrder(true);

    const orderData = {
      items: cart.items.map((item) => ({
        product: typeof item.product === "object" ? item.product._id : item.product,
        productType: item.productType,
        quantity: item.quantity,
        tenant: cart.tenant ?? "main",
        unitPrice: item.priceAtAddition,
        priceAtAddition: item.priceAtAddition,
        totalPriceAtAddition: item.totalPriceAtAddition,
      })),
      totalPrice: cart.totalPrice,
      paymentMethod: paymentMethod as PaymentMethod,
      tenant: cart.tenant ?? "main",
      addressId: defaultShippingAddress._id,
      shippingAddress: {
        name: profile.name || "",
        phone: defaultShippingAddress.phone || "",
        tenant: cart.tenant ?? "main",
        street: defaultShippingAddress.street || "",
        houseNumber: defaultShippingAddress.houseNumber || "",
        city: defaultShippingAddress.city || "",
        postalCode: defaultShippingAddress.postalCode || "",
        country: defaultShippingAddress.country || "",
        email: profile.email || "",
        addressType: defaultShippingAddress.addressType || "shipping",
      },
    };

    try {
      await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      router.replace("/order/success");
    } catch (err: any) {
      alert(t("error", "Sipariş oluşturulamadı!") + ` ${err.message || err}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading || placingOrder) {
    return <PageContainer>{t("loading", "Yükleniyor...")}</PageContainer>;
  }
  if (error) {
    return (
      <PageContainer>
        <Title>{t("error", "Hata")}</Title>
        <div style={{ color: "#ED3030" }}>{error}</div>
      </PageContainer>
    );
  }

  // --- Render ---
  return (
    <PageContainer>
      <Title>{t("title", "Sipariş Onayı")}</Title>
      <CheckoutLayout>
        {/* Adres Bölümü */}
        <FormSection>
          <SectionTitle>{t("shipping_address", "Teslimat Adresi")}</SectionTitle>
          <InnerFormLayout>
            <InputGroup>
              <Label>{t("fullName", "Ad Soyad")}</Label>
              <Input value={profile.name} disabled readOnly />
            </InputGroup>
            <InputGroup>
              <Label>{tAccount("addressType", "Adres Tipi")}</Label>
              <Input value={tAccount(`address.type.${defaultShippingAddress.addressType}`)} disabled readOnly />

            </InputGroup>
            <InputGroup>
              <Label>{t("street", "Cadde / Sokak")}</Label>
              <Input
                value={
                  defaultShippingAddress.street +
                  (defaultShippingAddress.houseNumber ? ` ${defaultShippingAddress.houseNumber}` : "")
                }
                disabled
                readOnly
              />
            </InputGroup>
            <InputGroup>
              <Label>{t("city", "Şehir")}</Label>
              <Input value={defaultShippingAddress.city} disabled readOnly />
            </InputGroup>
            <InputGroup>
              <Label>{t("zipCode", "Posta Kodu")}</Label>
              <Input value={defaultShippingAddress.postalCode} disabled readOnly />
            </InputGroup>
            <InputGroup>
              <Label>{t("country", "Ülke")}</Label>
              <Input value={defaultShippingAddress.country} disabled readOnly />
            </InputGroup>
            <InputGroup>
              <Label>{t("phone", "Telefon")}</Label>
              <Input value={defaultShippingAddress.phone} disabled readOnly />
            </InputGroup>
            <InputGroup>
              <Label>{t("email", "E-Posta")}</Label>
              <Input value={profile.email} disabled readOnly />
            </InputGroup>
          </InnerFormLayout>
        </FormSection>

        {/* Sipariş Özeti ve Ödeme */}
        <SummarySection>
          <SectionTitle>{t("order_summary", "Sipariş Özeti")}</SectionTitle>
          <SummaryList>
            {(cart.items || []).map((item, idx) => {
              const key =
                typeof item.product === "object" && item.product && "_id" in item.product
                  ? (item.product._id || `unknown-${idx}`)
                  : (item.product || `id-${idx}`);
              if (!item.product)
                return <li key={key} style={{ color: "#e33" }}>{t("error_product_not_found", "Ürün bulunamadı!")}</li>;
              return (
                <li key={key}>
                  <span>
                    <h2>{getMultiLang((item.product as any)?.name, lang) || "-"}</h2>
                    <b>{item.quantity}</b>
                  </span>
                  <span>
                    {(item.quantity * item.priceAtAddition).toFixed(2)} €
                  </span>
                </li>
              );
            })}
          </SummaryList>
          <TotalRow>
            <span>{t("total", "Toplam")}:</span>
            <b>{cart.totalPrice.toFixed(2)} €</b>
          </TotalRow>

          <PaymentSection>
            <PaymentTitle>{t("payment_method", "Ödeme Yöntemi")}</PaymentTitle>
            <PaymentOptions>
              {PAYMENT_METHODS.map((method) => (
                <label key={method.value}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                  />
                  {t(method.label)}
                </label>
              ))}
            </PaymentOptions>
          </PaymentSection>

          <OrderButton
            onClick={handleCompleteOrder}
            disabled={placingOrder || !paymentMethod}
          >
            {t("complete_order", "Siparişi Tamamla")}
          </OrderButton>
        </SummarySection>
      </CheckoutLayout>
    </PageContainer>
  );
};

export default CheckoutPage;

// --- Styled Components ---
const PageContainer = styled.div`
  max-width: 900px;
  margin: 48px auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-align: center;
`;

const CheckoutLayout = styled.div`
  display: flex;
  gap: 2.5rem;
  align-items: flex-start;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const FormSection = styled.section`
  flex: 1;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.xl};
`;

const InnerFormLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.98rem;
  margin-bottom: 0.3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: 0.8em 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  background: #f9f9f9;
`;

const SummarySection = styled.section`
  flex: 1;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.xl};
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 1.25rem;
`;

const SummaryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  li {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 12px;
    font-size: 1.04rem;
    span:last-child { font-weight: 500; }
    h2 {
      display: inline;
      margin-right: 12px;
      font-size: 1.03rem;
      font-weight: 600;
    }
  }
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 1.15rem;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;

const PaymentSection = styled.div`
  margin: 32px 0 24px 0;
`;

const PaymentTitle = styled.h3`
  font-size: 1.08rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary || "#888"};
`;

const PaymentOptions = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 12px;
  label {
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    input[type="radio"] {
      margin-right: 6px;
      accent-color: ${({ theme }) => theme.colors.primary || "#0a0a0a"};
    }
  }
`;

const OrderButton = styled.button`
  width: 100%;
  padding: 14px 0;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText || "#fff"};
  font-size: 1.08rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

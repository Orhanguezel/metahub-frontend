"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { clearCart } from "@/modules/cart/slice/cartSlice";
import { createOrder } from "@/modules/order/slice/ordersSlice";
import { getMultiLang } from "@/types/common";
import type { SupportedLocale } from "@/types/common";
import type { Address } from "@/modules/users/types/address";
import type { PaymentMethod } from "@/modules/order/types";

const PAYMENT_METHODS = [
  { value: "credit_card", label: "Credit Card" },
  { value: "paypal", label: "PayPal" },
  { value: "cash_on_delivery", label: "Cash on Delivery" }, // backend uyumlu value
];

const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { cart, loading, error } = useAppSelector((state) => state.cart);
  const { profile } = useAppSelector((state) => state.account);
  const { t, i18n } = useTranslation(["checkout", "cart"]);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Adresleri güvenli şekilde bul
  const addresses: Address[] = useMemo(
    () => profile?.addressesPopulated || profile?.addresses || [],
    [profile]
  );
  const defaultAddress: Address | undefined = useMemo(
    () => addresses.find((a) => a.isDefault) || addresses[0],
    [addresses]
  );

  // Router koruması
  useEffect(() => {
    if (!profile) router.replace("/login?redirected=checkout");
  }, [profile, router]);

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) router.replace("/cart");
  }, [cart, router]);

  useEffect(() => {
    if (profile && (!addresses || addresses.length === 0)) {
      setTimeout(() => {
        alert(
          t("checkout:no_address", "Lütfen önce bir teslimat adresi ekleyin. Yönlendiriliyorsunuz...")
        );
        router.replace("/account");
      }, 300);
    }
  }, [profile, addresses, router, t]);

  // Render protection
  if (!profile || !defaultAddress || !cart) return null;

  // === DİNAMİK orderData ===
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
  shippingAddress: {
    name: profile.name,
    phone: defaultAddress.phone,
    tenant: cart.tenant ?? "main",
    street: defaultAddress.street,
    city: defaultAddress.city,
    postalCode: defaultAddress.zipCode,
    country: defaultAddress.country,
  },
};

    try {
      await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      router.replace("/order/success");
    } catch (err: any) {
      alert(t("checkout:error", "Sipariş oluşturulamadı!") + ` ${err.message || err}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Loading / hata
  if (loading || placingOrder) {
    return <PageContainer>{t("checkout:loading", "Loading...")}</PageContainer>;
  }
  if (error) {
    return (
      <PageContainer>
        <Title>{t("checkout:error", "Checkout error")}</Title>
        <div style={{ color: "#ED3030" }}>{error}</div>
      </PageContainer>
    );
  }

  // --- Render ---
  return (
    <PageContainer>
      <Title>{t("checkout:title", "Order Checkout")}</Title>
      <CheckoutLayout>
        {/* Adres Bölümü */}
        <FormSection>
          <SectionTitle>{t("checkout:shipping_address", "Shipping Address")}</SectionTitle>
          <InnerFormLayout>
            <InputGroup>
              <Label>{t("checkout:fullName", "Full Name")}</Label>
              <Input value={profile.name} disabled readOnly />
            </InputGroup>
            <InputGroup>
              <Label>{t("checkout:street", "Street")}</Label>
              <Input
                value={
                  defaultAddress.street +
                  (defaultAddress.houseNumber ? ` ${defaultAddress.houseNumber}` : "")
                }
                disabled
                readOnly
              />
            </InputGroup>
            <InputGroup>
              <Label>{t("checkout:city", "City")}</Label>
              <Input value={defaultAddress.city} disabled readOnly />
            </InputGroup>
            <InputGroup>
              <Label>{t("checkout:zipCode", "Postal Code")}</Label>
              <Input value={defaultAddress.zipCode} disabled readOnly />
            </InputGroup>
            <InputGroup>
              <Label>{t("checkout:country", "Country")}</Label>
              <Input value={defaultAddress.country} disabled readOnly />
            </InputGroup>
            <InputGroup>
              <Label>{t("checkout:phone", "Phone")}</Label>
              <Input value={defaultAddress.phone} disabled readOnly />
            </InputGroup>
          </InnerFormLayout>
        </FormSection>

        {/* Sipariş Özeti ve Ödeme */}
        <SummarySection>
          <SectionTitle>{t("checkout:order_summary", "Order Summary")}</SectionTitle>
          <SummaryList>
            {(cart.items || []).map((item, idx) => {
  const key =
    typeof item.product === "object" && item.product && "_id" in item.product
      ? (item.product._id || `unknown-${idx}`)
      : (item.product || `id-${idx}`);
  if (!item.product)
    return <li key={key} style={{ color: "#e33" }}>Ürün bulunamadı!</li>;
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
            <span>{t("checkout:total", "Total")}:</span>  
            <b>{cart.totalPrice.toFixed(2)} €</b>
          </TotalRow>

          <PaymentSection>
            <PaymentTitle>{t("checkout:payment_method", "Payment Method")}</PaymentTitle>
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
                  {t(`checkout:payment_${method.value}`, method.label)}
                </label>
              ))}
            </PaymentOptions>
          </PaymentSection>

          <OrderButton
            onClick={handleCompleteOrder}
            disabled={placingOrder || !paymentMethod}
          >
            {t("checkout:complete_order", "Complete Order")}
          </OrderButton>
        </SummarySection>
      </CheckoutLayout>
    </PageContainer>
  );
};

export default CheckoutPage;

// --- Styled (Aynı) ---
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

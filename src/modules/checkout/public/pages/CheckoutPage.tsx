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
import { getMultiLang, SUPPORTED_LOCALES } from "@/types/common";
import type { SupportedLocale } from "@/types/common";
import type { Address } from "@/modules/users/types/address";
import type { PaymentMethod } from "@/modules/order/types";
import type { IOrder } from "@/modules/order/types";

/* ---- MENÜ FİYAT HESAPLAMA (opsiyonel fallback) ---- */
import type {
  IMenuItem,
  IMenuItemVariant,
  IMenuItemModifierGroup,
  IMenuItemModifierOption,
  PriceChannel,
} from "@/modules/menu/types/menuitem";
import {
  getVariantBasePrice,
  getOptionBasePrice,
} from "@/modules/menu/public/components/utils/pricing";

const PAYMENT_METHODS = [
  { value: "credit_card", label: "checkout:payment_credit_card" },
  { value: "paypal", label: "checkout:payment_paypal" },
  { value: "cash_on_delivery", label: "checkout:payment_cash_on_delivery" },
];

const currencySymbol = (code?: string) => {
  switch ((code || "").toUpperCase()) {
    case "EUR": return "€";
    case "USD": return "$";
    case "GBP": return "£";
    case "TRY": return "₺";
    default:    return code || "";
  }
};

const readDefaultCurrencyFromSettings = (settings: any[]): string => {
  const keys = ["currency_default", "default_currency", "currency"];
  const isCode = (x: unknown) =>
    typeof x === "string" && /^[A-Za-z]{3}$/.test((x as string).trim());

  const pickFromTranslated = (val: Record<string, unknown>) => {
    for (const lng of SUPPORTED_LOCALES) {
      const v = (val as any)?.[lng];
      if (isCode(v)) return String(v).toUpperCase();
    }
    for (const v of Object.values(val)) {
      if (isCode(v)) return String(v).toUpperCase();
    }
    return undefined;
  };

  for (const k of keys) {
    const item = settings.find((x: any) => x?.key === k);
    const val = item?.value;
    if (isCode(val)) return String(val).toUpperCase();
    if (Array.isArray(val) && isCode(val[0])) return String(val[0]).toUpperCase();
    if (val && typeof val === "object") {
      const cur = (val as any).currency;
      if (isCode(cur)) return String(cur).toUpperCase();
      const fromTL = pickFromTranslated(val as Record<string, unknown>);
      if (fromTL) return fromTL;
    }
  }
  return "TRY";
};

const channelFromService = (s?: string): PriceChannel =>
  s === "pickup" ? "pickup" : s === "dinein" ? "dinein" : "delivery";

const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { cart, loading: cartLoading, error } = useAppSelector((s) => s.cart);
  const { profile, loading: profileLoading } = useAppSelector((s) => s.account);
  const settings = useAppSelector((s) => s.settings?.settingsAdmin || []);

  const { t, i18n } = useI18nNamespace("checkout", checkoutTranslations);
  const { t: tAccount } = useI18nNamespace("account", accountTranslations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const defaultCurrency = useMemo(
    () => readDefaultCurrencyFromSettings(settings),
    [settings]
  );

  const shippingAddresses: Address[] = useMemo(
    () =>
      Array.isArray(profile?.addresses)
        ? profile.addresses.filter((a) => a.addressType === "shipping")
        : [],
    [profile?.addresses]
  );

  const defaultShippingAddress: Address | undefined = useMemo(
    () => shippingAddresses.find((a) => a.isDefault) || shippingAddresses[0],
    [shippingAddresses]
  );

  // UI guard
  useEffect(() => {
    if (!profile && !profileLoading) router.replace("/login?redirected=checkout");
  }, [profile, profileLoading, router]);

  useEffect(() => {
    if ((!cart || !cart.items || cart.items.length === 0) && !cartLoading && !orderCompleted) {
      router.replace("/cart");
    }
  }, [cart, cartLoading, orderCompleted, router]);

  useEffect(() => {
    if (orderCompleted) router.replace("/order/success");
  }, [orderCompleted, router]);

  /* ---------------- fiyat yardımcıları ---------------- */
  type CartItem = NonNullable<typeof cart>["items"][number];

  const sumPC = (pc: any) =>
    Number(pc?.base || 0) + Number(pc?.modifiersTotal || 0) + Number(pc?.deposit || 0);

  const getItemCurrency = (item: CartItem): string =>
    (item as any).unitCurrency ||
    (item as any).priceComponents?.currency ||
    (cart as any)?.currency ||
    defaultCurrency;

  // (Yalnız son çare) Menü kalemini ürün şemasından yeniden fiyatla
  const repriceMenuItem = (item: CartItem, svc: "delivery" | "pickup" | "dinein") => {
    const channel = channelFromService(svc);
    const product = (item.product || {}) as Partial<IMenuItem>;
    const variantCode = item.menu?.variantCode;

    let base = 0;
    let currency = getItemCurrency(item);
    const priceCtx = { outlet: (cart as any)?.branch || null, when: new Date() };

    // variant
    const v = (product.variants || []).find((x) => x.code === variantCode) as IMenuItemVariant | undefined;
    const vp = v ? getVariantBasePrice(v, channel, priceCtx) : undefined;
    if (vp?.amount != null) {
      base = Number(vp.amount);
      currency = vp.currency || currency;
    }

    // modifiers
    let modsTotal = 0;
    const groups = (product.modifierGroups || []) as IMenuItemModifierGroup[];
    const picked = item.menu?.modifiers || [];
    const mods: Array<{ code: string; qty: number; unitPrice: number; total: number }> = [];

    for (const pick of picked) {
      const g = groups.find((gg) => gg.code === pick.groupCode);
      const opt = g?.options?.find((oo) => oo.code === pick.optionCode) as IMenuItemModifierOption | undefined;
      if (!opt) continue;
      const op = getOptionBasePrice(opt, channel, priceCtx);
      const q = Math.max(1, Number(pick.quantity || 1));
      const up = Number(op?.amount || 0);
      modsTotal += up * q;
      mods.push({ code: `${pick.groupCode}:${pick.optionCode}`, qty: q, unitPrice: up, total: up * q });
      if (op?.currency && !currency) currency = op.currency;
    }

    const unit = base + modsTotal; // deposit: 0
    return {
      unit,
      currency,
      components: {
        base,
        modifiersTotal: modsTotal,
        deposit: 0,
        currency,
        modifiers: mods,
      },
    };
  };

  // Sepet özetleri (UI)
  const summary = useMemo(() => {
    const rows =
      (cart?.items || []).map((item) => {
        // Önce sepetten gelen fiyatı oku
        const pc = (item as any).priceComponents;
        const unitFromCart =
          (typeof (item as any).unitPrice === "number" && (item as any).unitPrice > 0)
            ? Number((item as any).unitPrice)
            : (pc ? sumPC(pc) : 0);

        const unit =
          unitFromCart > 0
            ? unitFromCart
            : item.productType === "menuitem"
              ? repriceMenuItem(item, "delivery").unit
              : 0;

        const currency = (item as any).unitCurrency || pc?.currency || getItemCurrency(item);
        const sym = currencySymbol(currency);
        const line = unit * (item.quantity || 0);
        return {
          key:
            typeof item.product === "object" && item.product && "_id" in item.product
              ? (item.product as any)._id
              : String(item.product),
          title: getMultiLang((item.product as any)?.name, lang) || "-",
          qty: item.quantity,
          unit,
          line,
          currency,
          sym,
        };
      }) || [];

    const subtotal = rows.reduce((acc, r) => acc + r.line, 0);
    const currencyCodes = Array.from(new Set(rows.map((r) => r.currency)));
    const singleCurrency = currencyCodes.length === 1 ? currencyCodes[0] : defaultCurrency;
    const sym = currencySymbol(singleCurrency);

    return { rows, subtotal, currency: singleCurrency, sym, mixed: currencyCodes.length > 1 };
  }, [cart?.items, lang, defaultCurrency]);

  if (cartLoading || profileLoading || placingOrder)
    return <PageContainer>{t("loading", "Yükleniyor...")}</PageContainer>;
  if (!profile || !cart) return null;

  if (error) {
    return (
      <PageContainer>
        <Title>{t("error", "Hata")}</Title>
        <div style={{ color: "#ED3030" }}>{error}</div>
      </PageContainer>
    );
  }

  const handleCompleteOrder = async () => {
    if (placingOrder) return;
    if (!defaultShippingAddress) {
      alert(
        t(
          "no_shipping_address",
          "Sipariş verebilmek için önce teslimat adresi eklemeniz gerekiyor. Şimdi adres sayfasına yönlendiriliyorsunuz."
        )
      );
      router.push("/account");
      return;
    }

    setPlacingOrder(true);

    const serviceType: "delivery" | "pickup" | "dinein" = "delivery";

    const orderData = {
      serviceType,
      items: cart.items.map((item) => {
        const base: any = {
          product: typeof item.product === "object" ? (item.product as any)._id : item.product,
          productType: item.productType,
          quantity: item.quantity,
          tenant: cart.tenant ?? "main",
        };

        if (item.productType === "menuitem") {
          const pcCart = (item as any).priceComponents;
          const unitFromCart =
            (typeof (item as any).unitPrice === "number" && (item as any).unitPrice > 0)
              ? Number((item as any).unitPrice)
              : (pcCart ? sumPC(pcCart) : 0);

          const curFromCart =
            (item as any).unitCurrency || pcCart?.currency || getItemCurrency(item);

          // Menü (snapshot ve modifiers dâhil)
          const fallbackMods =
            item.mods
              ? Object.entries(item.mods).flatMap(([groupCode, arr]) =>
                  (arr as string[]).map((optionCode) => ({ groupCode, optionCode, quantity: 1 }))
                )
              : undefined;

          base.menu = {
            variantCode: item.menu?.variantCode ?? (item as any).variantCode,
            depositIncluded: true,
            modifiers: item.menu?.modifiers ?? (item as any).modifiers ?? fallbackMods ?? [],
            snapshot: item.menu?.snapshot ?? (item as any).menu?.snapshot ?? undefined,
            notes: item.menu?.notes ?? (item as any).notes ?? undefined,
          };

          if (unitFromCart > 0) {
            // 1) Sepetteki fiyatı kullan
            base.unitPrice = unitFromCart;
            base.unitCurrency = curFromCart;
            if (pcCart) {
              base.priceComponents = {
                base: Number(pcCart.base || 0),
                modifiersTotal: Number(pcCart.modifiersTotal || 0),
                deposit: Number(pcCart.deposit || 0),
                currency: curFromCart,
                modifiers: Array.isArray(pcCart.modifiers) ? pcCart.modifiers : [],
              };
            }
          } else {
            // 2) Son çare: üründen yeniden fiyatla (ürün objesi dolu ise)
            const r = repriceMenuItem(item, serviceType);
            base.unitPrice = r.unit;
            base.unitCurrency = r.currency || curFromCart;
            base.priceComponents = r.components;
          }
        } else {
          // Menü dışı ürünler (zaten sepette fiyatlı geliyor)
          const pc = (item as any).priceComponents;
          const unit =
            (typeof (item as any).unitPrice === "number" && (item as any).unitPrice > 0)
              ? Number((item as any).unitPrice)
              : (pc ? sumPC(pc) : 0);

          const cur = (item as any).unitCurrency || pc?.currency || getItemCurrency(item);

          base.unitPrice = unit;
          base.unitCurrency = cur;
          base.priceAtAddition = (item as any).priceAtAddition ?? unit;
          base.totalPriceAtAddition = (item as any).totalPriceAtAddition ?? unit * item.quantity;

          if (pc) {
            base.priceComponents = {
              base: Number(pc.base || 0),
              modifiersTotal: Number(pc.modifiersTotal || 0),
              deposit: Number(pc.deposit || 0),
              currency: cur,
              modifiers: Array.isArray(pc.modifiers) ? pc.modifiers : [],
            };
          }
        }
        return base;
      }),
      paymentMethod: paymentMethod as PaymentMethod,
      tenant: cart.tenant ?? "main",
      addressId: defaultShippingAddress._id,
      shippingAddress: {
        name: profile.name || "",
        phone: defaultShippingAddress.phone || "",
        tenant: cart.tenant ?? "main",
        street:
          (defaultShippingAddress.street && defaultShippingAddress.street.trim()) ||
          [defaultShippingAddress.addressLine?.trim(), defaultShippingAddress.houseNumber?.trim()]
            .filter(Boolean)
            .join(" "),
        city: defaultShippingAddress.city || "",
        postalCode: defaultShippingAddress.postalCode || "",
        country: defaultShippingAddress.country || "",
        addressLine: defaultShippingAddress.addressLine || "",
        houseNumber: defaultShippingAddress.houseNumber || "",
        email: profile.email || "",
        addressType: defaultShippingAddress.addressType || "shipping",
      },
      currency: summary.mixed ? defaultCurrency : summary.currency,
      // branch: (cart as any)?.branch,
    } satisfies Partial<IOrder>;

    try {
      await dispatch(createOrder(orderData)).unwrap();
      setOrderCompleted(true);
      dispatch(clearCart());
    } catch (err: any) {
      alert(t("error", "Sipariş oluşturulamadı!") + ` ${err?.message || err}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <PageContainer>
      <Title>{t("title", "Sipariş Onayı")}</Title>
      <CheckoutLayout>
        <FormSection>
          <SectionTitle>{t("shipping_address", "Teslimat Adresi")}</SectionTitle>
          {defaultShippingAddress ? (
            <InnerFormLayout>
              <InputGroup>
                <Label>{t("fullName", "Ad Soyad")}</Label>
                <Input value={profile.name} disabled readOnly />
              </InputGroup>
              <InputGroup>
                <Label>{tAccount("addressType", "Adres Tipi")}</Label>
                <Input
                  value={tAccount(`address.type.${defaultShippingAddress.addressType}`)}
                  disabled
                  readOnly
                />
              </InputGroup>
              <InputGroup>
                <Label>{t("street", "Cadde / Sokak")}</Label>
                <Input
                  value={
                    (defaultShippingAddress.street ?? "") +
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
          ) : (
            <NoAddress>
              {t("no_shipping_address", "Hiç teslimat adresiniz yok. Lütfen adres ekleyin.")}
            </NoAddress>
          )}
        </FormSection>

        <SummarySection>
          <SectionTitle>{t("order_summary", "Sipariş Özeti")}</SectionTitle>

          <SummaryList>
            {summary.rows.map((r) => (
              <li key={r.key}>
                <span>
                  <h2>{r.title}</h2>
                  <b>{r.qty}</b>
                </span>
                <span>
                  {r.qty} × {r.unit.toFixed(2)} {r.sym} = <strong>{r.line.toFixed(2)} {r.sym}</strong>
                </span>
              </li>
            ))}
          </SummaryList>

          <TotalRow>
            <span>{t("subtotal", "Ara Toplam")}:</span>
            <b>
              {summary.subtotal.toFixed(2)} {summary.sym}
              {summary.mixed ? " *" : ""}
            </b>
          </TotalRow>
          {summary.mixed && (
            <div style={{ fontSize: 12, opacity: 0.8, textAlign: "right", marginTop: -10 }}>
              {t("mixedCurrencyNote", "Sepette birden fazla para birimi var. Toplam bilgilendirme amaçlıdır.")}
            </div>
          )}

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

          <OrderButton onClick={handleCompleteOrder} disabled={placingOrder || !paymentMethod}>
            {t("complete_order", "Siparişi Tamamla")}
          </OrderButton>
        </SummarySection>
      </CheckoutLayout>
    </PageContainer>
  );
};

export default CheckoutPage;

/* --- styled --- */
const NoAddress = styled.div`
  padding: 1.2em 0 0 0;
  color: #e00;
  font-weight: 600;
`;
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
  @media (max-width: 900px) { flex-direction: column; gap: 2rem; }
`;
const FormSection = styled.section`
  flex: 1;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.xl};
`;
const InnerFormLayout = styled.div` display: flex; flex-direction: column; gap: 1rem; `;
const InputGroup = styled.div` display: flex; flex-direction: column; `;
const Label = styled.label`
  font-size: 0.98rem; margin-bottom: 0.3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const Input = styled.input`
  padding: 0.8em 1em; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; background: #f9f9f9;
`;
const SummarySection = styled.section`
  flex: 1;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.xl};
`;
const SectionTitle = styled.h2` font-size: 1.25rem; margin: 0 0 1.25rem 0; `;
const SummaryList = styled.ul`
  list-style: none; padding: 0; margin: 0 0 24px 0;
  li { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; font-size: 1.04rem; }
  h2 { display: inline; margin-right: 12px; font-size: 1.03rem; font-weight: 600; }
  span:last-child { font-weight: 500; }
`;
const TotalRow = styled.div`
  display: flex; justify-content: space-between; align-items: flex-end;
  font-size: 1.15rem; margin-bottom: 24px; color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;
const PaymentSection = styled.div` margin: 32px 0 24px 0; `;
const PaymentTitle = styled.h3`
  font-size: 1.08rem; margin-bottom: 0.5rem; font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary || "#888"};
`;
const PaymentOptions = styled.div`
  display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 12px;
  label { font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; }
  input[type="radio"] { margin-right: 6px; accent-color: ${({ theme }) => theme.colors.primary || "#0a0a0a"}; }
`;
const OrderButton = styled.button`
  width: 100%; padding: 14px 0; border: none; border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.buttonText || "#fff"};
  font-size: 1.08rem; font-weight: 700; cursor: pointer; transition: background 0.18s;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

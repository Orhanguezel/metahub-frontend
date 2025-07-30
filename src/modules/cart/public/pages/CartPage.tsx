import { useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchCart, clearCart } from "@/modules/cart/slice/cartSlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { CartItemList, CartSummary, CartEmpty } from "@/modules/cart";

const CartPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { cart, loading, error } = useAppSelector((state) => state.cart);
  const { profile, loading: profileLoading } = useAppSelector((state) => state.account);
  const { t } = useTranslation("cart");

  // Sepet yüklemesi
  useEffect(() => {
    if (profile && profile._id) {
      dispatch(fetchCart());
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, profile?._id]);

  // Kullanıcının en az bir shipping adresi var mı? (profile'dan alıyoruz!)
  const hasShippingAddress = useMemo(
    () =>
      Array.isArray(profile?.addresses) &&
      profile.addresses.some((addr) => addr.addressType === "shipping"),
    [profile?.addresses]
  );

  // Checkout butonuna tıklandığında kontrol!
  const handleCheckout = useCallback(() => {
    if (!hasShippingAddress) {
      alert(
        t(
          "no_shipping_address",
          "Sipariş verebilmek için önce teslimat adresi eklemeniz gerekiyor. Şimdi adres sayfasına yönlendiriliyorsunuz."
        )
      );
      router.push("/account");
      return;
    }
    router.push("/checkout");
  }, [hasShippingAddress, router, t]);

  // --- Render kısmı ---
  if (error) {
    return (
      <PageContainer>
        <Title>{t("error", "Sepet yüklenemedi.")}</Title>
        <div style={{ color: "#ED3030" }}>{error}</div>
      </PageContainer>
    );
  }
  if (!profile) {
    return (
      <PageContainer>
        <Title>
          {t("login_required", "Bitte einloggen, um den Warenkorb zu sehen.")}
        </Title>
      </PageContainer>
    );
  }
  if (loading || profileLoading) {
    return <PageContainer>{t("loading", "Loading...")}</PageContainer>;
  }
  if (!cart || cart.items.length === 0) {
    return <CartEmpty />;
  }

  return (
    <PageContainer>
      <Title>{t("title", "Your Cart")}</Title>
      <Content>
        <CartItemList items={cart.items} />
        <CartSummary
          cart={cart}
          onClearCart={() => dispatch(clearCart())}
          onCheckout={handleCheckout}
        />
      </Content>
    </PageContainer>
  );
};

export default CartPage;

// Styled...
const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl}
    ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.xl};
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

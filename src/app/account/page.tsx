"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCurrentUser,
  clearAccountMessages,
} from "@/store/user/accountSlice";
import ProfileForm from "@/components/visitor/account/ProfileForm";
import ProfileImageUploader from "@/components/visitor/account/ProfileImageUploader";
import AddressForm from "@/components/visitor/account/AddressForm";
import NotificationSettingsForm from "@/components/visitor/account/NotificationSettingsForm";
import PaymentForm from "@/components/visitor/account/PaymentForm";
import SocialLinksForm from "@/components/visitor/account/SocialLinksForm";
import DeleteAccountSection from "@/components/visitor/account/DeleteAccountSection";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

export default function AccountPage() {
  const dispatch = useAppDispatch();
  const { profile, loading, error, successMessage } = useAppSelector(
    (state) => state.account
  );
  const { t } = useTranslation("account");

  useEffect(() => {
    dispatch(fetchCurrentUser());
    return () => {
      dispatch(clearAccountMessages());
    };
  }, [dispatch]);

  return (
    <Container>
      <Title>{t("account.title")}</Title>

      {error && <Message>{error}</Message>}
      {successMessage && <Message success>{successMessage}</Message>}
      {loading && <p>{t("account.loading")}</p>}

      {profile && (
        <>
          <Section>
            <SectionTitle>{t("account.profileImage")}</SectionTitle>
            <ProfileImageUploader imageUrl={profile?.profileImage} />

          </Section>

          <Section>
            <SectionTitle>{t("account.personalInfo")}</SectionTitle>
            <ProfileForm profile={profile} />
          </Section>

          <Section>
            <SectionTitle>{t("account.address")}</SectionTitle>
            <AddressForm profile={profile} />
          </Section>

          <Section>
            <SectionTitle>{t("account.notifications")}</SectionTitle>
            <NotificationSettingsForm profile={profile} />
          </Section>

          <Section>
            <SectionTitle>{t("account.payment")}</SectionTitle>
            <PaymentForm profile={profile} />
          </Section>

          <Section>
            <SectionTitle>{t("account.social")}</SectionTitle>
            <SocialLinksForm profile={profile} />
          </Section>

          <Section>
            <SectionTitle>{t("account.password")}</SectionTitle>
            <ChangePasswordForm />
          </Section>

          <Section>
            <SectionTitle>{t("account.deleteAccount")}</SectionTitle>
            <DeleteAccountSection profile={profile} />
          </Section>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const Message = styled.p.withConfig({
  shouldForwardProp: (prop) => prop !== "success",
})<{ success?: boolean }>`
  color: ${({ success }) => (success ? "green" : "red")};

  font-size: 0.95rem;
  margin-bottom: 1rem;
`;

const Section = styled.section`
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.backgroundSecondary};
  box-shadow: ${({ theme }) => theme.shadows.light};
`;

const SectionTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 1rem;
`;

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
  const { t } = useTranslation("accountPage");

  useEffect(() => {
    dispatch(fetchCurrentUser());
    return () => {
      dispatch(clearAccountMessages());
    };
  }, [dispatch]);

  return (
    <Container>
      <Title>{t("title")}</Title>

      {error && <Message>{error}</Message>}
      {successMessage && <Message success>{successMessage}</Message>}
      {loading && <p>{t("loading")}</p>}

      {profile && (
        <>
          <Section>
            <SectionTitle>{t("profileImage")}</SectionTitle>
            <ProfileImageUploader imageUrl={profile?.profileImage} />
          </Section>

          <Section>
            <SectionTitle>{t("personalInfo")}</SectionTitle>
            <ProfileForm profile={profile} />
          </Section>

          <Section>
            <SectionTitle>{t("address")}</SectionTitle>
            <AddressForm />
          </Section>

          <Section>
            <SectionTitle>{t("notifications")}</SectionTitle>
            <NotificationSettingsForm profile={profile} />
          </Section>

          <Section>
            <SectionTitle>{t("social")}</SectionTitle>
            <SocialLinksForm profile={profile} />
          </Section>

          <Section>
            <SectionTitle>{t("password")}</SectionTitle>
            <ChangePasswordForm />
          </Section>

          <Section>
            <SectionTitle>{t("deleteAccount")}</SectionTitle>
            <DeleteAccountSection profile={profile} />
          </Section>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text};
`;

const Message = styled.p.withConfig({
  shouldForwardProp: (prop) => prop !== "success",
})<{ success?: boolean }>`
  color: ${({ success, theme }) =>
    success ? theme.colors.success : theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Section = styled.section`
  margin: ${({ theme }) => theme.spacing.xl} 0;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

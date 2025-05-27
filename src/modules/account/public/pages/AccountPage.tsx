"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearAccountMessages,
} from "@/modules/users/slice/accountSlice";
import {
  ProfileForm,
  ProfileImageUploader,
  NotificationSettingsForm,
  SocialLinksForm,
  DeleteAccountSection,
  AddressForm,
} from "@/modules/account";

import {ChangePasswordForm} from "@/modules/users";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

export default function AccountPage() {
  const dispatch = useAppDispatch();
  const { profile, loading, error, successMessage } = useAppSelector(
    (state) => state.account
  );
  const { t } = useTranslation("account");

  useEffect(() => {
    return () => {
      dispatch(clearAccountMessages());
    };
  }, [dispatch]);

  return (
    <Container>
      <Title>{t("page.title")}</Title>

      {error && <Message>{error}</Message>}
      {successMessage && <Message success>{successMessage}</Message>}
      {loading && <p>{t("page.loading")}</p>}

      {profile && (
        <>
          <Section>
            <SectionTitle>{t("page.profileImage")}</SectionTitle>
            <ProfileImageUploader imageUrl={profile?.profileImage} />
          </Section>

          <Section>
            <SectionTitle>{t("page.personalInfo")}</SectionTitle>
            <ProfileForm profile={profile} />
          </Section>

          <Section>
            <SectionTitle>{t("page.address")}</SectionTitle>
            <AddressForm />
          </Section>

          <Section>
            <SectionTitle>{t("page.notifications")}</SectionTitle>
            <NotificationSettingsForm profile={profile} />
          </Section>

          <Section>
            <SectionTitle>{t("page.social")}</SectionTitle>
            <SocialLinksForm profile={profile} />
          </Section>

          <Section>
            <SectionTitle>{t("page.password")}</SectionTitle>
            <ChangePasswordForm />
          </Section>

          <Section>
            <SectionTitle>{t("page.deleteAccount")}</SectionTitle>
            <DeleteAccountSection profile={profile} />
          </Section>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  max-width: 940px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing["2xl"]} ${({ theme }) => theme.spacing.lg};

  @media (max-width: 900px) {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.sm};
  }
  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xs};
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.01em;
  text-align: left;
`;

const Message = styled.p.withConfig({
  shouldForwardProp: (prop) => prop !== "success",
})<{ success?: boolean }>`
  min-height: 1.8em;
  color: ${({ success, theme }) =>
    success ? theme.colors.success : theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ success, theme }) =>
    success ? theme.fontWeights.semiBold : theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: left;
  transition: color 0.22s;
  letter-spacing: 0.01em;
  animation: fadeIn 0.45s;
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

const Section = styled.section`
  margin: ${({ theme }) => theme.spacing["2xl"]} 0;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: box-shadow 0.17s, background 0.17s;

  @media (max-width: 900px) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  }
  @media (max-width: 600px) {
    margin: ${({ theme }) => theme.spacing.lg} 0;
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.radii.md};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.01em;
`;

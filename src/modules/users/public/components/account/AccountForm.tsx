"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAccountMessages } from "@/modules/users/slice/accountSlice";
import {
  ProfileForm,
  ProfileImageUploader,
  NotificationSettingsForm,
  SocialLinksForm,
  DeleteAccountSection,
  AddressForm,
  ChangePasswordForm,
} from "@/modules/users";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {accountTranslations} from "@/modules/users";
import {
  Wrapper,
  Title,
  Section,
  SectionTitle,
  Message,
} from "@/modules/users/styles/AccountStyles";


export default function AccountForm() {
  const dispatch = useAppDispatch();
  const { profile, loading, error, successMessage } = useAppSelector(
    (state) => state.account
  );
  const { t } = useI18nNamespace("account", accountTranslations);

  useEffect(() => {
    return () => {
      dispatch(clearAccountMessages());
    };
  }, [dispatch]);

  return (
    <Wrapper>
      <Title>{t("page.title")}</Title>

      {error && <Message $error>{error}</Message>}
      {successMessage && <Message $success>{successMessage}</Message>}
      {loading && <p>{t("page.loading")}</p>}

      {profile && (
        <>
          <Section>
  <SectionTitle>{t("page.profileImage")}</SectionTitle>
  <ProfileImageUploader imageUrl={profile?.profileImage ?? undefined} />
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
    </Wrapper>
  );
}

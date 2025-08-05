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
import accountTranslations from "@/modules/users/locales/account";
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
      <Title>{t("page.title", { defaultMessage: "Account Settings" })}</Title>

      {error && <Message $error>{error}</Message>}
      {successMessage && <Message $success>{successMessage}</Message>}
      {loading && <p>{t("page.loading", { defaultMessage: "Loading..." })}</p>}

      {profile && (
        <>
          <Section>
  <SectionTitle>{t("page.profileImage", { defaultMessage: "Profile Image" })}</SectionTitle>
  <ProfileImageUploader imageUrl={profile?.profileImage ?? undefined} />
</Section>

          <Section>
            <SectionTitle>{t("page.personalInfo", { defaultMessage: "Personal Information" })}</SectionTitle>
            <ProfileForm profile={profile} />
          </Section>
          <Section>
            <SectionTitle>{t("page.address", { defaultMessage: "Address" })}</SectionTitle>
            <AddressForm />
          </Section>
          <Section>
            <SectionTitle>{t("page.notifications", { defaultMessage: "Notifications" })}</SectionTitle>
            <NotificationSettingsForm profile={profile} />
          </Section>
          <Section>
            <SectionTitle>{t("page.social", { defaultMessage: "Social Links" })}</SectionTitle>
            <SocialLinksForm profile={profile} />
          </Section>
          <Section>
            <SectionTitle>{t("page.password", { defaultMessage: "Change Password" })}</SectionTitle>
            <ChangePasswordForm />
          </Section>
          <Section>
            <SectionTitle>{t("page.deleteAccount", { defaultMessage: "Delete Account" })}</SectionTitle>
            <DeleteAccountSection profile={profile} />
          </Section>
        </>
      )}
    </Wrapper>
  );
}

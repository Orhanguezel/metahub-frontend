"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { deleteUserAccount } from "@/modules/users/slice/accountSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import accountTranslations from "@/modules/users/locales/account";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  Wrapper,
  Title,
  Description,
  UserInfo,
  Input,
  Button,
  Message,
} from "@/modules/users/styles/AccountStyles";

interface Props {
  profile: { email?: string; name?: string } | null;
}

const DeleteAccountSection = ({ profile }: Props) => {
  const { t } = useI18nNamespace("account", accountTranslations);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    setErrorMsg(null);
    if (confirmation.trim().toLowerCase() !== "delete") {
      setErrorMsg(t("delete.confirmationError"));
      return;
    }
    if (!password) {
      setErrorMsg(t("delete.passwordError"));
      return;
    }
    setLoading(true);
    try {
      await dispatch(deleteUserAccount({ password })).unwrap();
      toast.success(t("delete.success"));
      router.push("/login");
    } catch (err: any) {
      setErrorMsg(err?.message || t("delete.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>{t("delete.title")}</Title>
      <Description>{t("delete.warning")}</Description>

      {profile?.email && (
        <UserInfo>
          {t("delete.loggedInAs")} <strong>{profile.email}</strong>
        </UserInfo>
      )}

      <Input
        type="password"
        placeholder={t("delete.password")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      <Input
        type="text"
        placeholder={t("delete.confirmation")}
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        autoComplete="off"
      />

      {errorMsg && <Message $error>{errorMsg}</Message>}

      <Button type="button" onClick={handleDelete} disabled={loading} $danger>
        {loading ? t("delete.loading") : t("delete.button")}
      </Button>
    </Wrapper>
  );
};

export default DeleteAccountSection;

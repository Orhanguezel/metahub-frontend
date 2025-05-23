"use client";

import { useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { deleteUserAccount } from "@/modules/users/slice/accountSlice";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Props {
  profile: { email?: string; name?: string } | null;
}

const DeleteAccountSection = ({ profile }: Props) => {
  const { t } = useTranslation("account");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmation.trim().toLowerCase() !== "delete") {
      toast.error(t("delete.confirmationError"));
      return;
    }

    setLoading(true);
    try {
      await dispatch(deleteUserAccount({ password })).unwrap();
      toast.success(t("delete.success"));
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.message || t("delete.error"));
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
      />

      <Input
        type="text"
        placeholder={t("delete.confirmation")}
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
      />

      <Button onClick={handleDelete} disabled={loading}>
        {loading ? t("delete.loading") : t("delete.button")}
      </Button>
    </Wrapper>
  );
};

export default DeleteAccountSection;

// 🎨 Styled Components

const Wrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  max-width: 500px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

const UserInfo = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textAlt};
  margin: 0;

  strong {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }
`;

const Button = styled.button`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal};

  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

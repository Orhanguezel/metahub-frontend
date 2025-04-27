"use client";

import { useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { deleteUserAccount } from "@/store/user/accountSlice";
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
      if (confirmation.toLowerCase() !== "delete") {
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
        <p>{t("delete.warning")}</p>
  
        {profile?.email && (
          <strong style={{ marginBottom: "0.5rem", display: "block" }}>
            {t("delete.loggedInAs")} {profile.email}
          </strong>
        )}
  
        <input
          type="password"
          placeholder={t("delete.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
  
        <input
          type="text"
          placeholder={t("delete.confirmation")}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
  
        <button onClick={handleDelete} disabled={loading}>
          {loading ? t("delete.loading") : t("delete.button")}
        </button>
      </Wrapper>
    );
  };

  export default DeleteAccountSection;
  

const Wrapper = styled.div`
  margin-top: 3rem;
  background: ${({ theme }) => theme.backgroundSecondary};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.light};
  max-width: 500px;
  margin-inline: auto;

  input {
    display: block;
    margin-top: 1rem;
    width: 100%;
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border};
  }

  button {
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background: ${({ theme }) => theme.danger};
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background: ${({ theme }) => theme.dangerHover};
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.danger};
  margin-bottom: 0.75rem;
`;

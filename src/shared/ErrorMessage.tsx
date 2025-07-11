"use client";

import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

interface Props {
  onAuthSuccess?: () => void; 
  message?: string;
  type?: "success" | "error";
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function RegisterSuccessStep({
  onAuthSuccess,
  message,
  type,
  buttonText,
  onButtonClick,
}: Props) {
  const { t } = useTranslation("register");


  const finalType = type || (message ? "error" : "success");

  // Butonun işlevi ve metni duruma göre değişir
  const showButton = Boolean(onAuthSuccess || onButtonClick);
  const handleClick = onAuthSuccess || onButtonClick;
  const btnText =
    buttonText ||
    (finalType === "success"
      ? t("goToLogin", "Girişe Git")
      : t("retry", "Tekrar Dene"));

  // Başlık ve ikon
  const icon =
    finalType === "success" ? (
      <FaCheckCircle size={52} />
    ) : (
      <FaExclamationCircle size={52} />
    );
  const title =
    finalType === "success"
      ? t("successTitle", "Kayıt tamamlandı!")
      : t("errorTitle", "Bir hata oluştu!");

  const desc =
    message ||
    (finalType === "success"
      ? t(
          "successDesc",
          "Hesabınız başarıyla oluşturuldu ve doğrulandı. Şimdi giriş yapabilirsiniz."
        )
      : t("errorDesc", "Bir hata oluştu, lütfen tekrar deneyin."));

  return (
    <Wrapper>
      <IconWrap $type={finalType}>{icon}</IconWrap>
      <Title>{title}</Title>
      <Desc>{desc}</Desc>
      {showButton && (
        <Button type="button" onClick={handleClick}>
          {btnText}
        </Button>
      )}
    </Wrapper>
  );
}

// Styled Components
const Wrapper = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const IconWrap = styled.div<{ $type?: "success" | "error" }>`
  color: ${({ theme, $type }) =>
    $type === "error" ? theme.colors.danger : theme.colors.success};
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.4rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 1rem;
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 2rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.9rem 0;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  transition: background 0.2s;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

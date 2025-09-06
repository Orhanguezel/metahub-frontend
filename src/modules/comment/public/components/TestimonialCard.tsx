// TestimonialCard.tsx
import styled from "styled-components";
import Image from "next/image";
import { resolveProfileImage } from "@/shared/resolveProfileImage";
import { MdFormatQuote } from "react-icons/md";

export default function TestimonialCard({ card, lang, isActive }: any) {
  const getLangField = (field: any) =>
    typeof field === "object" && field
      ? field[lang] || field.tr || field.en || Object.values(field)[0] || ""
      : field || "";

  return (
    <CardMain $active={isActive}>
      <AvatarCircle $active={isActive}>
        <Image
          src={resolveProfileImage(card.profileImage, "profile")}
          alt={getLangField(card.name) || "Anonim"}
          width={54}
          height={54}
          loading="lazy"
        />
      </AvatarCircle>
      <CardHeader>
        <Name $active={isActive}>{getLangField(card.name) || "Anonim"}</Name>
        <Role $active={isActive}>
          {getLangField(card.company) || getLangField(card.label) || ""}
        </Role>
      </CardHeader>
      <Text $active={isActive}>
        <MdFormatQuote
          size={32}
          style={{ opacity: 0.13, marginBottom: -9, marginRight: 7, display: "inline" }}
        />
        <span>{getLangField(card.text)}</span>
      </Text>
    </CardMain>
  );
}

/* ------------ styled ------------ */

const CardMain = styled.div<{ $active?: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.cardBackground};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.background : theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ $active, theme }) =>
    $active
      ? `0 8px 44px 0 ${theme.colors.primaryTransparent}, 0 1px 10px #0003`
      : "0 2px 12px 0 #0011"};
  min-height: 282px;
  max-width: 350px;
  width: 100%;
  padding: 1.3rem 1.5rem 2.2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-bottom: 18px;
  z-index: ${({ $active }) => ($active ? 2 : 1)};
  transform: ${({ $active }) => ($active ? "scale(1.08)" : "scale(0.98)")};
  opacity: ${({ $active }) => ($active ? 1 : 0.85)};
  border: ${({ $active, theme }) =>
    $active ? `2.2px solid ${theme.colors.primary}` : "2.2px solid transparent"};
  transition: all 0.26s cubic-bezier(.42,1.12,.48,1.07);

  @media (max-width: 700px) {
    min-height: 220px;
    max-width: 80vw; /* mobil slot (≈88vw) içinde rahat */
    margin-bottom: 12px;
    transform: scale(1);
  }
`;

const AvatarCircle = styled.div<{ $active?: boolean }>`
  width: 54px;
  height: 54px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.background : theme.colors.inputBackground};
  border-radius: 50%;
  margin: 0 auto 12px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 14px 0 ${({ theme }) => theme.colors.primaryTransparent};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  overflow: hidden;
  & > img {
    border-radius: 50%;
    width: 48px;
    height: 48px;
    object-fit: cover;
    background: ${({ theme }) => theme.colors.inputBackground};
  }
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.12em;
  margin-bottom: 0.4em;
`;

const Name = styled.div<{ $active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.08em;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.background : theme.colors.text};
`;

const Role = styled.div<{ $active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.backgroundSecondary : theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.special};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const Text = styled.div<{ $active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 1.1em;
  min-height: 46px;
  line-height: 1.5;
  text-align: center;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.background : theme.colors.text};
  span { font-weight: 500; }
`;

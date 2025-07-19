"use client";
import styled from "styled-components";
import { FaPhone, FaEnvelope } from "react-icons/fa";
import { SocialLinks } from "@/modules/shared";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";

export default function TopBar() {
  const company = useAppSelector((state) => state.company.company);

  if (!company) return null;

  const { email, phone } = company;

  return (
    <TopBarWrapper>
      <LeftGroup>
        <SocialLinks />
      </LeftGroup>
      <ContactGroup>
        {phone && (
          <ContactItem
            as="a"
            href={`tel:${phone.replace(/\s+/g, "")}`}
            aria-label="Telefon"
            title={phone}
          >
            <FaPhone style={{ marginRight: 5, fontSize: 15 }} />
            <span>{phone}</span>
          </ContactItem>
        )}
        {email && (
          <ContactItem
            as={Link}
            href="/contact"
            aria-label="E-posta"
            title={email}
          >
            <FaEnvelope style={{ marginRight: 5, fontSize: 15 }} />
            <span>{email}</span>
          </ContactItem>
        )}
      </ContactGroup>
    </TopBarWrapper>
  );
}

// --- Styled Components ---

const TopBarWrapper = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: 0.3em ${({ theme }) => theme.spacings.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0 0 8px 8px;
  min-height: 32px;

  @media (max-width: 700px) {
    flex-direction: column;
    gap: 2px;
    padding: 0.16em ${({ theme }) => theme.spacings.sm};
  }
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 700px) {
    width: 100%;
    justify-content: flex-start;
    gap: 9px;
  }
`;

const ContactGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  @media (max-width: 700px) {
    gap: 11px;
    width: 100%;
    justify-content: flex-end;
  }
`;

const ContactItem = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: color 0.16s;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
  }
  svg {
    font-size: 1em;
  }
`;

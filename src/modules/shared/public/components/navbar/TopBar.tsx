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
             <span className="contact-label">{phone}</span>
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
            <span className="contact-label">{email}</span>
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
  padding: 0.2em ${({ theme }) => theme.spacings.xl};
  display: flex;
  flex-direction: row; /* Önemli: Mobilde de row! */
  justify-content: space-between;
  align-items: center;
  min-height: 36px;
  border-radius: 0 0 12px 12px;
  gap: ${({ theme }) => theme.spacings.md};

  ${({ theme }) => theme.media.medium} {
    padding: 0.18em ${({ theme }) => theme.spacings.lg};
    min-height: 34px;
    border-radius: 0 0 8px 8px;
    gap: ${({ theme }) => theme.spacings.sm};
  }

  ${({ theme }) => theme.media.small} {
    /* flex-direction: column; <-- ARTIK YOK */
    flex-direction: row; /* Mobilde de row kalsın! */
    justify-content: space-between;
    align-items: center;
    padding: 0.08em ${({ theme }) => theme.spacings.sm};
    min-height: 30px;
    border-radius: 0 0 6px 6px;
    gap: ${({ theme }) => theme.spacings.xs};
  }
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1 1 auto;

  ${({ theme }) => theme.media.medium} {
    gap: 10px;
  }
  ${({ theme }) => theme.media.small} {
    justify-content: flex-start;
    gap: 7px;
    margin-bottom: 0;
  }
`;

const ContactGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1 1 auto;
  justify-content: flex-end;
  flex-wrap: nowrap !important; /* Asla alt satıra inme! */
  padding: 0 15px;
  overflow-x: auto;
  min-width: 0;

  ${({ theme }) => theme.media.medium} {
    gap: 13px;
  }
  ${({ theme }) => theme.media.small} {
    width: auto;
    gap: 13px;
    justify-content: flex-end;
  }
`;

const ContactItem = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  min-width: 30px;
  min-height: 28px;
  line-height: 1.1;
  border-radius: 4px;
  padding: 1px 4px;
  transition: color 0.18s, background 0.18s;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    text-decoration: underline;
    outline: none;
  }

  svg {
    font-size: 15px;
    min-width: 17px;
    min-height: 17px;
  }

  .contact-label {
    display: inline;
    @media (max-width: 700px) {
      display: none;
    }
  }
`;

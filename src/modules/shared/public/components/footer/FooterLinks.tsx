"use client";
import styled from "styled-components";
import Link from "next/link";

// Footer veya herhangi bir yerde tekrar tekrar kullanılabilir!
export interface LinkItem {
  label: string;
  href: string;
}

interface FooterLinksProps {
  title: string;
  links: LinkItem[];
}

export default function FooterLinks({ title, links }: FooterLinksProps) {
  const validLinks = Array.isArray(links)
    ? links.filter(
        (item) =>
          !!item.label?.trim() && !!item.href?.trim() && item.href !== "#"
      )
    : [];

  if (validLinks.length === 0) return null;

  return (
    <FooterBlock>
      <FooterTitle>{title}</FooterTitle>
      <FooterList>
        {validLinks.map((item, idx) => (
          <FooterListItem key={idx}>
            <StyledLink href={item.href}>{item.label}</StyledLink>
          </FooterListItem>
        ))}
      </FooterList>
    </FooterBlock>
  );
}

// --- Styled Components (Ensotek Modern Footer Links) ---
const FooterTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
  letter-spacing: 0.01em;
  text-align: left;

  ${({ theme }) => theme.media.small} {
    text-align: center;
  }
`;


const FooterBlock = styled.div`
  margin: 0;
  max-width: 320px;
  width: 100%;
  text-align: left;

  ${({ theme }) => theme.media.small} {
    text-align: center;
    margin: 0 auto;
  }
`;

const FooterList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterListItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledLink = styled(Link)`
  display: inline-block;
  position: relative;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 400;
  text-decoration: none !important;
  padding: 2px 0;
  letter-spacing: 0.01em;
  transition: 
    color ${({ theme }) => theme.transition.fast},
    transform ${({ theme }) => theme.transition.fast};

  /* Modern underline animation */
  &::after {
    content: "";
    display: block;
    position: absolute;
    left: 0; right: 0; bottom: -2px;
    height: 2px;
    border-radius: 2px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.accent},
      ${({ theme }) => theme.colors.primary}
    );
    transform: scaleX(0);
    transform-origin: left;
    transition: transform ${({ theme }) => theme.transition.fast};
  }

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px) scale(1.05);

    &::after {
      transform: scaleX(1);
    }

    outline: none;
    box-shadow: 0 2px 12px ${({ theme }) => theme.colors.primaryTransparent};
  }

  /* Tap highlight for mobile */
  @media (hover: none) {
    &:active {
      color: ${({ theme }) => theme.colors.accent};
      transform: scale(0.98);
      &::after {
        transform: scaleX(1);
      }
    }
  }
`;


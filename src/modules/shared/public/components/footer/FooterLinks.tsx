"use client";

import styled from "styled-components";
import Link from "next/link";

export interface LinkItem {
  label: string;
  href: string;
}

interface FooterLinksProps {
  title: string;
  links: LinkItem[]; // Artık optional değil → null check'e gerek kalmaz
}

export default function FooterLinks({ title, links }: FooterLinksProps) {
  // Filtre: Eksik label veya href varsa gösterme.
  const validLinks = links.filter(
    (item) => item.label?.trim() && item.href?.trim()
  );

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

// 🎨 Styled Components
const FooterBlock = styled.div`
  margin: ${({ theme }) => theme.spacing.md};
  max-width: 300px;

  ${({ theme }) => theme.media.small} {
    text-align: center;
  }
`;

const FooterTitle = styled.h3`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const FooterList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterListItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StyledLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

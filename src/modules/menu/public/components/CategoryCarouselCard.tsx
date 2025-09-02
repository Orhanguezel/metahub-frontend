"use client";

import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import { memo } from "react";

type Props = {
  title: string;
  image?: string;
  href: string;
};

function CategoryCarouselCardBase({ title, image, href }: Props) {
  return (
    <Card href={href} aria-label={title}>
      <Thumb $empty={!image}>
        {image ? (
          <Image
            src={image}
            alt={title}
            width={56}
            height={56}
            sizes="56px"
            loading="lazy"
          />
        ) : (
          <span aria-hidden>🍽️</span>
        )}
      </Thumb>
      <Label title={title}>{title}</Label>
    </Card>
  );
}

export default memo(CategoryCarouselCardBase);

/* ============== styles ============== */

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: clamp(180px, 22vw, 240px);
  height: 120px;

  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1.5px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: 0 2px 14px 0 rgba(40, 117, 194, 0.07);

  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};

  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;

  &:hover, &:focus-visible {
    background: ${({ theme }) => theme.colors.hoverBackground};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    outline: none;
  }
`;

const Thumb = styled.div<{ $empty?: boolean }>`
  width: 56px;
  height: 56px;
  margin-bottom: 6px;

  display: grid;
  place-items: center;

  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $empty }) =>
    $empty ? theme.colors.inputBackgroundSofter : "transparent"};

  img { object-fit: contain; }
  span { font-size: 28px; opacity: .8; }
`;

const Label = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

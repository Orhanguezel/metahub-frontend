"use client";

import { useMemo } from "react";
import styled from "styled-components";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import type { IMenu } from "@/modules/menu/types/menu";

type Props = {
  menu: IMenu | null;
  t: (k: string, d?: string) => string;
  lang: SupportedLocale;
  isLoading?: boolean;
};

export default function MenuHeader({ menu, t, lang, isLoading }: Props) {
  // Başlık: dil → en → slug → code → fallback
  const titleText = useMemo(() => {
    const name = (menu?.name as Record<string, string> | undefined) ?? {};
    const pick =
      (name?.[lang]?.trim?.() || "") ||
      (name?.["en"]?.trim?.() || "") ||
      menu?.slug ||
      menu?.code ||
      "";
    return pick || t("mainMenu", "Ana menu");
    // eslint-disable-next-line
  }, [menu?._id, menu?.name, menu?.slug, menu?.code, lang, t]);

  const img = menu?.images?.[0];
  const imgSrc = img ? (img.webp || img.url || img.thumbnail) : "";

  if (isLoading) {
    return (
      <Head>
        <Skel style={{ height: 32, width: 240 }} />
      </Head>
    );
  }

  return (
    <Head>
      <Cover data-lang={lang}>
        {/* BG image — layout’ı etkilemez, Cover ne kadar yüksekse o kadar görünür */}
        {imgSrc && (
          <BgWrap aria-hidden="true">
            <BgImage
              src={imgSrc}
              alt=""
              fill
              sizes="100vw"
              priority
            />
          </BgWrap>
        )}

        {/* metin her zaman üstte */}
        <Title>{titleText}</Title>
      </Cover>
    </Head>
  );
}

/* ============== STYLES ============== */

const Head = styled.header`
  display: flex;
  flex-direction: column;
`;

/* Cover yüksekliği layout’a göre; min-height çok küçük boşlukları önler */
const Cover = styled.div`
  position: relative;
  width: 100%;
  background: transparent;
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  padding: 12px 16px;
  min-height: clamp(120px, 18vw, 240px);

  ${({ theme }) => theme.media.small} {
    padding: 12px;
    min-height: clamp(110px, 28vw, 220px);
  }
`;

/* BG katmanı: tamamen şeffaf, tüm Cover’ı kaplar, etkileşimsiz */
const BgWrap = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
`;

/* Next/Image ‘fill’ + contain → kırpma yok; Cover yüksekliği kadar görünür */
const BgImage = styled(Image)`
  object-fit: contain;
  object-position: center;
  height: 100% !important;
  width: 100% !important;
`;

/* başlık overlay */
const Title = styled.h1`
  position: absolute;
  top: 12px;
  left: 16px;
  z-index: 2;
  margin: 0;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes.h2};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  text-shadow: 0 2px 12px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.35);

  ${({ theme }) => theme.media.small} {
    top: 10px;
    left: 12px;
  }
`;

const Skel = styled.div`
  background: ${({ theme }) => theme.colors.skeleton};
  border-radius: 8px;
`;

import styled from "styled-components";
import { useEffect, useState } from "react";


interface FooterLogoProps {
  logo?: string;
}

export default function FooterLogo({ logo }: FooterLogoProps) {
  const defaultLogo = "/navbar/logo-light.png";
  const [imgSrc, setImgSrc] = useState(logo || defaultLogo);


  useEffect(() => {
    setImgSrc(logo || defaultLogo);
  }, [logo]);

  if (!imgSrc) return null;

  return (
    <LogoWrapper>
      <LogoImg
        src={imgSrc}
        alt="Footer Logo"
        onError={() => setImgSrc(defaultLogo)}
      />
    </LogoWrapper>
  );
}


const LogoWrapper = styled.div`
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const LogoImg = styled.img`
  max-width: 150px;
  height: auto;
  display: block;
  margin: 0 auto;
`;

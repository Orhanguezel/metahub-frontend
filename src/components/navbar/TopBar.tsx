"use client";

import { TopBar as TopBarWrapper, Phone } from "./NavbarStyles";
import { SocialLinks } from "./SocialLinks";
import { FaPhone } from "react-icons/fa";

export function TopBar() {
  return (
    <TopBarWrapper>
      <SocialLinks />
      <Phone>
        <FaPhone /> +49 1764 1107158
      </Phone>
    </TopBarWrapper>
  );
}


"use client";

import { ContactFormSection, LocationMapSection } from "@/modules/contact";
import styled from "styled-components";
import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <ContactContainer>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ContactFormSection />
      </motion.div>
      <SectionGrid>
        <LocationMapSection />
        {/* Gerekirse ek bilgi/yardım alanı ekleyebilirsin */}
      </SectionGrid>
    </ContactContainer>
  );
}

const ContactContainer = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: 40px 16px 32px 16px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  margin: 40px 0;
  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

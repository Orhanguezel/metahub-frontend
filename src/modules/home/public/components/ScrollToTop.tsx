"use client";

import styled from "styled-components";
import { useEffect, useState } from "react";
import { FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <Button
          as={motion.button}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 0.92, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.28 }}
          onClick={handleClick}
          aria-label="Sayfanın başına dön"
        >
          <FaChevronUp size={28} />
        </Button>
      )}
    </AnimatePresence>
  );
}

// --- Styled Components ---
const Button = styled.button`
  position: fixed;
  right: 26px;
  bottom: 28px;
  z-index: ${({ theme }) => theme.zIndex.overlay + 1};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 0.35em 0.55em 0.28em 0.55em;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s, color 0.16s, transform 0.15s;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover, &:focus-visible {
    background: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: ${({ theme }) => theme.shadows.xl};
    color: #fff;
    outline: none;
    transform: scale(1.07);
  }

  svg {
    display: block;
    width: 28px;
    height: 28px;
    pointer-events: none;
  }

  @media (max-width: 600px) {
    right: 14px;
    bottom: 14px;
    padding: 0.25em 0.39em 0.18em 0.39em;
    svg {
      width: 22px;
      height: 22px;
    }
  }
`;

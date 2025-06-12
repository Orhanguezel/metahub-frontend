"use client";

import styled, { keyframes } from "styled-components";

export default function Loader() {
  return (
    <Wrapper>
      <Spinner />
    </Wrapper>
  );
}

// --- Styled Components ---
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
`;

const Spinner = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid #8884d8; // Tema rengi olabilir
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;

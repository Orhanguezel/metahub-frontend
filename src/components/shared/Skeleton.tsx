// src/components/shared/Skeleton.tsx

'use client';

import styled, { keyframes } from "styled-components";

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const SkeletonBox = styled.div`
  background: ${({ theme }) => theme.skeletonBackground || "#e0e0e0"};
  border-radius: 8px;
  animation: ${pulse} 1.5s infinite;
  width: 100%;
  height: 150px;
`;

export default SkeletonBox;

"use client";

import styled, { keyframes } from "styled-components";

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const Skeleton = styled.div`
  background: ${({ theme }) => theme.colors.skeletonBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  animation: ${pulse} ${({ theme }) => theme.transition.slow} infinite;
  width: 100%;
  height: 150px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export default Skeleton;

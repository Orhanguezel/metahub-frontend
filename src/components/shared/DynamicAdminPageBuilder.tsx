"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import { MdSettings } from "react-icons/md";
import * as Icons from "react-icons/md";

interface DynamicAdminPageBuilderProps {
  modules: {
    id: string;
    order: number;
    visible: boolean;
    props?: {
      label?: string;
      icon?: string;
      enabled?: boolean;
      count?: number; // ✅ Buraya eklendi
    };
  }[];
}

export default function DynamicAdminPageBuilder({ modules }: DynamicAdminPageBuilderProps) {
  const router = useRouter();

  if (!modules.length) {
    return (
      <Grid>
        <SkeletonBox />
        <SkeletonBox />
        <SkeletonBox />
      </Grid>
    );
  }

  const sortedModules = modules
    .filter((mod) => mod.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <Grid>
      {sortedModules.map((mod) => {
        const label = mod.props?.label || mod.id;
        const enabled = mod.props?.enabled !== false;
        const count = mod.props?.count ?? 0; 
        const iconName = mod.props?.icon;
        const IconComponent = (iconName && Icons[iconName as keyof typeof Icons]) || MdSettings;

        return (
          <Card
            key={mod.id}
            $enabled={enabled}
            onClick={() => enabled && router.push(`/admin/${mod.id}`)}
            title={`${label} - ${count} kayıt`}
          >
            <IconWrapper>
              <IconComponent />
            </IconWrapper>
            <Label>{label}</Label>
            <Count>{count}</Count> {/* ✅ Burada gösteriyoruz */}
          </Card>
        );
      })}
    </Grid>
  );
}

// Styled Components

const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
  padding: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const Card = styled.div<{ $enabled: boolean }>`
  background: ${({ theme }) => theme.cardBackground || "#fff"};
  padding: 1.2rem;
  border-radius: 12px;
  text-align: center;
  cursor: ${({ $enabled }) => ($enabled ? "pointer" : "default")};
  opacity: ${({ $enabled }) => ($enabled ? 1 : 0.5)};
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  &:hover {
    ${({ $enabled }) =>
      $enabled &&
      `
        transform: scale(1.03);
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
      `}
  }
`;

const IconWrapper = styled.div`
  font-size: 2.4rem;
  margin-bottom: 0.8rem;
  color: ${({ theme }) => theme.primary || "#0070f3"};
`;

const Label = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const Count = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.5rem;
`;

const SkeletonBox = styled.div`
  background: ${({ theme }) => theme.skeletonBackground || "#e0e0e0"};
  border-radius: 8px;
  width: 100%;
  height: 150px;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

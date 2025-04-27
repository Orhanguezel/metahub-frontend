"use client";

import { useDashboardCards } from "@/hooks/useDashboardCards";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import SkeletonBox from "@/components/shared/Skeleton";
import { useAppSelector } from "@/store/hooks";

export default function DashboardCards() {
  const cards = useDashboardCards();
  const { loading: statsLoading } = useAppSelector((state) => state.dashboard);
  const router = useRouter();

  if (statsLoading) {
    return (
      <Grid>
        {Array.from({ length: 6 }).map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </Grid>
    );
  }

  if (!cards.length) return null;

  return (
    <Grid>
      {cards.map(({ key, label, value, path, icon: Icon }) => (
        <Card
          key={key}
          $enabled={true}
          onClick={() => router.push(path)}
          title={`${label} - Tıklayarak yönetebilirsiniz.`}
        >
          {Icon && (
            <IconWrapper>
              <Icon />
            </IconWrapper>
          )}
          <CardInfo>
            <Value>{value}</Value>
            <LabelText>{label}</LabelText>
          </CardInfo>
        </Card>
      ))}
    </Grid>
  );
}

// --- Styled Components ---
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem 0;
`;

const Card = styled.div<{ $enabled: boolean }>`
  background: ${({ theme }) => theme.cardBackground || "#fff"};
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  padding: 1.2rem;
  cursor: ${({ $enabled }) => ($enabled ? "pointer" : "default")};
  opacity: ${({ $enabled }) => ($enabled ? 1 : 0.5)};
  transition: all 0.3s ease;

  &:hover {
    ${({ $enabled }) =>
      $enabled &&
      `
      transform: scale(1.03);
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
    `}
  }
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.primary || "#0070f3"};
  margin-bottom: 0.5rem;
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Value = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
`;

const LabelText = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const SkeletonCard = styled(SkeletonBox)`
  height: 150px;
  border-radius: 12px;
`;

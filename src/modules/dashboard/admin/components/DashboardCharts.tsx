"use client";
import styled from "styled-components";

type Props = {
  data: { labels: string[]; datasets: any[] } | null | undefined;
};

export default function DashboardCharts({ data }: Props) {
  return (
    <Pre>
      {JSON.stringify(data ?? { labels: [], datasets: [] }, null, 2)}
    </Pre>
  );
}

const Pre = styled.pre`
  margin:0; overflow:auto; max-height:320px;
  font-size:12px; background:${({ theme }) => theme.colors.backgroundAlt};
  padding:${({ theme }) => theme.spacings.md}; border-radius:${({ theme }) => theme.radii.md};
`;

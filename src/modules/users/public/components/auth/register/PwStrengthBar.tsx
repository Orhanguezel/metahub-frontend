"use client";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface Props {
  score: number; // 0–4 arası
  className?: string;
}

export default function PwStrengthBar({ score, className }: Props) {
  const { t } = useTranslation("register");
  // Anahtarlar sıralı olarak üç dilde register.json'a eklenmeli!
  const labels = [
    t("pwStrength.veryWeak", "Very Weak"),
    t("pwStrength.weak", "Weak"),
    t("pwStrength.medium", "Medium"),
    t("pwStrength.strong", "Strong"),
    t("pwStrength.veryStrong", "Very Strong"),
  ];

  return (
    <BarContainer className={className} aria-live="polite">
      <Bar>
        {[0, 1, 2, 3, 4].map((i) => (
          <StrengthBlock
            key={i}
            $active={i <= score}
            $score={score}
            aria-label={labels[score]}
            role="presentation"
          />
        ))}
      </Bar>
      <Label $score={score}>{labels[score]}</Label>
    </BarContainer>
  );
}

// --- Styled Components ---
const BarContainer = styled.div`
  margin-top: 0.65rem;
  margin-bottom: 0.15rem;
  width: 100%;
`;

const Bar = styled.div`
  display: flex;
  gap: 6px;
  height: 12px;
  width: 100%;
`;

const StrengthBlock = styled.div<{ $active: boolean; $score: number }>`
  flex: 1;
  border-radius: 7px;
  background: ${({ $active, $score, theme }) => {
    if (!$active) return theme.colors.skeletonBackground || theme.colors.border;
    if ($score === 0) return `linear-gradient(90deg, ${theme.colors.danger}, ${theme.colors.dangerHover || "#c82333"})`;
    if ($score === 1) return `linear-gradient(90deg, ${theme.colors.warning}, #ffd966)`;
    if ($score === 2) return `linear-gradient(90deg, ${theme.colors.info}, #44e3ff)`;
    if ($score === 3) return `linear-gradient(90deg, ${theme.colors.success}, #44e36d)`;
    return `linear-gradient(90deg, ${theme.colors.success}, #18c186)`;
  }};
  box-shadow: ${({ $active, $score }) =>
    $active && $score >= 2 ? "0 2px 6px 0 rgba(60,180,130,0.13)" : "none"};
  opacity: ${({ $active }) => ($active ? 1 : 0.38)};
  transition: background 0.38s, opacity 0.18s;
`;

const Label = styled.div<{ $score: number }>`
  font-size: 0.99em;
  font-weight: 600;
  margin-top: 6px;
  min-height: 1.3em;
  letter-spacing: 0.04em;
  text-align: left;

  color: ${({ $score, theme }) =>
    $score === 0
      ? theme.colors.danger
      : $score === 1
      ? theme.colors.warning
      : $score === 2
      ? theme.colors.info
      : $score === 3
      ? theme.colors.success
      : theme.colors.success};
`;

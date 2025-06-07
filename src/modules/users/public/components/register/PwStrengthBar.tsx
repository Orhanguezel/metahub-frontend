"use client";
import { useTranslation } from "react-i18next";
import {
  BarContainer,
  StrengthBar,
  StrengthBlock,
  PwLabel,
} from "@/modules/users/styles/AuthStyles";

interface Props {
  score: number;
  className?: string;
}

export default function PwStrengthBar({ score, className }: Props) {
  const { t } = useTranslation("register");
  const labels = [
    t("pwStrength.veryWeak", "Very Weak"),
    t("pwStrength.weak", "Weak"),
    t("pwStrength.medium", "Medium"),
    t("pwStrength.strong", "Strong"),
    t("pwStrength.veryStrong", "Very Strong"),
  ];

  return (
    <BarContainer className={className} aria-live="polite">
      <StrengthBar>
        {[0, 1, 2, 3, 4].map((i) => (
          <StrengthBlock
            key={i}
            $active={i <= score}
            $score={score}
            aria-label={labels[score]}
          />
        ))}
      </StrengthBar>
      <PwLabel $score={score}>{labels[score]}</PwLabel>
    </BarContainer>
  );
}

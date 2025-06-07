"use client";

import { FaInfoCircle } from "react-icons/fa";
import { InfoTooltip } from "@/modules/users/styles/AuthStyles";

interface Props {
  text: string;
}

export default function RegisterInfoTooltip({ text }: Props) {
  return (
    <InfoTooltip aria-label={text}>
      <FaInfoCircle size={16} />
      <span>{text}</span>
    </InfoTooltip>
  );
}
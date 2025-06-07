"use client";
import { useParams } from "next/navigation";
import { ResetPasswordStepper } from "@/modules/users";

export default function ResetPasswordRoutePage() {
  const { token } = useParams() as { token: string };
  return <ResetPasswordStepper token={token} />;
}
"use client";
import { ResetPasswordStepper } from "@/modules/users";

export default function ResetPasswordRoutePage({ params }: { params: { token: string } }) {
  return <ResetPasswordStepper token={params.token} />;
}



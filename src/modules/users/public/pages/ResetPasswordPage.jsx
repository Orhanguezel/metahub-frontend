"use client";
import React from "react";
import { useParams } from "react-router-dom";
import { ResetPasswordStepper } from "@/modules/users";

// Route: /reset-password/:token
export default function ResetPasswordPage() {
  const { token } = useParams();
  return <ResetPasswordStepper token={token} />;
}


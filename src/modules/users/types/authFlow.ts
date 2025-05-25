export type AuthStepType = "login" | "register" | "forgot" | "reset" | "change" | "otp"| "verifyEmail" | "done";;

export interface AuthStep {
  step: AuthStepType;
  payload?: any; // İleride (email, smsCode, vb.) gerekirse.
}



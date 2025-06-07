export interface ProfileImageObj {
  url: string;
  thumbnail?: string;
  webp?: string;
  publicId?: string;
}
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator" | "staff" | "customer";
  profileImage: string | ProfileImageObj;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  needOtp?: boolean;
  otpSession?: string | null;
  mfaRequired?: boolean;
  emailVerifyRequired?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  recaptchaToken: string;
}

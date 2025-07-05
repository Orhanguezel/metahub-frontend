import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { fetchCurrentUser } from "./accountSlice";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "user" | "moderator" | "staff" | "customer";
  profileImage: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  needOtp?: boolean;
  mfaRequired?: boolean;
  emailVerifyRequired?: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  successMessage: null,
  needOtp: false,
  mfaRequired: false,
  emailVerifyRequired: false,
};

// Send OTP (SMS/Email)
export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (data: { email: string }, thunkAPI) => {
    try {
      const res = await apiCall(
        "post",
        "/users/advanced-auth/resend-otp",
        data,
        thunkAPI.rejectWithValue
      );
      return { message: res.message || "OTP was resent." };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "OTP could not be sent."
      );
    }
  }
);

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (data: { email: string }, thunkAPI) => {
    try {
      const res = await apiCall(
        "post",
        "/users/advanced-auth/send-otp",
        data,
        thunkAPI.rejectWithValue
      );
      // Artık session yok, sadece mesaj ve belki needOtp dönebiliriz.
      return { message: res.message, needOtp: true };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "OTP could not be sent."
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data: { email: string; code: string }, thunkAPI) => {
    try {
      const res = await apiCall(
        "post",
        "/users/advanced-auth/verify-otp",
        data,
        thunkAPI.rejectWithValue
      );
      const user = await thunkAPI.dispatch(fetchCurrentUser()).unwrap();
      thunkAPI.dispatch(setAuthUser(user));
      return { user, message: res.message || "Verification successful." };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "OTP verification failed."
      );
    }
  }
);

export const resendEmailVerification = createAsyncThunk(
  "auth/resendEmailVerification",
  async (data: { email: string }, thunkAPI) => {
    try {
      const res = await apiCall(
        "post",
        "/users/advanced-auth/send-verification",
        data,
        thunkAPI.rejectWithValue
      );
      return { message: res.message || "Verification email was sent." };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message ||
          "Verification email could not be sent."
      );
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, thunkAPI) => {
    try {
      const res = await apiCall(
        "post",
        "/users/advanced-auth/verify-email",
        { token },
        thunkAPI.rejectWithValue
      );
      return { message: res.message || "Email verified successfully." };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Email verification failed."
      );
    }
  }
);

export const verifyMfa = createAsyncThunk(
  "auth/verifyMfa",
  async (data: { code: string }, thunkAPI) => {
    try {
      const res = await apiCall(
        "post",
        "/users/advanced-auth/verify-mfa",
        data,
        thunkAPI.rejectWithValue
      );
      const user = await thunkAPI.dispatch(fetchCurrentUser()).unwrap();
      thunkAPI.dispatch(setAuthUser(user));
      return { user, message: res.message || "MFA verification successful." };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "MFA verification failed."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setAuthUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    const failed = (state: AuthState, action: { payload?: any }) => {
      state.loading = false;
      state.error =
        typeof action.payload === "string"
          ? action.payload
          : action.payload?.message || "Operation failed.";
    };

    const loading = (state: AuthState) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    };

    builder
      // OTP
      .addCase(resendOtp.pending, loading)
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message ?? null;
      })
      .addCase(resendOtp.rejected, failed)

      .addCase(sendOtp.pending, loading)
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.needOtp = !!action.payload?.needOtp;
        state.successMessage = action.payload?.message ?? null;
      })
      .addCase(sendOtp.rejected, failed)

      .addCase(verifyOtp.pending, loading)
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user ?? null;
        state.needOtp = false;
        state.successMessage = action.payload?.message ?? null;
      })
      .addCase(verifyOtp.rejected, failed)

      // E-posta doğrulama
      .addCase(resendEmailVerification.pending, loading)
      .addCase(resendEmailVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message ?? null;
      })
      .addCase(resendEmailVerification.rejected, failed)

      .addCase(verifyEmail.pending, loading)
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message ?? null;
      })
      .addCase(verifyEmail.rejected, failed)

      // MFA
      .addCase(verifyMfa.pending, loading)
      .addCase(verifyMfa.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user ?? null;
        state.mfaRequired = false;
        state.successMessage = action.payload?.message ?? null;
      })
      .addCase(verifyMfa.rejected, failed);
  },
});

export const { clearAuthMessages, setAuthUser } = authSlice.actions;
export default authSlice.reducer;

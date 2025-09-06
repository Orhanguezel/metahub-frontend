import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { User } from "@/modules/users/types/user";

export interface AuthState {
  user: User | null;
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
  needOtp?: boolean;
  otpSession?: string | null;
  mfaRequired?: boolean;
  emailVerifyRequired?: boolean;
}

interface LoginPayload { email: string; password: string; }
interface RegisterPayload { name: string; email: string; password: string; recaptchaToken: string; }

type LoginResult = {
  user: User | null;
  needOtp?: boolean;
  mfaRequired?: boolean;
  emailVerifyRequired?: boolean;
  otpSession?: string | null;
};

const initialState: AuthState = {
  user: null,
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
  needOtp: false,
  otpSession: null,
  mfaRequired: false,
  emailVerifyRequired: false,
};

// --- THUNKS ---
export const loginUser = createAsyncThunk<
  LoginResult,
  LoginPayload,
  { rejectValue: { message: string } | string }
>(
  "auth/loginUser",
  async (data, thunkAPI) => {
    try {
      // apiCall zaten response.data döndürür
      const res: any = await apiCall("post", "/users/login", data, thunkAPI.rejectWithValue);

      // Olası server yanıt şekilleri:
      // A) { success, data:{ user, needOtp?, mfaRequired?, emailVerifyRequired?, otpSession? }, needOtp? ... }
      // B) { user, needOtp?, mfaRequired?, emailVerifyRequired?, otpSession? }
      // C) sadece { data:{ user } }
      const flat = (res && typeof res === "object") ? (res.data ?? res) : {};
      const user: User | null = flat.user ?? res?.user ?? null;

      const needOtp = Boolean(
        flat.needOtp ?? res?.needOtp ?? flat.mfaRequired ?? res?.mfaRequired ?? (user as any)?.mfaEnabled
      );
      const mfaRequired = Boolean(flat.mfaRequired ?? res?.mfaRequired ?? needOtp);
      const emailVerifyRequired = Boolean(flat.emailVerifyRequired ?? res?.emailVerifyRequired);
      const otpSession = flat.otpSession ?? res?.otpSession ?? null;

      return { user, needOtp, mfaRequired, emailVerifyRequired, otpSession };
    } catch (error: any) {
      const msg: string =
        error?.message ||
        error?.response?.data?.message ||
        "Login failed";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const registerUser = createAsyncThunk<
  { message: string },
  RegisterPayload,
  { rejectValue: string }
>(
  "auth/registerUser",
  async (formData, thunkAPI) => {
    try {
      const res: any = await apiCall("post", "/users/register", formData, thunkAPI.rejectWithValue);
      return { message: res?.message || "Registration successful" };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || err?.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const changePassword = createAsyncThunk<
  { message: string },
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>(
  "auth/changePassword",
  async (data, thunkAPI) => {
    try {
      const res: any = await apiCall("put", "/users/account/me/password", data, thunkAPI.rejectWithValue);
      return { message: res?.message || "Password changed successfully." };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.message || err?.response?.data?.message || "Password change failed"
      );
    }
  }
);

export const resetPassword = createAsyncThunk<
  { message: string },
  { token: string; newPassword: string },
  { rejectValue: string }
>(
  "auth/resetPassword",
  async (data, thunkAPI) => {
    try {
      const res: any = await apiCall(
        "post",
        `/users/reset-password/${data.token}`,
        { newPassword: data.newPassword },
        thunkAPI.rejectWithValue
      );
      return { message: res?.message || "Password reset successfully." };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.message || error?.response?.data?.message || "Reset password failed"
      );
    }
  }
);

export const forgotPassword = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: string }
>(
  "auth/forgotPassword",
  async (data, thunkAPI) => {
    try {
      const res: any = await apiCall("post", "/users/forgot-password", data, thunkAPI.rejectWithValue);
      return { message: res?.message || "Reset email sent." };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.message || error?.response?.data?.message || "Forgot password failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      const res: any = await apiCall("post", "/users/logout", null, thunkAPI.rejectWithValue);
      return { message: res?.message || "Logged out successfully." };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.message || error?.response?.data?.message || "Logout failed"
      );
    }
  }
);

// --- REDUCER HELPERS ---
const setLoading = (state: AuthState) => {
  state.loading = true;
  state.status = "loading";
  state.error = null;
  state.successMessage = null;
};
const setSucceeded = (state: AuthState) => {
  state.loading = false;
  state.status = "succeeded";
};
const setFailed = (state: AuthState, action: PayloadAction<any>) => {
  state.loading = false;
  state.status = "failed";
  state.error =
    typeof action.payload === "string"
      ? action.payload
      : action.payload && typeof action.payload === "object" && "message" in action.payload
      ? (action.payload as any).message
      : "Auth işlemi başarısız";
};

// --- SLICE ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    setAuthUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    resetAuthState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, setLoading)
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResult | undefined>) => {
        setSucceeded(state);
        const payload = action.payload ?? { user: null };
        state.user = payload.user ?? null;
        state.successMessage = "Login successful.";
        state.needOtp = !!(payload.needOtp || payload.mfaRequired);
        state.otpSession = payload.otpSession ?? null;
        state.mfaRequired = !!payload.mfaRequired;
        state.emailVerifyRequired = !!payload.emailVerifyRequired;
      })
      .addCase(loginUser.rejected, setFailed)

      // REGISTER
      .addCase(registerUser.pending, setLoading)
      .addCase(registerUser.fulfilled, (state, action) => {
        setSucceeded(state);
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, setFailed)

      // CHANGE PASSWORD
      .addCase(changePassword.pending, setLoading)
      .addCase(changePassword.fulfilled, (state, action) => {
        setSucceeded(state);
        state.successMessage = action.payload.message;
      })
      .addCase(changePassword.rejected, setFailed)

      // RESET PASSWORD
      .addCase(resetPassword.pending, setLoading)
      .addCase(resetPassword.fulfilled, (state, action) => {
        setSucceeded(state);
        state.successMessage = action.payload.message;
      })
      .addCase(resetPassword.rejected, setFailed)

      // FORGOT PASSWORD
      .addCase(forgotPassword.pending, setLoading)
      .addCase(forgotPassword.fulfilled, (state, action) => {
        setSucceeded(state);
        state.successMessage = action.payload.message;
      })
      .addCase(forgotPassword.rejected, setFailed)

      // LOGOUT
      .addCase(logoutUser.pending, setLoading)
      .addCase(logoutUser.fulfilled, (state, action) => {
        Object.assign(state, initialState);
        state.status = "succeeded";
        state.successMessage = action.payload.message;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.user = null;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload && typeof action.payload === "object" && "message" in action.payload
            ? (action.payload as any).message
            : "Logout failed";
      });
  },
});

export const { clearAuthMessages, setAuthUser, resetAuthState } = authSlice.actions;
export default authSlice.reducer;

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

interface LoginPayload {
  email: string;
  password: string;
}
interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  recaptchaToken: string;
}

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
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data: LoginPayload, thunkAPI) => {
    try {
      const res = await apiCall(
        "post",
        "/users/login",
        data,
        thunkAPI.rejectWithValue
      );
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Login failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData: RegisterPayload, thunkAPI) => {
    try {
      const res = await apiCall(
        "post",
        "/users/register",
        formData,
        thunkAPI.rejectWithValue
      );
      return { message: res.message || "Registration successful" };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: { currentPassword: string; newPassword: string }, thunkAPI) => {
    try {
      const res = await apiCall(
        "put",
        "/users/account/me/password",
        data,
        thunkAPI.rejectWithValue
      );
      return { message: res.message || "Password changed successfully." };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Password change failed"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: { token: string; newPassword: string }, thunkAPI) => {
    try {
      const res = await apiCall(
        "post",
        `/users/reset-password/${data.token}`,
        { newPassword: data.newPassword },
        thunkAPI.rejectWithValue
      );
      return { message: res.message || "Password reset successfully." };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Reset password failed"
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data: { email: string }, thunkAPI) => {
    try {
      const res = await apiCall(
        "post",
        "/users/forgot-password",
        data,
        thunkAPI.rejectWithValue
      );
      return { message: res.message || "Reset email sent." };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Forgot password failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      const res = await apiCall(
        "post",
        "/users/logout",
        null,
        thunkAPI.rejectWithValue
      );
      return { message: res.message || "Logged out successfully." };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Logout failed"
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
      : action.payload &&
        typeof action.payload === "object" &&
        "message" in action.payload
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
      .addCase(loginUser.fulfilled, (state, action) => {
        setSucceeded(state);
        state.user = action.payload;
        state.successMessage = "Login successful.";
        state.needOtp = !!action.payload.needOtp;
        state.otpSession = action.payload.otpSession || null;
        state.mfaRequired = !!action.payload.mfaRequired;
        state.emailVerifyRequired = !!action.payload.emailVerifyRequired;
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
            : action.payload &&
              typeof action.payload === "object" &&
              "message" in action.payload
            ? (action.payload as any).message
            : "Logout failed";
      });
  },
});

export const { clearAuthMessages, setAuthUser, resetAuthState } = authSlice.actions;
export default authSlice.reducer;

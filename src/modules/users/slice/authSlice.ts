import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";


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

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  needOtp?: boolean; // true: kullanıcıdan OTP isteniyor
  otpSession?: string | null; // backend’in döndürdüğü session ya da token
  mfaRequired?: boolean; // true: ek güvenlik (2FA) adımı
  emailVerifyRequired?: boolean; // register sonrası aktif olur
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
  error: null,
  successMessage: null,
  needOtp: false,
  otpSession: null,
  mfaRequired: false,
  emailVerifyRequired: false,
};


// 🔐 Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data: LoginPayload, thunkAPI) => {
    try {
      const res = await apiCall("post", "/users/login", data, thunkAPI.rejectWithValue);
      // Eğer backend direkt user döndürüyorsa:
      return res.data; // veya sadece res.data.data (payload: user objesi olacak)
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Login failed"
      );
    }
  }
);



// 📝 Register
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

// 🔐 Change password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: { currentPassword: string; newPassword: string }, thunkAPI) => {
    try {
      const res = await apiCall(
        "put",
        "/account/me/password",
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

// 🔑 Reset password
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

// ❓ Forgot Password
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

// 🚪 Logout
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

// 🔧 Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
   setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
  state.user = action.payload;
},

  },
  extraReducers: (builder) => {
    const loading = (state: AuthState) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    };

    const failed = (state: AuthState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder

      .addCase(loginUser.pending, loading)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = "Login successful.";
        // Eğer OTP/MFA istendi ise
        state.needOtp = !!action.payload.needOtp;
        state.otpSession = action.payload.otpSession || null;
        state.mfaRequired = !!action.payload.mfaRequired;
        state.emailVerifyRequired = !!action.payload.emailVerifyRequired;
      })

      .addCase(loginUser.rejected, failed)

      .addCase(registerUser.pending, loading)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, failed)

      .addCase(changePassword.pending, loading)
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(changePassword.rejected, failed)

      .addCase(resetPassword.pending, loading)
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(resetPassword.rejected, failed)

      .addCase(forgotPassword.pending, loading)
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(forgotPassword.rejected, failed)

      .addCase(logoutUser.pending, loading)
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.successMessage = action.payload.message;
      })
      .addCase(logoutUser.rejected, failed);
  },
});

export const { clearAuthMessages, setAuthUser } = authSlice.actions;
export default authSlice.reducer;

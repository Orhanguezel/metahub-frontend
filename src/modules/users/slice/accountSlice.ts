import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { Account, NotificationSettings, SocialMediaLinks,ProfileImageObj } from "@/modules/users/types/user";



export interface AccountState {
  profile: Account | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AccountState = {
  profile: null,
  loading: false,
  error: null,
  successMessage: null,
};

export const fetchCurrentUser = createAsyncThunk(
  "account/fetchCurrentUser",
  async (_, thunkAPI) => {
    return await apiCall(
      "get",
      "/users/account/me",
      null,
      thunkAPI.rejectWithValue
    );
  }
);

export const updateMyProfile = createAsyncThunk(
  "account/updateMyProfile",
  async (
    data: { name?: string; email?: string; phone?: string; language?: string },
    thunkAPI
  ) => {
    return await apiCall(
      "put",
      "/users/account/me/update",
      data,
      thunkAPI.rejectWithValue
    );
  }
);

export const updateMyPassword = createAsyncThunk(
  "account/updateMyPassword",
  async (data: { currentPassword: string; newPassword: string }, thunkAPI) => {
    return await apiCall(
      "put",
      "/users/account/me/password",
      data,
      thunkAPI.rejectWithValue
    );
  }
);

export const updateProfileImage = createAsyncThunk(
  "account/updateProfileImage",
  async (file: File, thunkAPI) => {
    const formData = new FormData();
    formData.append("images", file);
    return await apiCall(
      "put",
      "/users/account/me/profile-image",
      formData,
      thunkAPI.rejectWithValue
  );
  }
);

export const updateNotificationSettings = createAsyncThunk(
  "account/updateNotificationSettings",
  async (data: NotificationSettings, thunkAPI) => {
    return await apiCall(
      "patch",
      "/users/account/me/notifications",
      data,
      thunkAPI.rejectWithValue
    );
  }
);

export const updateSocialMediaLinks = createAsyncThunk(
  "users/account/updateSocialMediaLinks",
  async (data: SocialMediaLinks, thunkAPI) => {
    return await apiCall(
      "patch",
      "/users/account/me/social",
      data,
      thunkAPI.rejectWithValue
    );
  }
);

export const deleteUserAccount = createAsyncThunk(
  "account/deleteUserAccount",
  async (payload: { password: string }, thunkAPI) => {
    return await apiCall(
      "post",
      "/users/account/me/delete",
      payload,
      thunkAPI.rejectWithValue
    );
  }
);

// --- Slice ---
const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    clearAccountMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: AccountState) => {
      state.loading = true;
      state.error = null;
    };

    const failed = (state: AccountState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error =
        typeof action.payload === "string"
          ? action.payload
          : action.payload?.message || "An error occurred.";
    };

    builder
      .addCase(fetchCurrentUser.pending, loading)
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload?.user || action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        // Eğer hata 401/unauthorized ise, error alanını null bırak!
        const payload = action.payload as any;
        const isAuthError =
          (typeof payload === "object" &&
            (payload.status === 401 || payload.statusCode === 401)) ||
          (typeof payload === "string" &&
            payload.toLowerCase().includes("unauthorized"));
        state.profile = null;
        if (isAuthError) {
          state.error = null;
        } else if (typeof payload === "string") {
          state.error = payload;
        } else if (
          payload &&
          typeof payload === "object" &&
          "message" in payload
        ) {
          state.error = payload.message;
        } else {
          state.error = "User profile could not be loaded.";
        }
      })

      .addCase(updateMyProfile.pending, loading)
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.profile = { ...state.profile, ...action.payload.user };
      })
      .addCase(updateMyProfile.rejected, failed)
      .addCase(updateMyPassword.pending, loading)
      .addCase(updateMyPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(updateMyPassword.rejected, failed)
      .addCase(updateNotificationSettings.pending, loading)
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile)
          state.profile.notifications = action.payload.notifications;
        state.successMessage = action.payload.message;
      })
      .addCase(updateNotificationSettings.rejected, failed)
      .addCase(updateSocialMediaLinks.pending, loading)
      .addCase(updateSocialMediaLinks.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile)
          state.profile.socialMedia = action.payload.socialMedia;
        state.successMessage = action.payload.message;
      })
      .addCase(updateSocialMediaLinks.rejected, failed)
      .addCase(updateProfileImage.pending, loading)
      .addCase(updateProfileImage.fulfilled, (state, action: PayloadAction<{
        profileImage: ProfileImageObj;
        message?: string;
      }>) => {
        state.loading = false;
        if (state.profile)
          state.profile.profileImage = action.payload.profileImage;
        state.successMessage = action.payload.message || "profile.imageUpdated";
      })
      .addCase(updateProfileImage.rejected, failed)
      .addCase(deleteUserAccount.pending, loading)
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
        state.successMessage = "account.delete.success";
      })
      .addCase(deleteUserAccount.rejected, failed);
  },
});

export const { clearAccountMessages, resetProfile } = accountSlice.actions;
export default accountSlice.reducer;

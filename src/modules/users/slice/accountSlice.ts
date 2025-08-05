import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  Account,
  NotificationSettings,
  SocialMediaLinks,
  ProfileImageObj,
} from "@/modules/users/types/user";
import { setAuthUser } from "@/modules/users/slice/authSlice";

export interface AccountState {
  profile: Account | null;
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}

const initialState: AccountState = {
  profile: null,
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
};

// --- Async Thunks ---
export const fetchCurrentUser = createAsyncThunk(
  "account/fetchCurrentUser",
  async (_, thunkAPI) => {
    const response = await apiCall(
      "get",
      "/users/account/me",
      null,
      thunkAPI.rejectWithValue
    );
    thunkAPI.dispatch(setAuthUser(response?.user || response));
    return response;
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
  "account/updateSocialMediaLinks",
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

export const removeProfileImage = createAsyncThunk(
  "account/removeProfileImage",
  async (_, thunkAPI) => {
    return await apiCall(
      "delete",
      "/users/account/me/profile-image",
      null,
      thunkAPI.rejectWithValue
    );
  }
);

// --- Reducer helpers ---
const setLoading = (state: AccountState) => {
  state.loading = true;
  state.status = "loading";
  state.error = null;
  state.successMessage = null;
};
const setSucceeded = (state: AccountState) => {
  state.loading = false;
  state.status = "succeeded";
};
const setFailed = (state: AccountState, action: PayloadAction<any>) => {
  state.loading = false;
  state.status = "failed";
  state.error =
    typeof action.payload === "string"
      ? action.payload
      : action.payload?.message || "An error occurred.";
};

// --- Slice ---
const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    clearAccountMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    resetProfile: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH USER
      .addCase(fetchCurrentUser.pending, setLoading)
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        setSucceeded(state);
        state.profile = action.payload?.user || action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
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

      // UPDATE PROFILE
      .addCase(updateMyProfile.pending, setLoading)
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        setSucceeded(state);
        state.successMessage = action.payload.message;
        state.profile = { ...state.profile, ...action.payload.user };
      })
      .addCase(updateMyProfile.rejected, setFailed)

      // UPDATE PASSWORD
      .addCase(updateMyPassword.pending, setLoading)
      .addCase(updateMyPassword.fulfilled, (state, action) => {
        setSucceeded(state);
        state.successMessage = action.payload.message;
      })
      .addCase(updateMyPassword.rejected, setFailed)

      // NOTIFICATION SETTINGS
      .addCase(updateNotificationSettings.pending, setLoading)
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        setSucceeded(state);
        if (state.profile)
          state.profile.notifications = action.payload.notifications;
        state.successMessage = action.payload.message;
      })
      .addCase(updateNotificationSettings.rejected, setFailed)

      // SOCIAL MEDIA LINKS
      .addCase(updateSocialMediaLinks.pending, setLoading)
      .addCase(updateSocialMediaLinks.fulfilled, (state, action) => {
        setSucceeded(state);
        if (state.profile)
          state.profile.socialMedia = action.payload.socialMedia;
        state.successMessage = action.payload.message;
      })
      .addCase(updateSocialMediaLinks.rejected, setFailed)

      // PROFILE IMAGE
      .addCase(updateProfileImage.pending, setLoading)
      .addCase(
        updateProfileImage.fulfilled,
        (state, action: PayloadAction<{ profileImage: ProfileImageObj; message?: string }>) => {
          setSucceeded(state);
          if (state.profile)
            state.profile.profileImage = action.payload.profileImage;
          state.successMessage = action.payload.message || "profile.imageUpdated";
        }
      )
      .addCase(updateProfileImage.rejected, setFailed)

      // DELETE USER ACCOUNT
      .addCase(deleteUserAccount.pending, setLoading)
      .addCase(deleteUserAccount.fulfilled, (state) => {
        setSucceeded(state);
        state.profile = null;
        state.successMessage = "account.delete.success";
      })
      .addCase(deleteUserAccount.rejected, setFailed)

      // REMOVE PROFILE IMAGE
      .addCase(removeProfileImage.pending, setLoading)
      .addCase(removeProfileImage.fulfilled, (state) => {
        setSucceeded(state);
        if (state.profile) {
          state.profile.profileImage = null;
        }
        state.successMessage = "profile.imageRemoved";
      })
      .addCase(removeProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        const payload = action.payload as any;
        state.error =
          typeof payload === "string"
            ? payload
            : payload?.message || "profile.imageRemoveError";
      });
  },
});

export const { clearAccountMessages, resetProfile } = accountSlice.actions;
export default accountSlice.reducer;

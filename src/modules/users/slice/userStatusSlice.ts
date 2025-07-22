// src/store/userStatusSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

// --- State tipi ---
interface UserStatusState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: UserStatusState = {
  loading: false,
  error: null,
  successMessage: null,
};

// 🟢 Kullanıcı aktiflik durumunu değiştir (admin)
export const toggleUserStatus = createAsyncThunk<
  { _id: string; isActive: boolean }, // fulfilled type
  string, // userId
  { rejectValue: { status: any; message: string; data: any } }
>(
  "userStatus/toggleUserStatus",
  async (id, thunkAPI) => {
    return await apiCall(
      "put",
      `/users/users/${id}/status`,
      null,
      thunkAPI.rejectWithValue
    );
  }
);

// 🟢 Kullanıcı rolünü değiştir (admin)
export const updateUserRole = createAsyncThunk<
  { _id: string; role: string }, // fulfilled type
  { id: string; role: string },
  { rejectValue: { status: any; message: string; data: any } }
>(
  "userStatus/updateUserRole",
  async ({ id, role }, thunkAPI) => {
    return await apiCall(
      "put",
      `/users/users/${id}/role`,
      { role },
      thunkAPI.rejectWithValue
    );
  }
);

// --- Slice ---
const userStatusSlice = createSlice({
  name: "userStatus",
  initialState,
  reducers: {
    clearUserStatusMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Aktiflik
    builder.addCase(toggleUserStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(
      toggleUserStatus.fulfilled,
      (state, action: PayloadAction<{ _id: string; isActive: boolean }>) => {
        state.loading = false;
        state.successMessage = action.payload.isActive
          ? "Kullanıcı aktifleştirildi."
          : "Kullanıcı pasifleştirildi.";
        state.error = null;
      }
    );
    builder.addCase(toggleUserStatus.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.payload?.message || "Kullanıcı durumu güncellenemedi!";
      state.successMessage = null;
    });

    // Rol güncelleme
    builder.addCase(updateUserRole.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(
      updateUserRole.fulfilled,
      (state) => {
        state.loading = false;
        state.successMessage = "Kullanıcı rolü başarıyla güncellendi.";
        state.error = null;
      }
    );
    builder.addCase(updateUserRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "Rol güncellenemedi!";
      state.successMessage = null;
    });
  },
});

export const { clearUserStatusMessages } = userStatusSlice.actions;
export default userStatusSlice.reducer;

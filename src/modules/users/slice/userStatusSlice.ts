// src/store/userStatusSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

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

// 🔁 Aktiflik durumunu değiştir (admin)
export const toggleUserStatus = createAsyncThunk<
  { _id: string; isActive: boolean }, // Fulfilled tipi
  string,                             // Payload arg (id)
  { rejectValue: { status: any; message: string; data: any } } // Error tipi
>(
  "userStatus/toggleUserStatus",
  async (id, thunkAPI) => {
    try {
      const response = await apiCall(
        "put",
        `/users/users/${id}/status`,
        null,
        thunkAPI.rejectWithValue
      );
      return response as { _id: string; isActive: boolean };
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        status: err.response?.status || 500,
        message: err.response?.data?.message || "Kullanıcı durumu güncellenemedi.",
        data: null,
      });
    }}
      // 
);

// 🏷️ Kullanıcı rolünü değiştir (admin)
export const updateUserRole = createAsyncThunk<
  void,
  { id: string; role: string },
  { rejectValue: { status: any; message: string; data: any } }
>(
  "userStatus/updateUserRole",
  async ({ id, role }, thunkAPI) => {
    try {
      await apiCall(
        "put",
        `/users/users/${id}/role`,
        { role },
        thunkAPI.rejectWithValue
      );
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        status: err.response?.status || 500,
        message: err.response?.data?.message || "Rol güncellenemedi.",
        data: null,
      });
    }
  }
);

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
    // 🔁 Aktif/Pasif güncelle
    builder.addCase(toggleUserStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(toggleUserStatus.fulfilled, (state, action: PayloadAction<{ _id: string; isActive: boolean }>) => {
      state.loading = false;
      state.successMessage = action.payload.isActive
        ? "Kullanıcı aktifleştirildi."
        : "Kullanıcı pasifleştirildi.";
    });
    builder.addCase(toggleUserStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message ?? "Bilinmeyen bir hata oluştu.";
    });

    // 🎖️ Rol güncelleme
    builder.addCase(updateUserRole.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUserRole.fulfilled, (state) => {
      state.loading = false;
      state.successMessage = "Kullanıcı rolü başarıyla güncellendi.";
    });
    builder.addCase(updateUserRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message ?? "Bilinmeyen bir hata oluştu.";
    });
  },
});

export const { clearUserStatusMessages } = userStatusSlice.actions;
export default userStatusSlice.reducer;

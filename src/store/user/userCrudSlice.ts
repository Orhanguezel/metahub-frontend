import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import API from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator" | "staff" | "customer";
  isActive?: boolean;
  profileImage: string;
  phone?: string;
  bio?: string;
  birthDate?: string;
  addresses?: string[]; // veya Address[]
  socialMedia?: Record<string, string>;
  notifications?: Record<string, any>;
}

interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 📋 Admin: Tüm kullanıcıları getir
export const fetchUsers = createAsyncThunk(
  "userCrud/fetchUsers",
  async (_, thunkAPI) =>
    await apiCall("get", "/users/users", null, thunkAPI.rejectWithValue)
);

// 👤 Admin: Tekil kullanıcıyı getir
export const fetchUserById = createAsyncThunk(
  "userCrud/fetchUserById",
  async (id: string, thunkAPI) =>
    await apiCall("get", `/users/users/${id}`, null, thunkAPI.rejectWithValue)
);

// ✏️ Admin: Kullanıcıyı güncelle (FormData)
export const updateUser = createAsyncThunk(
  "userCrud/updateUser",
  async (payload: { id: string; formData: FormData }, thunkAPI) => {
    try {
      const response = await API.put(`/users/users/${payload.id}`, payload.formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.user;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Fehler beim Aktualisieren des Benutzers.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ❌ Admin: Kullanıcıyı sil
export const deleteUser = createAsyncThunk(
  "userCrud/deleteUser",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/users/users/${id}`, null, thunkAPI.rejectWithValue)
);

// 📦 Slice
const userCrudSlice = createSlice({
  name: "userCrud",
  initialState,
  reducers: {
    clearUserCrudMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: UserState) => {
      state.loading = true;
      state.error = null;
    };

    const failed = (state: UserState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    // Fetch all users
    builder
      .addCase(fetchUsers.pending, loading)
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, failed);

    // Fetch single user
    builder
      .addCase(fetchUserById.pending, loading)
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, failed);

    // Update user
    builder
      .addCase(updateUser.pending, loading)
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Benutzer wurde erfolgreich aktualisiert.";
        const updatedUser = action.payload;
        state.users = state.users.map((u) =>
          u._id === updatedUser._id ? updatedUser : u
        );
        if (state.selectedUser?._id === updatedUser._id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(updateUser.rejected, failed);

    // Delete user
    builder
      .addCase(deleteUser.pending, loading)
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Benutzer wurde erfolgreich gelöscht.";
        const deletedId = action.meta.arg;
        state.users = state.users.filter((u) => u._id !== deletedId);
      })
      .addCase(deleteUser.rejected, failed);
  },
});

export const { clearUserCrudMessages } = userCrudSlice.actions;
export default userCrudSlice.reducer;

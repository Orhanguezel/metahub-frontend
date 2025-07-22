import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { User } from "@/modules/users/types/user";

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

// --- Fetch All Users ---
export const fetchUsers = createAsyncThunk(
  "userCrud/fetchUsers",
  async (_, thunkAPI) => {
    return await apiCall("get", "/users/users", null, thunkAPI.rejectWithValue);
  }
);

// --- Fetch User By ID ---
export const fetchUserById = createAsyncThunk(
  "userCrud/fetchUserById",
  async (id: string, thunkAPI) => {
    return await apiCall("get", `/users/users/${id}`, null, thunkAPI.rejectWithValue);
  }
);

// --- Update User (FormData destekli) ---
export const updateUser = createAsyncThunk(
  "userCrud/updateUser",
  async (payload: { id: string; formData: FormData }, thunkAPI) => {
    return await apiCall(
      "put",
      `/users/users/${payload.id}`,
      payload.formData,
      thunkAPI.rejectWithValue 
    );
  }
);


// --- Delete User ---
export const deleteUser = createAsyncThunk(
  "userCrud/deleteUser",
  async (id: string, thunkAPI) => {
    return await apiCall(
      "delete",
      `/users/users/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
  }
);

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
      state.successMessage = null;
    };

    const failed = (state: UserState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = typeof action.payload === "string"
        ? action.payload
        : action.payload?.message || "Beklenmeyen bir hata oluştu!";
    };

    builder
      .addCase(fetchUsers.pending, loading)
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        // Eğer API { users: [...] } dönerse
        state.users = action.payload?.users || action.payload || [];
      })
      .addCase(fetchUsers.rejected, failed)

      .addCase(fetchUserById.pending, loading)
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload?.user || action.payload || null;
      })
      .addCase(fetchUserById.rejected, failed)

      .addCase(updateUser.pending, loading)
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload?.user || action.payload;
        state.successMessage = "Benutzer wurde erfolgreich aktualisiert.";
        state.users = state.users.map((u) =>
          u._id === updatedUser._id ? updatedUser : u
        );
        if (state.selectedUser?._id === updatedUser._id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(updateUser.rejected, failed)

      .addCase(deleteUser.pending, loading)
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Benutzer wurde erfolgreich gelöscht.";
        const deletedId = action.meta.arg;
        state.users = state.users.filter((u) => u._id !== deletedId);
        if (state.selectedUser?._id === deletedId) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, failed);
  },
});

export const { clearUserCrudMessages } = userCrudSlice.actions;
export default userCrudSlice.reducer;

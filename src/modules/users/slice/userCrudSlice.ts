// src/modules/users/store/userCrudSlice.ts
import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { User } from "@/modules/users/types/user";

/* ---------- API response tipleri ---------- */
type UsersMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} | null;

type ApiError = { status: number | string; message: string; data?: any };

type ListRes   = { success: boolean; message?: string | null; data: User[]; meta?: UsersMeta };
type OneRes    = { success: boolean; message?: string | null; data: User };
type UpdateRes = { success: boolean; message?: string | null; data: User };
type RoleRes   = { success: boolean; message?: string | null; data: User };
type ToggleRes = { success: boolean; message?: string | null; userId: string; isActive: boolean };
type DeleteRes = { success: boolean; message?: string | null; data: { userId: string } };

type ThunkConfig = { rejectValue: ApiError };

/* ---------- Slice state ---------- */
interface UserState {
  users: User[];
  selectedUser: User | null;
  meta: UsersMeta;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  meta: null,
  loading: false,
  error: null,
  successMessage: null,
};

/* ---------- Thunks ---------- */
/** 🔁 PARAMETRESİZ: Parent globalde fetch edecekse bu thunk default listeyi çeker. */
export const fetchUsers = createAsyncThunk<ListRes, void, ThunkConfig>(
  "userCrud/fetchUsers",
  async (_void, thunkAPI) => {
    return await apiCall("get", "/users/users", null, thunkAPI.rejectWithValue);
  }
);

export const fetchUserById = createAsyncThunk<OneRes, string, ThunkConfig>(
  "userCrud/fetchUserById",
  async (id, thunkAPI) => {
    return await apiCall("get", `/users/users/${id}`, null, thunkAPI.rejectWithValue);
  }
);

export const updateUser = createAsyncThunk<UpdateRes, { id: string; formData: FormData }, ThunkConfig>(
  "userCrud/updateUser",
  async ({ id, formData }, thunkAPI) => {
    return await apiCall("put", `/users/users/${id}`, formData, thunkAPI.rejectWithValue);
  }
);

export const updateUserRole = createAsyncThunk<RoleRes, { id: string; role: User["role"] }, ThunkConfig>(
  "userCrud/updateUserRole",
  async ({ id, role }, thunkAPI) => {
    return await apiCall("put", `/users/users/${id}/role`, { role }, thunkAPI.rejectWithValue);
  }
);

export const toggleUserStatus = createAsyncThunk<ToggleRes, { id: string; isActive?: boolean }, ThunkConfig>(
  "userCrud/toggleUserStatus",
  async ({ id, isActive }, thunkAPI) => {
    const body = isActive === undefined ? {} : { isActive };
    return await apiCall("put", `/users/users/${id}/status`, body, thunkAPI.rejectWithValue);
  }
);

export const deleteUser = createAsyncThunk<DeleteRes, string, ThunkConfig>(
  "userCrud/deleteUser",
  async (id, thunkAPI) => {
    return await apiCall("delete", `/users/users/${id}`, null, thunkAPI.rejectWithValue);
  }
);

/* ---------- Slice ---------- */
const userCrudSlice = createSlice({
  name: "userCrud",
  initialState,
  reducers: {
    clearUserCrudMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetSelectedUser: (state) => {
      state.selectedUser = null;
    },
    /** 🧪 Opsiyonel: Parent global fetch yaptıysa doğrudan store’u doldurmak için */
    hydrateUsers: (state, action: { payload: { users: User[]; meta?: UsersMeta; message?: string | null } }) => {
      state.users = action.payload.users || [];
      state.meta = action.payload.meta ?? null;
      state.successMessage = action.payload.message ?? null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* commons */
    const onPending = (state: UserState) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
    };

    type AnyRejected =
      | ReturnType<typeof fetchUsers.rejected>
      | ReturnType<typeof fetchUserById.rejected>
      | ReturnType<typeof updateUser.rejected>
      | ReturnType<typeof updateUserRole.rejected>
      | ReturnType<typeof toggleUserStatus.rejected>
      | ReturnType<typeof deleteUser.rejected>;

    const onRejected = (state: UserState, action: AnyRejected) => {
      state.loading = false;
      state.error =
        (typeof action.payload === "string" && action.payload) ||
        (typeof action.payload === "object" && (action.payload as any)?.message) ||
        action.error?.message ||
        "Unexpected error.";
    };

    builder
      /* LIST */
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || [];
        state.meta = action.payload.meta ?? null;
        state.successMessage = action.payload.message ?? null;
      })

      /* READ */
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload.data || null;
        state.successMessage = action.payload.message ?? null;
      })

      /* UPDATE */
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.data;
        state.successMessage = action.payload.message ?? null;

        if (updatedUser?._id) {
          state.users = state.users.map((u) =>
            u._id === updatedUser._id ? ({ ...u, ...updatedUser } as User) : u
          );
          if (state.selectedUser?._id === updatedUser._id) {
            state.selectedUser = { ...(state.selectedUser as User), ...updatedUser };
          }
        }
      })

      /* UPDATE ROLE */
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data;
        state.successMessage = action.payload.message ?? null;

        if (updated?._id) {
          state.users = state.users.map((u) => (u._id === updated._id ? ({ ...u, ...updated } as User) : u));
          if (state.selectedUser?._id === updated._id) {
            state.selectedUser = { ...(state.selectedUser as User), ...updated };
          }
        }
      })

      /* TOGGLE STATUS */
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, isActive } = action.payload;
        state.successMessage = action.payload.message ?? null;

        if (userId) {
          state.users = state.users.map((u) =>
            u._id === userId ? ({ ...u, isActive: isActive ?? !u.isActive } as User) : u
          );
          if (state.selectedUser?._id === userId) {
            state.selectedUser = {
              ...(state.selectedUser as User),
              isActive: isActive ?? !state.selectedUser!.isActive,
            };
          }
        }
      })

      /* DELETE */
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload?.data?.userId ?? action.meta.arg;
        state.successMessage = action.payload.message ?? null;

        if (deletedId) {
          state.users = state.users.filter((u) => u._id !== deletedId);
          if (state.selectedUser?._id === deletedId) state.selectedUser = null;
        }
      })

      /* --- Matchers: ortak pending/rejected --- */
      .addMatcher(
        isAnyOf(
          fetchUsers.pending,
          fetchUserById.pending,
          updateUser.pending,
          updateUserRole.pending,
          toggleUserStatus.pending,
          deleteUser.pending
        ),
        onPending
      )
      .addMatcher(
        isAnyOf(
          fetchUsers.rejected,
          fetchUserById.rejected,
          updateUser.rejected,
          updateUserRole.rejected,
          toggleUserStatus.rejected,
          deleteUser.rejected
        ),
        onRejected
      );
  },
});

export const {
  clearUserCrudMessages,
  resetSelectedUser,
  hydrateUsers, // ⬅️ parent fetch için opsiyonel
} = userCrudSlice.actions;

export default userCrudSlice.reducer;

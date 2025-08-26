import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IBranch,
  BranchCreatePayload,
  BranchUpdatePayload,
  BranchAdminListParams,
  BranchPublicListParams,
  IBranchAvailability,
} from "../types";

/* ================== Utils ================== */

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in (payload as any)) {
    const msg = (payload as any).message;
    if (typeof msg === "string") return msg;
  }
  return "An error occurred.";
};

const upsert = (arr: IBranch[], item?: IBranch) => {
  if (!item || !item._id) return arr;
  const i = arr.findIndex((x) => String(x._id) === String(item._id));
  if (i >= 0) arr[i] = item;
  else arr.unshift(item);
  return arr;
};

const BASE =`/branch`;

/* ================== Thunks ================== */
/** PUBLIC: list (GET /branch) */
export const fetchBranchesPublic = createAsyncThunk<
  IBranch[],
  BranchPublicListParams | void
>("branch/fetchPublic", async (params, thunkAPI) => {
  const res = await apiCall("get", `${BASE}`, params || {}, thunkAPI.rejectWithValue);
  return (res?.data ?? res) as IBranch[];
});

/** PUBLIC: availability (GET /branch/:id/availability) */
export const fetchBranchAvailability = createAsyncThunk<
  { id: string; data: IBranchAvailability },
  string
>("branch/fetchAvailability", async (id, thunkAPI) => {
  const res = await apiCall("get", `${BASE}/${encodeURIComponent(id)}/availability`, {}, thunkAPI.rejectWithValue);
  // server may return { success, data }, normalize to { id, data }
  const data = (res?.data ?? res) as IBranchAvailability;
  return { id, data };
});

/** ADMIN: list (GET /branch/admin) */
export const fetchBranchesAdmin = createAsyncThunk<
  IBranch[],
  BranchAdminListParams | void
>("branch/fetchAdmin", async (params, thunkAPI) => {
  const res = await apiCall("get", `${BASE}/admin`, params || {}, thunkAPI.rejectWithValue);
  return (res?.data ?? res) as IBranch[];
});

/** ADMIN: get by id (GET /branch/admin/:id) */
export const fetchBranchAdminById = createAsyncThunk<IBranch, string>(
  "branch/fetchAdminById",
  async (id, thunkAPI) => {
    const res = await apiCall("get", `${BASE}/admin/${id}`, {}, thunkAPI.rejectWithValue);
    return (res?.data ?? res) as IBranch;
  }
);

/** ADMIN: create (POST /branch/admin) — JSON */
export const createBranch = createAsyncThunk<
  { success: boolean; message?: string; data?: IBranch },
  BranchCreatePayload
>("branch/create", async (payload, thunkAPI) => {
  const res = await apiCall("post", `${BASE}/admin`, payload, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IBranch };
});

/** ADMIN: update (PUT /branch/admin/:id) — JSON */
export const updateBranch = createAsyncThunk<
  { success: boolean; message?: string; data?: IBranch },
  { id: string; patch: BranchUpdatePayload }
>("branch/update", async ({ id, patch }, thunkAPI) => {
  const res = await apiCall("put", `${BASE}/admin/${id}`, patch, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IBranch };
});

/** ADMIN: convenience — active toggle (PUT /branch/admin/:id) */
export const changeBranchStatus = createAsyncThunk<
  { success: boolean; message?: string; data?: IBranch },
  { id: string; isActive: boolean }
>("branch/changeStatus", async ({ id, isActive }, thunkAPI) => {
  const res = await apiCall("put", `${BASE}/admin/${id}`, { isActive }, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IBranch };
});

/** ADMIN: delete (DELETE /branch/admin/:id) */
export const deleteBranch = createAsyncThunk<
  { id: string; message?: string },
  string
>("branch/delete", async (id, thunkAPI) => {
  const res = await apiCall("delete", `${BASE}/admin/${id}`, {}, thunkAPI.rejectWithValue);
  return { id, message: (res && (res.message as string)) || undefined };
});

/* ================== State ================== */

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface BranchState {
  publicList: IBranch[];
  adminList: IBranch[];
  selected: IBranch | null;

  availabilityById: Record<string, IBranchAvailability | undefined>;

  status: StatusType;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BranchState = {
  publicList: [],
  adminList: [],
  selected: null,

  availabilityById: {},

  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

/* ================== Slice ================== */

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    clearBranchMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    setSelectedBranch(state, action: PayloadAction<IBranch | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: BranchState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
      state.successMessage = null;
    };
    const setError = (state: BranchState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // Public list
    builder
      .addCase(fetchBranchesPublic.pending, startLoading)
      .addCase(fetchBranchesPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.publicList = action.payload;
      })
      .addCase(fetchBranchesPublic.rejected, setError);

    // Public availability
    builder
      .addCase(fetchBranchAvailability.pending, startLoading)
      .addCase(fetchBranchAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const { id, data } = action.payload;
        state.availabilityById = { ...state.availabilityById, [String(id)]: data };
      })
      .addCase(fetchBranchAvailability.rejected, setError);

    // Admin list
    builder
      .addCase(fetchBranchesAdmin.pending, startLoading)
      .addCase(fetchBranchesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.adminList = action.payload;
      })
      .addCase(fetchBranchesAdmin.rejected, setError);

    // Admin by id
    builder
      .addCase(fetchBranchAdminById.pending, startLoading)
      .addCase(fetchBranchAdminById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchBranchAdminById.rejected, setError);

    // Create
    builder
      .addCase(createBranch.pending, startLoading)
      .addCase(createBranch.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const created = action.payload?.data as IBranch | undefined;
        if (created) state.adminList = upsert([...state.adminList], created);
        state.successMessage = action.payload?.message || null;
      })
      .addCase(createBranch.rejected, setError);

    // Update
    const onUpdateFulfilled = (state: BranchState, action: any) => {
      state.loading = false;
      state.status = "succeeded";
      const updated: IBranch = (action.payload?.data || action.payload) as IBranch;
      state.adminList = upsert([...state.adminList], updated);
      if (state.selected && String(state.selected._id) === String(updated._id)) {
        state.selected = updated;
      }
      state.successMessage = action.payload?.message || null;
    };

    builder
      .addCase(updateBranch.pending, startLoading)
      .addCase(updateBranch.fulfilled, onUpdateFulfilled)
      .addCase(updateBranch.rejected, setError);

    // Toggle active
    builder
      .addCase(changeBranchStatus.pending, startLoading)
      .addCase(changeBranchStatus.fulfilled, onUpdateFulfilled)
      .addCase(changeBranchStatus.rejected, setError);

    // Delete
    builder
      .addCase(deleteBranch.pending, startLoading)
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.adminList = state.adminList.filter(
          (m) => String(m._id) !== String(action.payload.id)
        );
        state.successMessage = action.payload?.message || null;
      })
      .addCase(deleteBranch.rejected, setError);
  },
});

export const { clearBranchMessages, setSelectedBranch } = branchSlice.actions;
export default branchSlice.reducer;

/* ================== Selectors ================== */
export const selectBranchesPublic = (s: any) =>
  (s.branch?.publicList ?? []) as IBranch[];

export const selectBranchesAdmin = (s: any) =>
  (s.branch?.adminList ?? []) as IBranch[];

export const selectBranchSelected = (s: any) =>
  (s.branch?.selected ?? null) as IBranch | null;

export const selectBranchAvailability = (s: any, id: string) =>
  (s.branch?.availabilityById?.[String(id)] ?? undefined) as
    | IBranchAvailability
    | undefined;

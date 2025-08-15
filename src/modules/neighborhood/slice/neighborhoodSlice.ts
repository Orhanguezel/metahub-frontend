import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { INeighborhood, NeighborhoodListFilters } from "../types";

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface NeighborhoodState {
  items: INeighborhood[];
  selected: INeighborhood | null;
  status: StatusType;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: NeighborhoodState = {
  items: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const BASE = "/neighborhood";

/* ---------- Thunks ---------- */
export const fetchNeighborhoods = createAsyncThunk<
  INeighborhood[],
  NeighborhoodListFilters | void,
  { rejectValue: string }
>("neighborhood/fetchAll", async (filters, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", `${BASE}/`, filters || {}, rejectWithValue);
    return res.data as INeighborhood[];
  } catch (e: any) {
    return rejectWithValue(e?.message || "Failed to fetch neighborhoods.");
  }
});

export const fetchNeighborhoodById = createAsyncThunk<
  INeighborhood,
  string,
  { rejectValue: string }
>("neighborhood/fetchById", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", `${BASE}/${id}`, {}, rejectWithValue);
    return res.data as INeighborhood;
  } catch (e: any) {
    return rejectWithValue(e?.message || "Failed to fetch neighborhood.");
  }
});

export const createNeighborhood = createAsyncThunk<
  { success?: boolean; message?: string; data?: INeighborhood } & Record<string, any>,
  Partial<INeighborhood>,
  { rejectValue: string }
>("neighborhood/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await apiCall("post", `${BASE}/`, payload, rejectWithValue);
    return res;
  } catch (e: any) {
    return rejectWithValue(e?.message || "Failed to create neighborhood.");
  }
});

export const updateNeighborhood = createAsyncThunk<
  { success?: boolean; message?: string; data?: INeighborhood } & Record<string, any>,
  { id: string; changes: Partial<INeighborhood> },
  { rejectValue: string }
>("neighborhood/update", async ({ id, changes }, { rejectWithValue }) => {
  try {
    const res = await apiCall("patch", `${BASE}/${id}`, changes, rejectWithValue);
    return res;
  } catch (e: any) {
    return rejectWithValue(e?.message || "Failed to update neighborhood.");
  }
});

export const deleteNeighborhood = createAsyncThunk<
  { id: string; message?: string },
  string,
  { rejectValue: string }
>("neighborhood/delete", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("delete", `${BASE}/${id}`, {}, rejectWithValue);
    return { id, message: res?.message as string | undefined };
  } catch (e: any) {
    return rejectWithValue(e?.message || "Failed to delete neighborhood.");
  }
});

/* ---------- Slice ---------- */
const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in (payload as any)) {
    const msg = (payload as any).message;
    if (typeof msg === "string") return msg;
  }
  return "An error occurred.";
};

const neighborhoodSlice = createSlice({
  name: "neighborhood",
  initialState,
  reducers: {
    clearNeighborhoodMessages(s) {
      s.error = null;
      s.successMessage = null;
      s.status = "idle";
    },
    setSelectedNeighborhood(s, a: PayloadAction<INeighborhood | null>) {
      s.selected = a.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (s: NeighborhoodState) => {
      s.loading = true;
      s.status = "loading";
      s.error = null;
      s.successMessage = null;
    };
    const setError = (s: NeighborhoodState, a: PayloadAction<any>) => {
      s.loading = false;
      s.status = "failed";
      s.error = extractErrorMessage(a.payload);
      s.successMessage = null;
    };

    builder
      .addCase(fetchNeighborhoods.pending, startLoading)
      .addCase(fetchNeighborhoods.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        s.items = a.payload;
      })
      .addCase(fetchNeighborhoods.rejected, setError)

      .addCase(fetchNeighborhoodById.pending, startLoading)
      .addCase(fetchNeighborhoodById.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        s.selected = a.payload;
      })
      .addCase(fetchNeighborhoodById.rejected, setError)

      .addCase(createNeighborhood.pending, startLoading)
      .addCase(createNeighborhood.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        const created = a.payload?.data as INeighborhood | undefined;
        if (created) s.items.unshift(created);
        s.successMessage = a.payload?.message || null;
      })
      .addCase(createNeighborhood.rejected, setError)

      .addCase(updateNeighborhood.pending, startLoading)
      .addCase(updateNeighborhood.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        const updated = (a.payload?.data || a.payload) as INeighborhood;
        s.items = s.items.map(it => String(it._id) === String(updated._id) ? updated : it);
        if (s.selected && String(s.selected._id) === String(updated._id)) s.selected = updated;
        s.successMessage = a.payload?.message || null;
      })
      .addCase(updateNeighborhood.rejected, setError)

      .addCase(deleteNeighborhood.pending, startLoading)
      .addCase(deleteNeighborhood.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        s.items = s.items.filter(it => String(it._id) !== String(a.payload.id));
        if (s.selected && String(s.selected._id) === String(a.payload.id)) s.selected = null;
        s.successMessage = a.payload?.message || null;
      })
      .addCase(deleteNeighborhood.rejected, setError);
  },
});

export const { clearNeighborhoodMessages, setSelectedNeighborhood } = neighborhoodSlice.actions;
export default neighborhoodSlice.reducer;

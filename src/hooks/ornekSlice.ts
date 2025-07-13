import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IMyModel } from "@/modules/mymodule/types";

// STATE
interface MyModelState {
  items: IMyModel[];           // Public data
  itemsAdmin: IMyModel[];      // Admin panel için
  loading: boolean;
  loadingAdmin: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: MyModelState = {
  items: [],
  itemsAdmin: [],
  loading: false,
  loadingAdmin: false,
  error: null,
  successMessage: null,
};

// --- Helper: Error mesajı çıkarıcı
function extractMessage(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (typeof payload === "object" && "message" in payload && typeof (payload as any).message === "string") {
    return (payload as any).message;
  }
  return null;
}

// 1️⃣ Public fetch
export const fetchMyModel = createAsyncThunk<IMyModel[], void>(
  "myModel/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/mymodule", null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// 2️⃣ Admin fetch
export const fetchMyModelAdmin = createAsyncThunk<IMyModel[], void>(
  "myModel/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/mymodule/admin", null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// 3️⃣ CRUD
export const createMyModel = createAsyncThunk<{ data: IMyModel; message?: string }, Partial<IMyModel>>(
  "myModel/create",
  async (data, thunkAPI) => {
    const res = await apiCall("post", "/mymodule", data, thunkAPI.rejectWithValue);
    return { data: res.data, message: res.message };
  }
);
export const updateMyModel = createAsyncThunk<{ data: IMyModel; message?: string }, { id: string; data: Partial<IMyModel> }>(
  "myModel/update",
  async ({ id, data }, thunkAPI) => {
    const res = await apiCall("put", `/mymodule/${id}`, data, thunkAPI.rejectWithValue);
    return { data: res.data, message: res.message };
  }
);
export const deleteMyModel = createAsyncThunk<{ id: string; message?: string }, { id: string }>(
  "myModel/delete",
  async ({ id }, thunkAPI) => {
    const res = await apiCall("delete", `/mymodule/${id}`, null, thunkAPI.rejectWithValue);
    return { id, message: res.message };
  }
);

const myModelSlice = createSlice({
  name: "myModel",
  initialState,
  reducers: {
    clearMyModelMessages(state) {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // PUBLIC
    builder
      .addCase(fetchMyModel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyModel.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyModel.rejected, (state, action) => {
        state.loading = false;
        state.error = extractMessage(action.payload);
      });
    // ADMIN
    builder
      .addCase(fetchMyModelAdmin.pending, (state) => {
        state.loadingAdmin = true;
        state.error = null;
      })
      .addCase(fetchMyModelAdmin.fulfilled, (state, action) => {
        state.loadingAdmin = false;
        state.itemsAdmin = action.payload;
      })
      .addCase(fetchMyModelAdmin.rejected, (state, action) => {
        state.loadingAdmin = false;
        state.error = extractMessage(action.payload);
      });
    // CRUD
    builder
      .addCase(createMyModel.fulfilled, (state, action) => {
        state.items.push(action.payload.data);
        state.itemsAdmin.push(action.payload.data);
        state.successMessage = action.payload.message ?? null;
      })
      .addCase(updateMyModel.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m._id === action.payload.data._id);
        if (idx !== -1) state.items[idx] = action.payload.data;
        const idxAdmin = state.itemsAdmin.findIndex((m) => m._id === action.payload.data._id);
        if (idxAdmin !== -1) state.itemsAdmin[idxAdmin] = action.payload.data;
        state.successMessage = action.payload.message ?? null;
      })
      .addCase(deleteMyModel.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m._id !== action.payload.id);
        state.itemsAdmin = state.itemsAdmin.filter((m) => m._id !== action.payload.id);
        state.successMessage = action.payload.message ?? null;
      });
  },
});

export const { clearMyModelMessages } = myModelSlice.actions;
export default myModelSlice.reducer;

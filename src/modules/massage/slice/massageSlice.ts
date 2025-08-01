import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IMassage } from "@/modules/massage";

interface MassageState {
  massage: IMassage[]; // Public (site) için
  massageAdmin: IMassage[]; // Admin panel için
  selected: IMassage | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: MassageState = {
  massage: [],
  massageAdmin: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof (payload as any).message === "string"
  )
    return (payload as any).message;
  return "An error occurred.";
};

// --- Async Thunks ---

export const fetchMassage = createAsyncThunk<IMassage[]>(
  "massage/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/massage`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const fetchAllMassageAdmin = createAsyncThunk<IMassage[]>(
  "massage/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/massage/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const createMassage = createAsyncThunk(
  "massage/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/massage/admin",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const updateMassage = createAsyncThunk(
  "massage/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/massage/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const deleteMassage = createAsyncThunk(
  "massage/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/massage/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

export const togglePublishMassage = createAsyncThunk(
  "massage/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/massage/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const fetchMassageBySlug = createAsyncThunk(
  "massage/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/massage/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Slice ---
const massageSlice = createSlice({
  name: "massage",
  initialState,
  reducers: {
    clearMassageMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedMassage: (state, action: PayloadAction<IMassage | null>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: MassageState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };

    const setError = (state: MassageState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // 🌐 Public
    builder
      .addCase(fetchMassage.pending, setLoading)
      .addCase(fetchMassage.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.massage = action.payload;
      })
      .addCase(fetchMassage.rejected, setError);

    // 🔐 Admin List
    builder
      .addCase(fetchAllMassageAdmin.pending, setLoading)
      .addCase(fetchAllMassageAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.massageAdmin = action.payload;
      })
      .addCase(fetchAllMassageAdmin.rejected, setError);

    // ➕ Create
    builder
      .addCase(createMassage.pending, setLoading)
      .addCase(createMassage.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.massageAdmin.unshift(action.payload);
        state.successMessage = "Massage successfully created.";
      })
      .addCase(createMassage.rejected, setError);

    // 📝 Update
    builder
      .addCase(updateMassage.pending, setLoading)
      .addCase(updateMassage.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.massageAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.massageAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = "Massage successfully updated.";
      })
      .addCase(updateMassage.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deleteMassage.pending, setLoading)
      .addCase(deleteMassage.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.massageAdmin = state.massageAdmin.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload.message;
      })
      .addCase(deleteMassage.rejected, setError);

    // 🌍 Toggle Publish
    builder
      .addCase(togglePublishMassage.pending, setLoading)
      .addCase(togglePublishMassage.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.massageAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.massageAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = "Publish status updated.";
      })
      .addCase(togglePublishMassage.rejected, setError);

    // 🔎 Single (Slug)
    builder
      .addCase(fetchMassageBySlug.pending, setLoading)
      .addCase(fetchMassageBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchMassageBySlug.rejected, setError);
  },
});

export const { clearMassageMessages, setSelectedMassage } =
  massageSlice.actions;
export default massageSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IServices } from "@/modules/services";

interface ServicesState {
  services: IServices[]; // Public (site) için
  servicesAdmin: IServices[]; // Admin panel için
  selected: IServices | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ServicesState = {
  services: [],
  servicesAdmin: [],
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

export const fetchServices = createAsyncThunk<IServices[]>(
  "services/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/services`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const fetchAllServicesAdmin = createAsyncThunk<IServices[]>(
  "services/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/services/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const createServices = createAsyncThunk(
  "services/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/services/admin",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const updateServices = createAsyncThunk(
  "services/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/services/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const deleteServices = createAsyncThunk(
  "services/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/services/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

export const togglePublishServices = createAsyncThunk(
  "services/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/services/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const fetchServicesBySlug = createAsyncThunk(
  "services/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/services/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Slice ---
const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    clearServicesMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedServices: (state, action: PayloadAction<IServices | null>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: ServicesState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };

    const setError = (state: ServicesState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // 🌐 Public
    builder
      .addCase(fetchServices.pending, setLoading)
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, setError);

    // 🔐 Admin List
    builder
      .addCase(fetchAllServicesAdmin.pending, setLoading)
      .addCase(fetchAllServicesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.servicesAdmin = action.payload;
      })
      .addCase(fetchAllServicesAdmin.rejected, setError);

    // ➕ Create
    builder
      .addCase(createServices.pending, setLoading)
      .addCase(createServices.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.servicesAdmin.unshift(action.payload);
        state.successMessage = "Services successfully created.";
      })
      .addCase(createServices.rejected, setError);

    // 📝 Update
    builder
      .addCase(updateServices.pending, setLoading)
      .addCase(updateServices.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.servicesAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.servicesAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = "Services successfully updated.";
      })
      .addCase(updateServices.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deleteServices.pending, setLoading)
      .addCase(deleteServices.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.servicesAdmin = state.servicesAdmin.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload.message;
      })
      .addCase(deleteServices.rejected, setError);

    // 🌍 Toggle Publish
    builder
      .addCase(togglePublishServices.pending, setLoading)
      .addCase(togglePublishServices.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload;
        const i = state.servicesAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.servicesAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = "Publish status updated.";
      })
      .addCase(togglePublishServices.rejected, setError);

    // 🔎 Single (Slug)
    builder
      .addCase(fetchServicesBySlug.pending, setLoading)
      .addCase(fetchServicesBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchServicesBySlug.rejected, setError);
  },
});

export const { clearServicesMessages, setSelectedServices } =
  servicesSlice.actions;
export default servicesSlice.reducer;

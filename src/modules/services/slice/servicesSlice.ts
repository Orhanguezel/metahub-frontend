import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IServices } from "@/modules/services/types";

interface ServicesState {
  services: IServices[];
  selected: IServices | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ServicesState = {
  services: [],
  selected: null,
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
    return res.data; // backend: { success: true, message: "..." }
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

export const fetchAllServicesAdmin = createAsyncThunk(
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
    clearServicesMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedServices(state, action: PayloadAction<IServices | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: ServicesState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: ServicesState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = extractErrorMessage(action.payload);
    };

    builder
      .addCase(fetchServices.pending, startLoading)
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, setError)

      .addCase(fetchAllServicesAdmin.pending, startLoading)
      .addCase(fetchAllServicesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchAllServicesAdmin.rejected, setError)

      .addCase(createServices.pending, startLoading)
      .addCase(createServices.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "Article created successfully.";
        if (action.payload?.data) {
          state.services.unshift(action.payload.data);
        }
      })
      .addCase(createServices.rejected, setError)

      .addCase(updateServices.pending, startLoading)
      .addCase(updateServices.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.services.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.services[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(updateServices.rejected, setError)

      .addCase(deleteServices.pending, startLoading)
      .addCase(deleteServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = state.services.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload?.message;
      })
      .addCase(deleteServices.rejected, setError)

      .addCase(togglePublishServices.pending, startLoading)
      .addCase(togglePublishServices.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.services.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.services[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(togglePublishServices.rejected, setError)

      .addCase(fetchServicesBySlug.pending, startLoading)
      .addCase(fetchServicesBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchServicesBySlug.rejected, setError);
  },
});

export const { clearServicesMessages, setSelectedServices } =
  servicesSlice.actions;
export default servicesSlice.reducer;

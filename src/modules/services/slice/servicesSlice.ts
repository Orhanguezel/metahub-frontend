import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IServices } from "@/modules/services/types/services";

interface ServicesState {
  services: IServices[];
  selectedServices: IServices | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ServicesState = {
  services: [],
  selectedServices: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 🌐 Public - fetch by language
export const fetchServices = createAsyncThunk(
  "services/fetchAll",
  async (lang: "tr" | "en" | "de", thunkAPI) => {
    const res = await apiCall(
      "get",
      `/services?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ➕ Create Services
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

// ✏️ Update Services
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

// ❌ Delete Services
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

// 🛠 Admin - fetch all Services
export const fetchAllServicesAdmin = createAsyncThunk(
  "services/fetchAllAdmin",
  async (lang: "tr" | "en" | "de", thunkAPI) => {
    const res = await apiCall(
      "get",
      `/services/admin?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🔁 Admin - toggle publish
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

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    clearServicesMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedServices: (state, action: PayloadAction<IServices | null>) => {
      state.selectedServices = action.payload;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: ServicesState) => {
      state.loading = true;
      state.error = null;
    };

    const failed = (state: ServicesState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred.";
    };

    builder
      // 🌐 Public
      .addCase(fetchServices.pending, loading)
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, failed)

      // ➕ Create
      .addCase(createServices.pending, loading)
      .addCase(createServices.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Service created successfully.";
        if (action.payload && action.payload._id) {
          state.services.unshift(action.payload);
        }
      })
      .addCase(createServices.rejected, failed)

      // ✏️ Update
      .addCase(updateServices.pending, loading)
      .addCase(updateServices.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.services.findIndex((s) => s._id === updated._id);
        if (index !== -1) state.services[index] = updated;
        if (state.selectedServices?._id === updated._id) {
          state.selectedServices = updated;
        }
        state.successMessage = "Service updated successfully.";
      })
      .addCase(updateServices.rejected, failed)

      // ❌ Delete
      .addCase(deleteServices.pending, loading)
      .addCase(deleteServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = state.services.filter(
          (s) => s._id !== action.payload.id
        );
        state.successMessage = "Service deleted successfully.";
      })
      .addCase(deleteServices.rejected, failed)

      // 🛠 Fetch All Admin
      .addCase(fetchAllServicesAdmin.pending, loading)
      .addCase(fetchAllServicesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchAllServicesAdmin.rejected, failed)

      // 🔁 Toggle Publish
      .addCase(togglePublishServices.pending, loading)
      .addCase(togglePublishServices.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.services.findIndex((s) => s._id === updated._id);
        if (index !== -1) state.services[index] = updated;
        if (state.selectedServices?._id === updated._id) {
          state.selectedServices = updated;
        }
        state.successMessage = updated.isPublished
          ? "Service published successfully."
          : "Service unpublished successfully.";
      })
      .addCase(togglePublishServices.rejected, failed);
  },
});

export const { clearServicesMessages, setSelectedServices } =
  servicesSlice.actions;
export default servicesSlice.reducer;

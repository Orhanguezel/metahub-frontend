// src/store/servicesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface IService {
  _id?: string;
  title: string;
  shortDescription?: string;
  detailedDescription?: string;
  price: number;
  durationMinutes: number;
  images: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceState {
  services: IService[];
  selectedService: IService | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ServiceState = {
  services: [],
  selectedService: null,
  loading: false,
  error: null,
  successMessage: null,
};

// ✅ Get all services
export const fetchServices = createAsyncThunk("services/fetchAll", async (_, thunkAPI) => {
  return await apiCall("get", "/services", null, thunkAPI.rejectWithValue);
});

// ✅ Get service by ID
export const fetchServiceById = createAsyncThunk("services/fetchById", async (id: string, thunkAPI) => {
  return await apiCall("get", `/services/${id}`, null, thunkAPI.rejectWithValue);
});

// ➕ Create service
export const createService = createAsyncThunk("services/create", async (formData: FormData, thunkAPI) => {
  return await apiCall("post", "/services", formData, thunkAPI.rejectWithValue, {
    headers: { "Content-Type": "multipart/form-data" },
  });
});

// ✏️ Update service
export const updateService = createAsyncThunk(
  "services/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    return await apiCall("put", `/services/${id}`, formData, thunkAPI.rejectWithValue, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
);

// 🗑️ Delete service
export const deleteService = createAsyncThunk("services/delete", async (id: string, thunkAPI) => {
  return await apiCall("delete", `/services/${id}`, null, thunkAPI.rejectWithValue);
});

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    clearServiceMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: ServiceState) => {
      state.loading = true;
      state.error = null;
    };

    const error = (state: ServiceState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchServices.pending, loading)
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, error)

      .addCase(fetchServiceById.pending, loading)
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedService = action.payload;
      })
      .addCase(fetchServiceById.rejected, error)

      .addCase(createService.pending, loading)
      .addCase(createService.fulfilled, (state, action) => {
        state.loading = false;
        state.services.unshift(action.payload.service);
        state.successMessage = "Service erfolgreich erstellt.";
      })
      .addCase(createService.rejected, error)

      .addCase(updateService.pending, loading)
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.service;
        const index = state.services.findIndex((s) => s._id === updated._id);
        if (index !== -1) state.services[index] = updated;
        state.successMessage = "Service aktualisiert.";
      })
      .addCase(updateService.rejected, error)

      .addCase(deleteService.pending, loading)
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        state.services = state.services.filter((s) => s._id !== action.payload?.service?._id);
        state.successMessage = "Service gelöscht.";
      })
      .addCase(deleteService.rejected, error);
  },
});

export const { clearServiceMessages } = servicesSlice.actions;
export default servicesSlice.reducer;

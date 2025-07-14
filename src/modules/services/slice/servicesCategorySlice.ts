import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ServicesCategory, TranslatedField } from "@/modules/services";

interface CategoryState {
  categories: ServicesCategory[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  successMessage: null,
};

// --- Fetch ---
export const fetchServicesCategories = createAsyncThunk(
  "servicesCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/servicescategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Create ---
export const createServicesCategory = createAsyncThunk(
  "servicesCategory/create",
  async (
    data: {
      name: TranslatedField;
      description?: TranslatedField;
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "post",
      "/servicescategory",
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Update ---
export const updateServicesCategory = createAsyncThunk(
  "servicesCategory/update",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        name: TranslatedField;
        description?: TranslatedField;
      };
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "put",
      `/servicescategory/${id}`,
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Delete ---
export const deleteServicesCategory = createAsyncThunk(
  "servicesCategory/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/servicescategory/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

const servicesCategorySlice = createSlice({
  name: "servicesCategory",
  initialState,
  reducers: {
    clearServicesCategoryMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: CategoryState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: CategoryState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message;
    };

    builder
      // Fetch
      .addCase(fetchServicesCategories.pending, startLoading)
      .addCase(fetchServicesCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchServicesCategories.rejected, setError)
      // Create
      .addCase(createServicesCategory.pending, startLoading)
      .addCase(createServicesCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        if (action.payload?.data?._id) {
          state.categories.unshift(action.payload.data);
        }
      })
      .addCase(createServicesCategory.rejected, setError)
      // Update
      .addCase(updateServicesCategory.pending, startLoading)
      .addCase(updateServicesCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        const updated = action.payload?.data || action.payload;
        const index = state.categories.findIndex(
          (cat) => cat._id === updated._id
        );
        if (index !== -1) {
          state.categories[index] = updated;
        }
      })
      .addCase(updateServicesCategory.rejected, setError)
      // Delete
      .addCase(deleteServicesCategory.pending, startLoading)
      .addCase(deleteServicesCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload.id
        );
      })
      .addCase(deleteServicesCategory.rejected, setError);
  },
});

export const { clearServicesCategoryMessages } = servicesCategorySlice.actions;
export default servicesCategorySlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { MassageCategory, TranslatedField } from "@/modules/massage";

interface CategoryState {
  categories: MassageCategory[];
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
export const fetchMassageCategories = createAsyncThunk(
  "massageCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/massagecategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Create ---
export const createMassageCategory = createAsyncThunk(
  "massageCategory/create",
  async (
    data: {
      name: TranslatedField;
      description?: TranslatedField;
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "post",
      "/massagecategory",
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Update ---
export const updateMassageCategory = createAsyncThunk(
  "massageCategory/update",
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
      `/massagecategory/${id}`,
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Delete ---
export const deleteMassageCategory = createAsyncThunk(
  "massageCategory/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/massagecategory/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

const massageCategorySlice = createSlice({
  name: "massageCategory",
  initialState,
  reducers: {
    clearMassageCategoryMessages: (state) => {
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
      .addCase(fetchMassageCategories.pending, startLoading)
      .addCase(fetchMassageCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchMassageCategories.rejected, setError)
      // Create
      .addCase(createMassageCategory.pending, startLoading)
      .addCase(createMassageCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        if (action.payload?.data?._id) {
          state.categories.unshift(action.payload.data);
        }
      })
      .addCase(createMassageCategory.rejected, setError)
      // Update
      .addCase(updateMassageCategory.pending, startLoading)
      .addCase(updateMassageCategory.fulfilled, (state, action) => {
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
      .addCase(updateMassageCategory.rejected, setError)
      // Delete
      .addCase(deleteMassageCategory.pending, startLoading)
      .addCase(deleteMassageCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload.id
        );
      })
      .addCase(deleteMassageCategory.rejected, setError);
  },
});

export const { clearMassageCategoryMessages } = massageCategorySlice.actions;
export default massageCategorySlice.reducer;

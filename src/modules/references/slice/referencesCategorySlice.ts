import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ReferencesCategory, TranslatedField } from "@/modules/references";

interface CategoryState {
  categories: ReferencesCategory[];
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
export const fetchReferencesCategories = createAsyncThunk(
  "referencesCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/referencescategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Create ---
export const createReferencesCategory = createAsyncThunk(
  "referencesCategory/create",
  async (
    data: {
      name: TranslatedField;
      description?: TranslatedField;
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "post",
      "/referencescategory",
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Update ---
export const updateReferencesCategory = createAsyncThunk(
  "referencesCategory/update",
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
      `/referencescategory/${id}`,
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Delete ---
export const deleteReferencesCategory = createAsyncThunk(
  "referencesCategory/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/referencescategory/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

const referencesCategorySlice = createSlice({
  name: "referencesCategory",
  initialState,
  reducers: {
    clearReferencesCategoryMessages: (state) => {
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
      .addCase(fetchReferencesCategories.pending, startLoading)
      .addCase(fetchReferencesCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchReferencesCategories.rejected, setError)
      // Create
      .addCase(createReferencesCategory.pending, startLoading)
      .addCase(createReferencesCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        if (action.payload?.data?._id) {
          state.categories.unshift(action.payload.data);
        }
      })
      .addCase(createReferencesCategory.rejected, setError)
      // Update
      .addCase(updateReferencesCategory.pending, startLoading)
      .addCase(updateReferencesCategory.fulfilled, (state, action) => {
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
      .addCase(updateReferencesCategory.rejected, setError)
      // Delete
      .addCase(deleteReferencesCategory.pending, startLoading)
      .addCase(deleteReferencesCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload.id
        );
      })
      .addCase(deleteReferencesCategory.rejected, setError);
  },
});

export const { clearReferencesCategoryMessages } =
  referencesCategorySlice.actions;
export default referencesCategorySlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  AboutCategory,
  TranslatedField,
} from "@/modules/about";

interface CategoryState {
  categories: AboutCategory[];
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

const BASE = "/aboutcategory";

// --- Fetch ---
export const fetchAboutCategories = createAsyncThunk(
  "aboutCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `${BASE}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Create ---
export const createAboutCategory = createAsyncThunk(
  "aboutCategory/create",
  async (
    data: {
      name: TranslatedField;
      description?: TranslatedField;
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "post",
      `${BASE}`,
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Update ---
export const updateAboutCategory = createAsyncThunk(
  "aboutCategory/update",
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
      `${BASE}/${id}`,
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Delete ---
export const deleteAboutCategory = createAsyncThunk(
  "aboutCategory/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `${BASE}/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

const aboutCategorySlice = createSlice({
  name: "aboutCategory",
  initialState,
  reducers: {
    clearAboutCategoryMessages: (state) => {
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
      .addCase(fetchAboutCategories.pending, startLoading)
      .addCase(fetchAboutCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAboutCategories.rejected, setError)
      // Create
      .addCase(createAboutCategory.pending, startLoading)
      .addCase(createAboutCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        if (action.payload?.data?._id) {
          state.categories.unshift(action.payload.data);
        }
      })
      .addCase(createAboutCategory.rejected, setError)
      // Update
      .addCase(updateAboutCategory.pending, startLoading)
      .addCase(updateAboutCategory.fulfilled, (state, action) => {
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
      .addCase(updateAboutCategory.rejected, setError)
      // Delete
      .addCase(deleteAboutCategory.pending, startLoading)
      .addCase(deleteAboutCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload.id
        );
      })
      .addCase(deleteAboutCategory.rejected, setError);
  },
});

export const { clearAboutCategoryMessages } = aboutCategorySlice.actions;
export default aboutCategorySlice.reducer;

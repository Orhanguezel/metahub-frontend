import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { NewsCategory, TranslatedField } from "@/modules/news";

interface CategoryState {
  categories: NewsCategory[];
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
export const fetchNewsCategories = createAsyncThunk(
  "newsCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/newscategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Create ---
export const createNewsCategory = createAsyncThunk(
  "newsCategory/create",
  async (
    data: {
      name: TranslatedField;
      description?: TranslatedField;
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "post",
      "/newscategory",
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Update ---
export const updateNewsCategory = createAsyncThunk(
  "newsCategory/update",
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
      `/newscategory/${id}`,
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Delete ---
export const deleteNewsCategory = createAsyncThunk(
  "newsCategory/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/newscategory/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message }; // backend response.message
  }
);

const newsCategorySlice = createSlice({
  name: "newsCategory",
  initialState,
  reducers: {
    clearNewsCategoryMessages: (state) => {
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
      state.error = action.payload?.message || "Something went wrong.";
    };

    builder
      // Fetch
      .addCase(fetchNewsCategories.pending, startLoading)
      .addCase(fetchNewsCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchNewsCategories.rejected, setError)
      // Create
      .addCase(createNewsCategory.pending, startLoading)
      .addCase(createNewsCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        if (action.payload?.data?._id) {
          state.categories.unshift(action.payload.data);
        }
      })
      .addCase(createNewsCategory.rejected, setError)
      // Update
      .addCase(updateNewsCategory.pending, startLoading)
      .addCase(updateNewsCategory.fulfilled, (state, action) => {
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
      .addCase(updateNewsCategory.rejected, setError)
      // Delete
      .addCase(deleteNewsCategory.pending, startLoading)
      .addCase(deleteNewsCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload.id
        );
      })
      .addCase(deleteNewsCategory.rejected, setError);
  },
});

export const { clearNewsCategoryMessages } = newsCategorySlice.actions;
export default newsCategorySlice.reducer;

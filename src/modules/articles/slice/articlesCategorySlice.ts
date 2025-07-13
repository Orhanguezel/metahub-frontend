import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ArticlesCategory, TranslatedField } from "@/modules/articles";

interface CategoryState {
  categories: ArticlesCategory[];
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
export const fetchArticlesCategories = createAsyncThunk(
  "articlesCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/articlescategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Create ---
export const createArticlesCategory = createAsyncThunk(
  "articlesCategory/create",
  async (
    data: {
      name: TranslatedField;
      description?: TranslatedField;
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "post",
      "/articlescategory",
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Update ---
export const updateArticlesCategory = createAsyncThunk(
  "articlesCategory/update",
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
      `/articlescategory/${id}`,
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Delete ---
export const deleteArticlesCategory = createAsyncThunk(
  "articlesCategory/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/articlescategory/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message }; // backend response.message
  }
);

const articlesCategorySlice = createSlice({
  name: "articlesCategory",
  initialState,
  reducers: {
    clearArticlesCategoryMessages: (state) => {
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
      .addCase(fetchArticlesCategories.pending, startLoading)
      .addCase(fetchArticlesCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchArticlesCategories.rejected, setError)
      // Create
      .addCase(createArticlesCategory.pending, startLoading)
      .addCase(createArticlesCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        if (action.payload?.data?._id) {
          state.categories.unshift(action.payload.data);
        }
      })
      .addCase(createArticlesCategory.rejected, setError)
      // Update
      .addCase(updateArticlesCategory.pending, startLoading)
      .addCase(updateArticlesCategory.fulfilled, (state, action) => {
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
      .addCase(updateArticlesCategory.rejected, setError)
      // Delete
      .addCase(deleteArticlesCategory.pending, startLoading)
      .addCase(deleteArticlesCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload.id
        );
      })
      .addCase(deleteArticlesCategory.rejected, setError);
  },
});

export const { clearArticlesCategoryMessages } = articlesCategorySlice.actions;
export default articlesCategorySlice.reducer;

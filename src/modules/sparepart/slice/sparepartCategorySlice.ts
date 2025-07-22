import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { SparepartCategory } from "../types";

interface CategoryState {
  categories: SparepartCategory[];
  selected: SparepartCategory | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CategoryState = {
  categories: [],
  selected: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 🌍 Fetch All (public veya admin)
export const fetchSparepartCategories = createAsyncThunk(
  "sparepartcategory/fetchAll",
  async (_: void, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/sparepartcategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data; // direkt array
  }
);

// ➕ Create (FormData)
export const createSparepartCategory = createAsyncThunk(
  "sparepartcategory/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/sparepartcategory",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data; // tek kategori objesi
  }
);

// ✏️ Update (FormData)
export const updateSparepartCategory = createAsyncThunk(
  "sparepartcategory/update",
  async (params: { id: string; data: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/sparepartcategory/${params.id}`,
      params.data,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data; // tek kategori objesi
  }
);

// ❌ Delete
export const deleteSparepartCategory = createAsyncThunk(
  "sparepartcategory/delete",
  async (id: string, thunkAPI) => {
    await apiCall(
      "delete",
      `/sparepartcategory/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return id;
  }
);

// 🧠 Slice
const sparepartCategorySlice = createSlice({
  name: "sparepartCategory",
  initialState,
  reducers: {
    clearSparepartCategoryMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedCategory(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: CategoryState) => {
      state.loading = true;
      state.error = null;
    };
    const failed = (state: CategoryState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred.";
    };

    builder
      // fetch
      .addCase(fetchSparepartCategories.pending, loading)
      .addCase(fetchSparepartCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSparepartCategories.rejected, failed)

      // create
      .addCase(createSparepartCategory.pending, loading)
      .addCase(createSparepartCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        if (action.payload && action.payload._id) {
          state.categories.unshift(action.payload);
        }
      })
      .addCase(createSparepartCategory.rejected, failed)

      // update
      .addCase(updateSparepartCategory.pending, loading)
      .addCase(updateSparepartCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category updated successfully.";
        const updated = action.payload;
        if (updated && updated._id) {
          const index = state.categories.findIndex(
            (cat) => cat._id === updated._id
          );
          if (index !== -1) state.categories[index] = updated;
          if (state.selected?._id === updated._id) state.selected = updated;
        }
      })
      .addCase(updateSparepartCategory.rejected, failed)

      // delete
      .addCase(deleteSparepartCategory.pending, loading)
      .addCase(deleteSparepartCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload
        );
      })
      .addCase(deleteSparepartCategory.rejected, failed);
  },
});

export const { clearSparepartCategoryMessages, clearSelectedCategory } =
  sparepartCategorySlice.actions;
export default sparepartCategorySlice.reducer;

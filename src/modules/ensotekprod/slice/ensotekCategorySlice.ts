import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { EnsotekCategory } from "../types";

interface CategoryState {
  categories: EnsotekCategory[];
  selected: EnsotekCategory | null;
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
export const fetchEnsotekCategories = createAsyncThunk(
  "ensotekcategory/fetchAll",
  async (_: void, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/ensotekcategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data; // direkt array
  }
);

// ➕ Create (FormData)
export const createEnsotekCategory = createAsyncThunk(
  "ensotekcategory/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/ensotekcategory",
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
export const updateEnsotekCategory = createAsyncThunk(
  "ensotekcategory/update",
  async (params: { id: string; data: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/ensotekcategory/${params.id}`,
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
export const deleteEnsotekCategory = createAsyncThunk(
  "ensotekcategory/delete",
  async (id: string, thunkAPI) => {
    await apiCall(
      "delete",
      `/ensotekcategory/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return id;
  }
);

// 🧠 Slice
const ensotekCategorySlice = createSlice({
  name: "ensotekCategory",
  initialState,
  reducers: {
    clearEnsotekCategoryMessages(state) {
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
      .addCase(fetchEnsotekCategories.pending, loading)
      .addCase(fetchEnsotekCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchEnsotekCategories.rejected, failed)

      // create
      .addCase(createEnsotekCategory.pending, loading)
      .addCase(createEnsotekCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        if (action.payload && action.payload._id) {
          state.categories.unshift(action.payload);
        }
      })
      .addCase(createEnsotekCategory.rejected, failed)

      // update
      .addCase(updateEnsotekCategory.pending, loading)
      .addCase(updateEnsotekCategory.fulfilled, (state, action) => {
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
      .addCase(updateEnsotekCategory.rejected, failed)

      // delete
      .addCase(deleteEnsotekCategory.pending, loading)
      .addCase(deleteEnsotekCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload
        );
      })
      .addCase(deleteEnsotekCategory.rejected, failed);
  },
});

export const { clearEnsotekCategoryMessages, clearSelectedCategory } =
  ensotekCategorySlice.actions;
export default ensotekCategorySlice.reducer;

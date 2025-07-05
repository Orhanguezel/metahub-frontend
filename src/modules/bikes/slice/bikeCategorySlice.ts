import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { BikeCategory } from "../types";

interface CategoryState {
  categories: BikeCategory[];
  selected: BikeCategory | null;
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
export const fetchBikeCategories = createAsyncThunk(
  "bikescategory/fetchAll",
  async (_: void, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/bikescategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data; // direkt array
  }
);

// ➕ Create (FormData)
export const createBikeCategory = createAsyncThunk(
  "bikescategory/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/bikescategory",
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
export const updateBikeCategory = createAsyncThunk(
  "bikescategory/update",
  async (params: { id: string; data: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/bikescategory/${params.id}`,
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
export const deleteBikeCategory = createAsyncThunk(
  "bikescategory/delete",
  async (id: string, thunkAPI) => {
    await apiCall(
      "delete",
      `/bikescategory/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return id;
  }
);

// 🧠 Slice
const bikeCategorySlice = createSlice({
  name: "bikeCategory",
  initialState,
  reducers: {
    clearBikeCategoryMessages(state) {
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
      .addCase(fetchBikeCategories.pending, loading)
      .addCase(fetchBikeCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBikeCategories.rejected, failed)

      // create
      .addCase(createBikeCategory.pending, loading)
      .addCase(createBikeCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        if (action.payload && action.payload._id) {
          state.categories.unshift(action.payload);
        }
      })
      .addCase(createBikeCategory.rejected, failed)

      // update
      .addCase(updateBikeCategory.pending, loading)
      .addCase(updateBikeCategory.fulfilled, (state, action) => {
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
      .addCase(updateBikeCategory.rejected, failed)

      // delete
      .addCase(deleteBikeCategory.pending, loading)
      .addCase(deleteBikeCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload
        );
      })
      .addCase(deleteBikeCategory.rejected, failed);
  },
});

export const { clearBikeCategoryMessages, clearSelectedCategory } =
  bikeCategorySlice.actions;
export default bikeCategorySlice.reducer;

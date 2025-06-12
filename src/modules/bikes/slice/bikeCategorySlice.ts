import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { BikeCategory } from "../types";
import type { TranslatedLabel } from "@/types/common";

// STATE
interface CategoryState {
  categories: BikeCategory[];
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

// ✅ Fetch All (Public & Admin aynı endpoint ile kullanılabilir)
export const fetchBikeCategories = createAsyncThunk(
  "bikescategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/bikescategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ✅ Create (Herhangi bir dilde tek alan bile olabilir)
export const createBikeCategory = createAsyncThunk(
  "bikescategory/create",
  async (
    data: {
      name: Partial<TranslatedLabel>;
      description?: Partial<TranslatedLabel>;
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "post",
      "/bikescategory",
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ✅ Update (Herhangi bir dil, sadece güncellenen dil ile)
export const updateBikeCategory = createAsyncThunk(
  "bikescategory/update",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        name?: Partial<TranslatedLabel>;
        description?: Partial<TranslatedLabel>;
      };
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "put",
      `/bikescategory/${id}`,
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ✅ Delete
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

const bikeCategorySlice = createSlice({
  name: "bikeCategory",
  initialState,
  reducers: {
    clearCategoryMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchBikeCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBikeCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(
        fetchBikeCategories.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error =
            action.payload?.message || "Failed to fetch categories.";
        }
      )

      // CREATE
      .addCase(createBikeCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBikeCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category created successfully.";
        state.categories.unshift(action.payload);
      })
      .addCase(
        createBikeCategory.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload?.message || "Failed to create category.";
        }
      )

      // UPDATE
      .addCase(updateBikeCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBikeCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category updated successfully.";
        const updated = action.payload;
        const index = state.categories.findIndex(
          (cat) => cat._id === updated._id
        );
        if (index !== -1) state.categories[index] = updated;
      })
      .addCase(
        updateBikeCategory.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload?.message || "Failed to update category.";
        }
      )

      // DELETE
      .addCase(deleteBikeCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBikeCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Category deleted successfully.";
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload
        );
      })
      .addCase(
        deleteBikeCategory.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload?.message || "Failed to delete category.";
        }
      );
  },
});

export const { clearCategoryMessages } = bikeCategorySlice.actions;
export default bikeCategorySlice.reducer;

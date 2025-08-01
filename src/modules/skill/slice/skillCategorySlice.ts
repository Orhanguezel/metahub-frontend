import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { SkillCategory, TranslatedField } from "@/modules/skill";

interface CategoryState {
  categories: SkillCategory[];
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
export const fetchSkillCategories = createAsyncThunk(
  "skillCategory/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      "/skillcategory",
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Create ---
export const createSkillCategory = createAsyncThunk(
  "skillCategory/create",
  async (
    data: {
      name: TranslatedField;
      description?: TranslatedField;
    },
    thunkAPI
  ) => {
    const res = await apiCall(
      "post",
      "/skillcategory",
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Update ---
export const updateSkillCategory = createAsyncThunk(
  "skillCategory/update",
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
      `/skillcategory/${id}`,
      data,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Delete ---
export const deleteSkillCategory = createAsyncThunk(
  "skillCategory/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/skillcategory/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

const skillCategorySlice = createSlice({
  name: "skillCategory",
  initialState,
  reducers: {
    clearSkillCategoryMessages: (state) => {
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
      .addCase(fetchSkillCategories.pending, startLoading)
      .addCase(fetchSkillCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchSkillCategories.rejected, setError)
      // Create
      .addCase(createSkillCategory.pending, startLoading)
      .addCase(createSkillCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        const newCat = action.payload?.data;
        if (
          newCat &&
          newCat._id &&
          !state.categories.some((cat) => cat._id === newCat._id)
        ) {
          state.categories.unshift(newCat);
        }
      })

      .addCase(createSkillCategory.rejected, setError)
      // Update
      .addCase(updateSkillCategory.pending, startLoading)
      .addCase(updateSkillCategory.fulfilled, (state, action) => {
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
      .addCase(updateSkillCategory.rejected, setError)
      // Delete
      .addCase(deleteSkillCategory.pending, startLoading)
      .addCase(deleteSkillCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload.id
        );
      })
      .addCase(deleteSkillCategory.rejected, setError);
  },
});

export const { clearSkillCategoryMessages } =
  skillCategorySlice.actions;
export default skillCategorySlice.reducer;

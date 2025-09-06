import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  RecipeCategory,
  RecipeCategoryListQuery,
  RecipeCategoryUpsertInput,
} from "@/modules/recipes/types";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface CategoryState {
  categories: RecipeCategory[];
  selected: RecipeCategory | null;

  status: Status;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CategoryState = {
  categories: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

// 🔵 Tek doğru endpoint
const BASE = "/recipescategory";

const extractErr = (p: unknown): string =>
  typeof p === "string"
    ? p
    : p && typeof p === "object" && "message" in p
    ? ((p as any).message as string) || "İşlem sırasında bir hata oluştu."
    : "İşlem sırasında bir hata oluştu.";

/* ================= Thunks ================= */

// --- PUBLIC LIST ---
export const fetchRecipeCategories = createAsyncThunk<
  RecipeCategory[],
  RecipeCategoryListQuery | void
>("recipecategory/fetchPublic", async (query, thunkAPI) => {
  const res = await apiCall("get", BASE, query ?? {}, thunkAPI.rejectWithValue);
  return res.data || [];
});

// --- PUBLIC GET BY ID ---
export const fetchRecipeCategoryById = createAsyncThunk<RecipeCategory, string>(
  "recipecategory/fetchById",
  async (id, thunkAPI) => {
    const res = await apiCall("get", `${BASE}/${id}`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// --- ADMIN CREATE ---
export const createRecipeCategory = createAsyncThunk<
  { message: string; data: RecipeCategory },
  RecipeCategoryUpsertInput
>("recipecategory/create", async (data, thunkAPI) => {
  const res = await apiCall("post", BASE, data, thunkAPI.rejectWithValue);
  return { message: res.message || "Kategori oluşturuldu.", data: res.data };
});

// --- ADMIN UPDATE ---
export const updateRecipeCategory = createAsyncThunk<
  { message: string; data: RecipeCategory },
  { id: string; data: RecipeCategoryUpsertInput }
>("recipecategory/update", async ({ id, data }, thunkAPI) => {
  const res = await apiCall("put", `${BASE}/${id}`, data, thunkAPI.rejectWithValue);
  return { message: res.message || "Kategori güncellendi.", data: res.data };
});

// --- ADMIN DELETE ---
export const deleteRecipeCategory = createAsyncThunk<
  { id: string; message: string },
  string
>("recipecategory/delete", async (id, thunkAPI) => {
  const res = await apiCall("delete", `${BASE}/${id}`, null, thunkAPI.rejectWithValue);
  return { id, message: res.message || "Kategori silindi." };
});

/* ================= Slice ================= */

const recipeCategorySlice = createSlice({
  name: "recipecategory",
  initialState,
  reducers: {
    clearRecipeCategoryMessages(s) {
      s.error = null;
      s.successMessage = null;
      s.status = "idle";
    },
    setSelectedRecipeCategory(s, a: PayloadAction<RecipeCategory | null>) {
      s.selected = a.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (s: CategoryState) => {
      s.loading = true;
      s.status = "loading";
      s.error = null;
    };
    const setFailed = (s: CategoryState, a: PayloadAction<any>) => {
      s.loading = false;
      s.status = "failed";
      s.error = extractErr(a.payload);
    };

    // Public list
    builder
      .addCase(fetchRecipeCategories.pending, setLoading)
      .addCase(fetchRecipeCategories.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.categories = a.payload;
      })
      .addCase(fetchRecipeCategories.rejected, setFailed);

    // Public get by id
    builder
      .addCase(fetchRecipeCategoryById.pending, setLoading)
      .addCase(fetchRecipeCategoryById.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.selected = a.payload;
      })
      .addCase(fetchRecipeCategoryById.rejected, setFailed);

    // Create
    builder
      .addCase(createRecipeCategory.pending, setLoading)
      .addCase(createRecipeCategory.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.successMessage = a.payload.message;
        s.categories.unshift(a.payload.data);
      })
      .addCase(createRecipeCategory.rejected, setFailed);

    // Update
    builder
      .addCase(updateRecipeCategory.pending, setLoading)
      .addCase(updateRecipeCategory.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.successMessage = a.payload.message;
        const updated = a.payload.data;
        const i = s.categories.findIndex((c) => c._id === updated._id);
        if (i !== -1) s.categories[i] = updated;
        if (s.selected?._id === updated._id) s.selected = updated;
      })
      .addCase(updateRecipeCategory.rejected, setFailed);

    // Delete
    builder
      .addCase(deleteRecipeCategory.pending, setLoading)
      .addCase(deleteRecipeCategory.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.successMessage = a.payload.message;
        s.categories = s.categories.filter((c) => c._id !== a.payload.id);
        if (s.selected?._id === a.payload.id) s.selected = null;
      })
      .addCase(deleteRecipeCategory.rejected, setFailed);
  },
});

export const {
  clearRecipeCategoryMessages,
  setSelectedRecipeCategory,
} = recipeCategorySlice.actions;

export default recipeCategorySlice.reducer;

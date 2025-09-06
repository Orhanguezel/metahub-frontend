import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

// ✅ Tipler type-import ile
import type {
  IRecipe,
  RecipeListQuery,
  RecipeAdminListQuery,
  RecipeFormInput,
} from "@/modules/recipes/types";

// ✅ Fonksiyon value-import ile
import { buildRecipeFormData } from "@/modules/recipes/types";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface RecipesState {
  // Public
  list: IRecipe[];
  selected: IRecipe | null;

  // Admin
  adminList: IRecipe[];
  adminSelected: IRecipe | null;

  status: Status;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: RecipesState = {
  list: [],
  selected: null,
  adminList: [],
  adminSelected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const BASE_PUBLIC = "/recipes";
const BASE_ADMIN = "/recipes/admin";

// --- Helpers
const extractErr = (p: unknown): string => {
  if (typeof p === "string") return p;
  if (p && typeof p === "object" && "message" in p) {
    const m = (p as any).message;
    if (typeof m === "string") return m;
  }
  return "İşlem sırasında bir hata oluştu.";
};

// --- Thunks (PUBLIC) ---
export const fetchRecipesPublic = createAsyncThunk<IRecipe[], RecipeListQuery | void>(
  "recipes/fetchPublic",
  async (query, thunkAPI) => {
    const res = await apiCall("get", BASE_PUBLIC, query ?? {}, thunkAPI.rejectWithValue);
    return res.data || [];
  }
);

export const fetchRecipeBySlug = createAsyncThunk<IRecipe, string>(
  "recipes/fetchBySlug",
  async (slug, thunkAPI) => {
    const res = await apiCall("get", `${BASE_PUBLIC}/${slug}`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

// --- Thunks (ADMIN) ---
export const fetchRecipesAdmin = createAsyncThunk<IRecipe[], RecipeAdminListQuery | void>(
  "recipes/fetchAdmin",
  async (query, thunkAPI) => {
    const res = await apiCall("get", BASE_ADMIN, query ?? {}, thunkAPI.rejectWithValue);
    return res.data || [];
  }
);

export const fetchRecipeByIdAdmin = createAsyncThunk<IRecipe, string>(
  "recipes/fetchByIdAdmin",
  async (id, thunkAPI) => {
    const res = await apiCall("get", `${BASE_ADMIN}/${id}`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

export const createRecipeAdmin = createAsyncThunk<
  { message: string; data: IRecipe },
  RecipeFormInput
>("recipes/createAdmin", async (input, thunkAPI) => {
  const fd = buildRecipeFormData(input);
  const res = await apiCall("post", BASE_ADMIN, fd, thunkAPI.rejectWithValue);
  return { message: res.message || "Tarif oluşturuldu.", data: res.data };
});

export const updateRecipeAdmin = createAsyncThunk<
  { message: string; data: IRecipe },
  { id: string; input: RecipeFormInput }
>("recipes/updateAdmin", async ({ id, input }, thunkAPI) => {
  const fd = buildRecipeFormData(input);
  const res = await apiCall("put", `${BASE_ADMIN}/${id}`, fd, thunkAPI.rejectWithValue);
  return { message: res.message || "Tarif güncellendi.", data: res.data };
});

export const deleteRecipeAdmin = createAsyncThunk<
  { id: string; message: string },
  string
>("recipes/deleteAdmin", async (id, thunkAPI) => {
  const res = await apiCall("delete", `${BASE_ADMIN}/${id}`, null, thunkAPI.rejectWithValue);
  return { id, message: res.message || "Tarif silindi." };
});

export const togglePublishRecipeAdmin = createAsyncThunk<
  { message: string; data: IRecipe },
  { id: string; isPublished: boolean }
>("recipes/togglePublishAdmin", async ({ id, isPublished }, thunkAPI) => {
  const fd = new FormData();
  fd.append("isPublished", String(isPublished));
  const res = await apiCall("put", `${BASE_ADMIN}/${id}`, fd, thunkAPI.rejectWithValue);
  return { message: res.message || "Yayın durumu güncellendi.", data: res.data };
});

export const toggleActiveRecipeAdmin = createAsyncThunk<
  { message: string; data: IRecipe },
  { id: string; isActive: boolean }
>("recipes/toggleActiveAdmin", async ({ id, isActive }, thunkAPI) => {
  const fd = new FormData();
  fd.append("isActive", String(isActive));
  const res = await apiCall("put", `${BASE_ADMIN}/${id}`, fd, thunkAPI.rejectWithValue);
  return { message: res.message || "Aktiflik durumu güncellendi.", data: res.data };
});

// --- Slice ---
const recipesSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    clearRecipesMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    setSelectedRecipe(state, action: PayloadAction<IRecipe | null>) {
      state.selected = action.payload;
    },
    setAdminSelectedRecipe(state, action: PayloadAction<IRecipe | null>) {
      state.adminSelected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (s: RecipesState) => {
      s.loading = true;
      s.status = "loading";
      s.error = null;
    };
    const setFailed = (s: RecipesState, a: PayloadAction<any>) => {
      s.loading = false;
      s.status = "failed";
      s.error = extractErr(a.payload);
    };

    // Public list
    builder
      .addCase(fetchRecipesPublic.pending, setLoading)
      .addCase(fetchRecipesPublic.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.list = a.payload;
      })
      .addCase(fetchRecipesPublic.rejected, setFailed);

    // Public single by slug
    builder
      .addCase(fetchRecipeBySlug.pending, setLoading)
      .addCase(fetchRecipeBySlug.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.selected = a.payload;
      })
      .addCase(fetchRecipeBySlug.rejected, setFailed);

    // Admin list
    builder
      .addCase(fetchRecipesAdmin.pending, setLoading)
      .addCase(fetchRecipesAdmin.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.adminList = a.payload;
      })
      .addCase(fetchRecipesAdmin.rejected, setFailed);

    // Admin get by id
    builder
      .addCase(fetchRecipeByIdAdmin.pending, setLoading)
      .addCase(fetchRecipeByIdAdmin.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.adminSelected = a.payload;
      })
      .addCase(fetchRecipeByIdAdmin.rejected, setFailed);

    // Create
    builder
      .addCase(createRecipeAdmin.pending, setLoading)
      .addCase(createRecipeAdmin.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.adminList.unshift(a.payload.data);
        s.successMessage = a.payload.message;
      })
      .addCase(createRecipeAdmin.rejected, setFailed);

    // Update
    builder
      .addCase(updateRecipeAdmin.pending, setLoading)
      .addCase(updateRecipeAdmin.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const updated = a.payload.data;
        const i = s.adminList.findIndex((r) => r._id === updated._id);
        if (i !== -1) s.adminList[i] = updated;
        if (s.adminSelected?._id === updated._id) s.adminSelected = updated;
        if (s.selected?._id === updated._id) s.selected = updated;
        s.successMessage = a.payload.message;
      })
      .addCase(updateRecipeAdmin.rejected, setFailed);

    // Delete
    builder
      .addCase(deleteRecipeAdmin.pending, setLoading)
      .addCase(deleteRecipeAdmin.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.adminList = s.adminList.filter((r) => r._id !== a.payload.id);
        if (s.adminSelected?._id === a.payload.id) s.adminSelected = null;
        if (s.selected?._id === a.payload.id) s.selected = null;
        s.successMessage = a.payload.message;
      })
      .addCase(deleteRecipeAdmin.rejected, setFailed);

    // Toggle publish
    builder
      .addCase(togglePublishRecipeAdmin.pending, setLoading)
      .addCase(togglePublishRecipeAdmin.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const updated = a.payload.data;
        const i = s.adminList.findIndex((r) => r._id === updated._id);
        if (i !== -1) s.adminList[i] = updated;
        if (s.adminSelected?._id === updated._id) s.adminSelected = updated;
        if (s.selected?._id === updated._id) s.selected = updated;
        s.successMessage = a.payload.message;
      })
      .addCase(togglePublishRecipeAdmin.rejected, setFailed);

    // Toggle active
    builder
      .addCase(toggleActiveRecipeAdmin.pending, setLoading)
      .addCase(toggleActiveRecipeAdmin.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const updated = a.payload.data;
        const i = s.adminList.findIndex((r) => r._id === updated._id);
        if (i !== -1) s.adminList[i] = updated;
        if (s.adminSelected?._id === updated._id) s.adminSelected = updated;
        if (s.selected?._id === updated._id) s.selected = updated;
        s.successMessage = a.payload.message;
      })
      .addCase(toggleActiveRecipeAdmin.rejected, setFailed);
  },
});

export const {
  clearRecipesMessages,
  setSelectedRecipe,
  setAdminSelectedRecipe,
} = recipesSlice.actions;

export default recipesSlice.reducer;

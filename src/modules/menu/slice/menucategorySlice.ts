// src/modules/menucategory/slice.ts
import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IMenuCategory,
  MenuCategoryCreatePayload,
  MenuCategoryUpdatePayload,
} from "../types/menucategory";

/* ================== Utils ================== */

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in (payload as any)) {
    const msg = (payload as any).message;
    if (typeof msg === "string") return msg;
  }
  return "An error occurred.";
};

/** JSON -> FormData adapter (backend: form-data bekliyor) */
function toFormDataFromCreate(payload: MenuCategoryCreatePayload | FormData): FormData {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();
  fd.append("code", payload.code);
  fd.append("name", JSON.stringify(payload.name || {}));
  if (payload.description) fd.append("description", JSON.stringify(payload.description));
  if (typeof payload.order === "number") fd.append("order", String(payload.order));
  (payload.images || []).forEach((f) => fd.append("images", f));
  return fd;
}

function toFormDataFromUpdate(payload: MenuCategoryUpdatePayload | FormData): FormData {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();
  if (payload.name) fd.append("name", JSON.stringify(payload.name));
  if (payload.description) fd.append("description", JSON.stringify(payload.description));
  if (typeof payload.order === "number") fd.append("order", String(payload.order));
  if (typeof payload.isPublished === "boolean") fd.append("isPublished", String(payload.isPublished));
  if (typeof payload.isActive === "boolean") fd.append("isActive", String(payload.isActive));
  (payload.images || []).forEach((f) => fd.append("images", f));
  return fd;
}

/* ================== Thunks ================== */
/** PUBLIC: list (GET /menucategory) */
export const fetchMenuCategoriesPublic = createAsyncThunk<
  IMenuCategory[],
  Record<string, any> | void
>("menucategory/fetchPublic", async (params, thunkAPI) => {
  const res = await apiCall("get", `/menucategory`, params || {}, thunkAPI.rejectWithValue);
  return (res?.data ?? res) as IMenuCategory[];
});

/** ADMIN: list (GET /menucategory/admin) */
export const fetchMenuCategoriesAdmin = createAsyncThunk<
  IMenuCategory[],
  Record<string, any> | void
>("menucategory/fetchAdmin", async (params, thunkAPI) => {
  const res = await apiCall("get", `/menucategory/admin`, params || {}, thunkAPI.rejectWithValue);
  return (res?.data ?? res) as IMenuCategory[];
});

/** ADMIN: get by id (GET /menucategory/admin/:id) */
export const fetchMenuCategoryAdminById = createAsyncThunk<
  IMenuCategory,
  string
>("menucategory/fetchAdminById", async (id, thunkAPI) => {
  const res = await apiCall("get", `/menucategory/admin/${id}`, {}, thunkAPI.rejectWithValue);
  return (res?.data ?? res) as IMenuCategory;
});

/** ADMIN: create (POST /menucategory/admin) — form-data */
export const createMenuCategory = createAsyncThunk<
  { success: boolean; message?: string; data?: IMenuCategory },
  MenuCategoryCreatePayload | FormData
>("menucategory/create", async (payload, thunkAPI) => {
  const body = toFormDataFromCreate(payload);
  const res = await apiCall("post", `/menucategory/admin`, body, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IMenuCategory };
});

/** ADMIN: update (PUT /menucategory/admin/:id) — form-data */
export const updateMenuCategory = createAsyncThunk<
  { success: boolean; message?: string; data?: IMenuCategory },
  { id: string; patch: MenuCategoryUpdatePayload | FormData }
>("menucategory/update", async ({ id, patch }, thunkAPI) => {
  const body = toFormDataFromUpdate(patch);
  const res = await apiCall("put", `/menucategory/admin/${id}`, body, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IMenuCategory };
});

/** ADMIN: toggle publish convenience (PUT /menucategory/admin/:id) */
export const changeMenuCategoryPublish = createAsyncThunk<
  { success: boolean; message?: string; data?: IMenuCategory },
  { id: string; isPublished: boolean }
>("menucategory/changePublish", async ({ id, isPublished }, thunkAPI) => {
  const fd = new FormData();
  fd.append("isPublished", String(isPublished));
  const res = await apiCall("put", `/menucategory/admin/${id}`, fd, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IMenuCategory };
});

/** ADMIN: toggle active convenience (PUT /menucategory/admin/:id) */
export const changeMenuCategoryStatus = createAsyncThunk<
  { success: boolean; message?: string; data?: IMenuCategory },
  { id: string; isActive: boolean }
>("menucategory/changeStatus", async ({ id, isActive }, thunkAPI) => {
  const fd = new FormData();
  fd.append("isActive", String(isActive));
  const res = await apiCall("put", `/menucategory/admin/${id}`, fd, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IMenuCategory };
});

/** ADMIN: delete (DELETE /menucategory/admin/:id) */
export const deleteMenuCategory = createAsyncThunk<
  { id: string; message?: string },
  string
>("menucategory/delete", async (id, thunkAPI) => {
  const res = await apiCall("delete", `/menucategory/admin/${id}`, {}, thunkAPI.rejectWithValue);
  return { id, message: (res && (res.message as string)) || undefined };
});

/* ================== State ================== */

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface MenuCategoryState {
  publicList: IMenuCategory[];
  adminList: IMenuCategory[];
  selected: IMenuCategory | null;

  status: StatusType;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: MenuCategoryState = {
  publicList: [],
  adminList: [],
  selected: null,

  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

/* ================== Slice ================== */

const menuCategorySlice = createSlice({
  name: "menucategory",
  initialState,
  reducers: {
    clearMenuCategoryMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    setSelectedMenuCategory(state, action: PayloadAction<IMenuCategory | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: MenuCategoryState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
      state.successMessage = null;
    };
    const setError = (state: MenuCategoryState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // Public list
    builder
      .addCase(fetchMenuCategoriesPublic.pending, startLoading)
      .addCase(fetchMenuCategoriesPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.publicList = action.payload;
      })
      .addCase(fetchMenuCategoriesPublic.rejected, setError);

    // Admin list
    builder
      .addCase(fetchMenuCategoriesAdmin.pending, startLoading)
      .addCase(fetchMenuCategoriesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.adminList = action.payload;
      })
      .addCase(fetchMenuCategoriesAdmin.rejected, setError);

    // Admin by id
    builder
      .addCase(fetchMenuCategoryAdminById.pending, startLoading)
      .addCase(fetchMenuCategoryAdminById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchMenuCategoryAdminById.rejected, setError);

    // Create
    builder
      .addCase(createMenuCategory.pending, startLoading)
      .addCase(createMenuCategory.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const created = action.payload?.data as IMenuCategory | undefined;
        if (created) state.adminList.unshift(created);
        state.successMessage = action.payload?.message || null;
      })
      .addCase(createMenuCategory.rejected, setError);

    // Update
    builder
      .addCase(updateMenuCategory.pending, startLoading)
      .addCase(updateMenuCategory.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IMenuCategory = (action.payload?.data || action.payload) as IMenuCategory;
        const idx = state.adminList.findIndex((c) => String(c._id) === String(updated._id));
        if (idx !== -1) state.adminList[idx] = updated;
        if (state.selected && String(state.selected._id) === String(updated._id)) {
          state.selected = updated;
        }
        state.successMessage = action.payload?.message || null;
      })
      .addCase(updateMenuCategory.rejected, setError);

    // Toggle publish
    builder
      .addCase(changeMenuCategoryPublish.pending, startLoading)
      .addCase(changeMenuCategoryPublish.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IMenuCategory = (action.payload?.data || action.payload) as IMenuCategory;
        const idx = state.adminList.findIndex((c) => String(c._id) === String(updated._id));
        if (idx !== -1) state.adminList[idx] = updated;
        if (state.selected && String(state.selected._id) === String(updated._id)) {
          state.selected = updated;
        }
        state.successMessage = action.payload?.message || null;
      })
      .addCase(changeMenuCategoryPublish.rejected, setError);

    // Toggle active
    builder
      .addCase(changeMenuCategoryStatus.pending, startLoading)
      .addCase(changeMenuCategoryStatus.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IMenuCategory = (action.payload?.data || action.payload) as IMenuCategory;
        const idx = state.adminList.findIndex((c) => String(c._id) === String(updated._id));
        if (idx !== -1) state.adminList[idx] = updated;
        if (state.selected && String(state.selected._id) === String(updated._id)) {
          state.selected = updated;
        }
        state.successMessage = action.payload?.message || null;
      })
      .addCase(changeMenuCategoryStatus.rejected, setError);

    // Delete
    builder
      .addCase(deleteMenuCategory.pending, startLoading)
      .addCase(deleteMenuCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.adminList = state.adminList.filter((c) => String(c._id) !== String(action.payload.id));
        state.successMessage = action.payload?.message || null;
      })
      .addCase(deleteMenuCategory.rejected, setError);
  },
});

export const {
  clearMenuCategoryMessages,
  setSelectedMenuCategory,
} = menuCategorySlice.actions;

export default menuCategorySlice.reducer;

/* ================== Selectors ================== */
export const selectMenuCategoriesPublic = (s: any) =>
  (s.menucategory?.publicList ?? []) as IMenuCategory[];

export const selectMenuCategoriesAdmin = (s: any) =>
  (s.menucategory?.adminList ?? []) as IMenuCategory[];

export const selectMenuCategorySelected = (s: any) =>
  (s.menucategory?.selected ?? null) as IMenuCategory | null;

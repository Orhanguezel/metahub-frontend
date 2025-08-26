import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IMenu,
  MenuCreatePayload,
  MenuUpdatePayload,
} from "../types/menu";

/* ================== Utils ================== */

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in (payload as any)) {
    const msg = (payload as any).message;
    if (typeof msg === "string") return msg;
  }
  return "An error occurred.";
};

/** JSON -> FormData (Create) */
function toFormDataFromCreate(payload: MenuCreatePayload | FormData): FormData {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();
  fd.append("code", payload.code);
  fd.append("name", JSON.stringify(payload.name || {}));
  if (payload.description) fd.append("description", JSON.stringify(payload.description));
  if (payload.branches) fd.append("branches", JSON.stringify(payload.branches));
  if (payload.categories) fd.append("categories", JSON.stringify(payload.categories));
  if (payload.effectiveFrom) fd.append("effectiveFrom", payload.effectiveFrom);
  if (payload.effectiveTo) fd.append("effectiveTo", payload.effectiveTo);
  (payload.images || []).forEach((f) => fd.append("images", f));
  return fd;
}

/** JSON -> FormData (Update) — sadece gelen alanları ekle */
function toFormDataFromUpdate(payload: MenuUpdatePayload | FormData): FormData {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();
  if (payload.name) fd.append("name", JSON.stringify(payload.name));
  if (payload.description) fd.append("description", JSON.stringify(payload.description));
  if (payload.branches) fd.append("branches", JSON.stringify(payload.branches));
  if (payload.categories) fd.append("categories", JSON.stringify(payload.categories));
  if (payload.effectiveFrom) fd.append("effectiveFrom", payload.effectiveFrom);
  if (payload.effectiveTo) fd.append("effectiveTo", payload.effectiveTo);
  if (typeof payload.isPublished === "boolean") fd.append("isPublished", String(payload.isPublished));
  if (typeof payload.isActive === "boolean") fd.append("isActive", String(payload.isActive));
  (payload.images || []).forEach((f) => fd.append("images", f));
  return fd;
}

/* ================== Thunks ================== */
/** PUBLIC: list (GET /menu) */
export const fetchMenusPublic = createAsyncThunk<
  IMenu[],
  Record<string, any> | void
>("menu/fetchPublic", async (params, thunkAPI) => {
  const res = await apiCall("get", `/menu`, params || {}, thunkAPI.rejectWithValue);
  return (res?.data ?? res) as IMenu[];
});

/** PUBLIC: detail by slug (GET /menu/:slug) */
export const fetchMenuBySlug = createAsyncThunk<IMenu, string>(
  "menu/fetchBySlug",
  async (slug, thunkAPI) => {
    const res = await apiCall("get", `/menu/${encodeURIComponent(slug)}`, {}, thunkAPI.rejectWithValue);
    return (res?.data ?? res) as IMenu;
  }
);

/** ADMIN: list (GET /menu/admin) */
export const fetchMenusAdmin = createAsyncThunk<
  IMenu[],
  Record<string, any> | void
>("menu/fetchAdmin", async (params, thunkAPI) => {
  const res = await apiCall("get", `/menu/admin`, params || {}, thunkAPI.rejectWithValue);
  return (res?.data ?? res) as IMenu[];
});

/** ADMIN: get by id (GET /menu/admin/:id) */
export const fetchMenuAdminById = createAsyncThunk<IMenu, string>(
  "menu/fetchAdminById",
  async (id, thunkAPI) => {
    const res = await apiCall("get", `/menu/admin/${id}`, {}, thunkAPI.rejectWithValue);
    return (res?.data ?? res) as IMenu;
  }
);

/** ADMIN: create (POST /menu/admin) — form-data */
export const createMenu = createAsyncThunk<
  { success: boolean; message?: string; data?: IMenu },
  MenuCreatePayload | FormData
>("menu/create", async (payload, thunkAPI) => {
  const body = toFormDataFromCreate(payload);
  const res = await apiCall("post", `/menu/admin`, body, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IMenu };
});

/** ADMIN: update (PUT /menu/admin/:id) — form-data */
export const updateMenu = createAsyncThunk<
  { success: boolean; message?: string; data?: IMenu },
  { id: string; patch: MenuUpdatePayload | FormData }
>("menu/update", async ({ id, patch }, thunkAPI) => {
  const body = toFormDataFromUpdate(patch);
  const res = await apiCall("put", `/menu/admin/${id}`, body, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IMenu };
});

/** ADMIN: convenience — publish toggle (PUT /menu/admin/:id) */
export const changeMenuPublish = createAsyncThunk<
  { success: boolean; message?: string; data?: IMenu },
  { id: string; isPublished: boolean }
>("menu/changePublish", async ({ id, isPublished }, thunkAPI) => {
  const fd = new FormData();
  fd.append("isPublished", String(isPublished));
  const res = await apiCall("put", `/menu/admin/${id}`, fd, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IMenu };
});

/** ADMIN: convenience — active toggle (PUT /menu/admin/:id) */
export const changeMenuStatus = createAsyncThunk<
  { success: boolean; message?: string; data?: IMenu },
  { id: string; isActive: boolean }
>("menu/changeStatus", async ({ id, isActive }, thunkAPI) => {
  const fd = new FormData();
  fd.append("isActive", String(isActive));
  const res = await apiCall("put", `/menu/admin/${id}`, fd, thunkAPI.rejectWithValue);
  return res as { success: boolean; message?: string; data?: IMenu };
});

/** ADMIN: delete (DELETE /menu/admin/:id) */
export const deleteMenu = createAsyncThunk<
  { id: string; message?: string },
  string
>("menu/delete", async (id, thunkAPI) => {
  const res = await apiCall("delete", `/menu/admin/${id}`, {}, thunkAPI.rejectWithValue);
  return { id, message: (res && (res.message as string)) || undefined };
});

/* ================== State ================== */

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface MenuState {
  publicList: IMenu[];
  adminList: IMenu[];
  selected: IMenu | null;

  status: StatusType;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: MenuState = {
  publicList: [],
  adminList: [],
  selected: null,

  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

/* ================== Slice ================== */

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    clearMenuMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    setSelectedMenu(state, action: PayloadAction<IMenu | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: MenuState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
      state.successMessage = null;
    };
    const setError = (state: MenuState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // Public list
    builder
      .addCase(fetchMenusPublic.pending, startLoading)
      .addCase(fetchMenusPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.publicList = action.payload;
      })
      .addCase(fetchMenusPublic.rejected, setError);

    // Public by slug
    builder
      .addCase(fetchMenuBySlug.pending, startLoading)
      .addCase(fetchMenuBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchMenuBySlug.rejected, setError);

    // Admin list
    builder
      .addCase(fetchMenusAdmin.pending, startLoading)
      .addCase(fetchMenusAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.adminList = action.payload;
      })
      .addCase(fetchMenusAdmin.rejected, setError);

    // Admin by id
    builder
      .addCase(fetchMenuAdminById.pending, startLoading)
      .addCase(fetchMenuAdminById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchMenuAdminById.rejected, setError);

    // Create
    builder
      .addCase(createMenu.pending, startLoading)
      .addCase(createMenu.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const created = action.payload?.data as IMenu | undefined;
        if (created) state.adminList.unshift(created);
        state.successMessage = action.payload?.message || null;
      })
      .addCase(createMenu.rejected, setError);

    // Update
    builder
      .addCase(updateMenu.pending, startLoading)
      .addCase(updateMenu.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IMenu = (action.payload?.data || action.payload) as IMenu;
        const idx = state.adminList.findIndex((m) => String(m._id) === String(updated._id));
        if (idx !== -1) state.adminList[idx] = updated;
        if (state.selected && String(state.selected._id) === String(updated._id)) {
          state.selected = updated;
        }
        state.successMessage = action.payload?.message || null;
      })
      .addCase(updateMenu.rejected, setError);

    // Toggle publish
    builder
      .addCase(changeMenuPublish.pending, startLoading)
      .addCase(changeMenuPublish.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IMenu = (action.payload?.data || action.payload) as IMenu;
        const idx = state.adminList.findIndex((m) => String(m._id) === String(updated._id));
        if (idx !== -1) state.adminList[idx] = updated;
        if (state.selected && String(state.selected._id) === String(updated._id)) {
          state.selected = updated;
        }
        state.successMessage = action.payload?.message || null;
      })
      .addCase(changeMenuPublish.rejected, setError);

    // Toggle active
    builder
      .addCase(changeMenuStatus.pending, startLoading)
      .addCase(changeMenuStatus.fulfilled, (state, action: any) => {
        state.loading = false;
        state.status = "succeeded";
        const updated: IMenu = (action.payload?.data || action.payload) as IMenu;
        const idx = state.adminList.findIndex((m) => String(m._id) === String(updated._id));
        if (idx !== -1) state.adminList[idx] = updated;
        if (state.selected && String(state.selected._id) === String(updated._id)) {
          state.selected = updated;
        }
        state.successMessage = action.payload?.message || null;
      })
      .addCase(changeMenuStatus.rejected, setError);

    // Delete
    builder
      .addCase(deleteMenu.pending, startLoading)
      .addCase(deleteMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.adminList = state.adminList.filter((m) => String(m._id) !== String(action.payload.id));
        state.successMessage = action.payload?.message || null;
      })
      .addCase(deleteMenu.rejected, setError);
  },
});

export const { clearMenuMessages, setSelectedMenu } = menuSlice.actions;
export default menuSlice.reducer;

/* ================== Selectors ================== */
export const selectMenusPublic = (s: any) =>
  (s.menu?.publicList ?? []) as IMenu[];

export const selectMenusAdmin = (s: any) =>
  (s.menu?.adminList ?? []) as IMenu[];

export const selectMenuSelected = (s: any) =>
  (s.menu?.selected ?? null) as IMenu | null;

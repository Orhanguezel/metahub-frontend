// src/modules/menu/slice/menuitemSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IMenuItem,
  MenuItemCreatePayload,
  MenuItemUpdatePayload,
} from "../types/menuitem";

/* ============= utils ============= */
const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in (payload as any)) {
    const msg = (payload as any).message;
    if (typeof msg === "string") return msg;
  }
  return "An error occurred.";
};

// JSON alanlarını her durumda (boş dizi/obje dahil) yaz:
const appendJSON = (fd: FormData, key: string, v: any) => {
  if (v === undefined) return;              // sadece undefined gönderme
  fd.append(key, JSON.stringify(v));        // null, [], {} hepsi yazılır
};

// Primitive’lerde boş string’i yazma
const appendVal = (fd: FormData, key: string, v: any) => {
  if (v === undefined || v === null || v === "") return;
  fd.append(key, v);
};

/* JSON -> FormData (Create) */
const toFDCreate = (payload: MenuItemCreatePayload | FormData): FormData => {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();

  fd.append("code", payload.code);
  appendVal(fd, "slug", payload.slug);

  // JSON alanlar — create’te de boş dizi/obje gönderimini destekle
  appendJSON(fd, "name", payload.name);
  appendJSON(fd, "description", payload.description);
  appendJSON(fd, "categories", payload.categories);
  appendJSON(fd, "variants", payload.variants);               // prices gömülü
  appendJSON(fd, "modifierGroups", payload.modifierGroups);   // option.prices gömülü
  appendJSON(fd, "allergens", payload.allergens);
  appendJSON(fd, "additives", payload.additives);
  appendJSON(fd, "dietary", payload.dietary);
  appendJSON(fd, "ops", payload.ops);

  appendVal(fd, "sku", payload.sku);
  appendVal(fd, "barcode", payload.barcode);
  appendVal(fd, "taxCode", payload.taxCode);

  (payload.images || []).forEach((f) => fd.append("images", f));
  return fd;
};

/* JSON -> FormData (Update) — boş dizileri/objeleri de gönder */
const toFDUpdate = (payload: MenuItemUpdatePayload | FormData): FormData => {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();

  // string alan
  if (payload.slug !== undefined) appendVal(fd, "slug", payload.slug);

  // JSON alanlar -> UNDEFINED değilse gönder (boş dizi/obje dahil)
  if (payload.name !== undefined)           appendJSON(fd, "name", payload.name);
  if (payload.description !== undefined)    appendJSON(fd, "description", payload.description);
  if (payload.categories !== undefined)     appendJSON(fd, "categories", payload.categories);
  if (payload.variants !== undefined)       appendJSON(fd, "variants", payload.variants);
  if (payload.modifierGroups !== undefined) appendJSON(fd, "modifierGroups", payload.modifierGroups);
  if (payload.allergens !== undefined)      appendJSON(fd, "allergens", payload.allergens);
  if (payload.additives !== undefined)      appendJSON(fd, "additives", payload.additives);
  if (payload.dietary !== undefined)        appendJSON(fd, "dietary", payload.dietary);
  if (payload.ops !== undefined)            appendJSON(fd, "ops", payload.ops);

  // görsel yardımcı alanlar
  if (payload.existingImagesOrder !== undefined) appendJSON(fd, "existingImagesOrder", payload.existingImagesOrder);
  if (payload.removedImages !== undefined)       appendJSON(fd, "removedImages", payload.removedImages);

  // diğer primitifler
  if (payload.sku !== undefined)     appendVal(fd, "sku", payload.sku);
  if (payload.barcode !== undefined) appendVal(fd, "barcode", payload.barcode);
  if (payload.taxCode !== undefined) appendVal(fd, "taxCode", payload.taxCode);

  // booleanlar
  if (typeof payload.isPublished === "boolean") fd.append("isPublished", String(payload.isPublished));
  if (typeof payload.isActive === "boolean")    fd.append("isActive", String(payload.isActive));

  (payload.images || []).forEach((f) => fd.append("images", f));
  return fd;
};

const BASE = "/menuitem";

/* ============= thunks ============= */
/** ⚠️ PUBLIC: backend’de /menuitem yoksa bu thunk kullanılmamalı */
export const fetchMenuItemsPublic = createAsyncThunk<IMenuItem[], Record<string, any> | void>(
  "menuitem/fetchPublic",
  async (params, thunk) => {
    const res = await apiCall("get", `${BASE}`, params || {}, thunk.rejectWithValue);
    return (res?.data as IMenuItem[]) || [];
  }
);

export const fetchMenuItemBySlug = createAsyncThunk<IMenuItem, string>(
  "menuitem/fetchBySlug",
  async (slug, thunk) => {
    const res = await apiCall("get", `${BASE}/${encodeURIComponent(slug)}`, {}, thunk.rejectWithValue);
    return res?.data as IMenuItem;
  }
);

export const fetchMenuItemsAdmin = createAsyncThunk<IMenuItem[], Record<string, any> | void>(
  "menuitem/fetchAdmin",
  async (params, thunk) => {
    const res = await apiCall("get", `${BASE}/admin`, params || {}, thunk.rejectWithValue);
    return (res?.data as IMenuItem[]) || [];
  }
);

export const fetchMenuItemAdminById = createAsyncThunk<IMenuItem, string>(
  "menuitem/fetchAdminById",
  async (id, thunk) => {
    const res = await apiCall("get", `${BASE}/admin/${id}`, {}, thunk.rejectWithValue);
    return res?.data as IMenuItem;
  }
);

type ApiResp<T> = { success: boolean; message?: string; data?: T };

export const createMenuItem = createAsyncThunk<ApiResp<IMenuItem>, MenuItemCreatePayload | FormData>(
  "menuitem/create",
  async (payload, thunk) => {
    const body = toFDCreate(payload);
    const res = await apiCall("post", `${BASE}/admin`, body, thunk.rejectWithValue);
    return res as ApiResp<IMenuItem>;
  }
);

export const updateMenuItem = createAsyncThunk<ApiResp<IMenuItem>, { id: string; patch: MenuItemUpdatePayload | FormData }>(
  "menuitem/update",
  async ({ id, patch }, thunk) => {
    // Emniyet kemeri: boşaltma senaryosunda alanlar gelmezse boş dizi gönder
    if (!(patch instanceof FormData)) {
      if (patch.allergens === undefined) patch.allergens = [];
      if (patch.additives === undefined) patch.additives = [];
    }
    const body = toFDUpdate(patch);
    const res = await apiCall("put", `${BASE}/admin/${id}`, body, thunk.rejectWithValue);
    return res as ApiResp<IMenuItem>;
  }
);

export const changeMenuItemPublish = createAsyncThunk<ApiResp<IMenuItem>, { id: string; isPublished: boolean }>(
  "menuitem/changePublish",
  async ({ id, isPublished }, thunk) => {
    const fd = new FormData(); fd.append("isPublished", String(isPublished));
    const res = await apiCall("put", `${BASE}/admin/${id}`, fd, thunk.rejectWithValue);
    return res as ApiResp<IMenuItem>;
  }
);

export const changeMenuItemStatus = createAsyncThunk<ApiResp<IMenuItem>, { id: string; isActive: boolean }>(
  "menuitem/changeStatus",
  async ({ id, isActive }, thunk) => {
    const fd = new FormData(); fd.append("isActive", String(isActive));
    const res = await apiCall("put", `${BASE}/admin/${id}`, fd, thunk.rejectWithValue);
    return res as ApiResp<IMenuItem>;
  }
);

export const deleteMenuItem = createAsyncThunk<{ id: string; message?: string }, string>(
  "menuitem/delete",
  async (id, thunk) => {
    const res = await apiCall("delete", `${BASE}/admin/${id}`, {}, thunk.rejectWithValue);
    return { id, message: res?.message as string | undefined };
  }
);

/* ============= state + slice ============= */
type Status = "idle" | "loading" | "succeeded" | "failed";

interface MenuItemState {
  publicList: IMenuItem[];
  adminList: IMenuItem[];
  selected: IMenuItem | null;
  status: Status;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: MenuItemState = {
  publicList: [],
  adminList: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const upsert = (list: IMenuItem[], item?: IMenuItem) => {
  if (!item || !item._id) return list;
  const i = list.findIndex((m) => String(m._id) === String(item._id));
  if (i >= 0) list[i] = item; else list.unshift(item);
  return list;
};

const menuItemSlice = createSlice({
  name: "menuitem",
  initialState,
  reducers: {
    clearMenuItemMessages(s) {
      s.error = null; s.successMessage = null; s.status = "idle";
    },
    setSelectedMenuItem(s, a: PayloadAction<IMenuItem | null>) {
      s.selected = a.payload;
    },
  },
  extraReducers: (b) => {
    const start = (s: MenuItemState) => { s.loading = true; s.status = "loading"; s.error = null; s.successMessage = null; };
    const fail = (s: MenuItemState, a: any) => {
      s.loading = false; s.status = "failed";
      s.error = extractErrorMessage(a?.payload) || a?.error?.message || "An error occurred.";
    };

    // public
    b.addCase(fetchMenuItemsPublic.pending, start);
    b.addCase(fetchMenuItemsPublic.fulfilled, (s, a) => { s.loading = false; s.status = "succeeded"; s.publicList = a.payload; });
    b.addCase(fetchMenuItemsPublic.rejected, fail);

    b.addCase(fetchMenuItemBySlug.pending, start);
    b.addCase(fetchMenuItemBySlug.fulfilled, (s, a) => { s.loading = false; s.status = "succeeded"; s.selected = a.payload; });
    b.addCase(fetchMenuItemBySlug.rejected, fail);

    // admin lists
    b.addCase(fetchMenuItemsAdmin.pending, start);
    b.addCase(fetchMenuItemsAdmin.fulfilled, (s, a) => { s.loading = false; s.status = "succeeded"; s.adminList = a.payload; });
    b.addCase(fetchMenuItemsAdmin.rejected, fail);

    b.addCase(fetchMenuItemAdminById.pending, start);
    b.addCase(fetchMenuItemAdminById.fulfilled, (s, a) => { s.loading = false; s.status = "succeeded"; s.selected = a.payload; });
    b.addCase(fetchMenuItemAdminById.rejected, fail);

    // create/update + toggles
    const onUpdateFulfilled = (s: MenuItemState, a: PayloadAction<ApiResp<IMenuItem>>) => {
      s.loading = false; s.status = "succeeded";
      const updated = a.payload?.data;
      s.adminList = upsert([...s.adminList], updated);
      if (s.selected && updated && String(s.selected._id) === String(updated._id)) s.selected = updated;
      s.successMessage = a.payload?.message || null;
    };

    b.addCase(createMenuItem.pending, start);
    b.addCase(createMenuItem.fulfilled, (s, a) => {
      s.loading = false; s.status = "succeeded";
      const item = a.payload?.data;
      s.adminList = upsert([...s.adminList], item);
      s.successMessage = a.payload?.message || null;
    });
    b.addCase(createMenuItem.rejected, fail);

    b.addCase(updateMenuItem.pending, start);
    b.addCase(updateMenuItem.fulfilled, onUpdateFulfilled);
    b.addCase(updateMenuItem.rejected, fail);

    b.addCase(changeMenuItemPublish.pending, start);
    b.addCase(changeMenuItemPublish.fulfilled, onUpdateFulfilled);
    b.addCase(changeMenuItemPublish.rejected, fail);

    b.addCase(changeMenuItemStatus.pending, start);
    b.addCase(changeMenuItemStatus.fulfilled, onUpdateFulfilled);
    b.addCase(changeMenuItemStatus.rejected, fail);

    // delete
    b.addCase(deleteMenuItem.pending, start);
    b.addCase(deleteMenuItem.fulfilled, (s, a) => {
      s.loading = false; s.status = "succeeded";
      s.adminList = s.adminList.filter((m) => String(m._id) !== String(a.payload.id));
      s.successMessage = a.payload?.message || null;
    });
    b.addCase(deleteMenuItem.rejected, fail);
  },
});

export const { clearMenuItemMessages, setSelectedMenuItem } = menuItemSlice.actions;
export default menuItemSlice.reducer;

/* ============= selectors ============= */
export const selectMenuItemsPublic = (s: any) => (s.menuitem?.publicList ?? []) as IMenuItem[];
export const selectMenuItemsAdmin  = (s: any) => (s.menuitem?.adminList ?? []) as IMenuItem[];
export const selectMenuItemSelected = (s: any) => (s.menuitem?.selected ?? null) as IMenuItem | null;

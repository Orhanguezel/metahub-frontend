// slice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { CatalogAdminFilters, IServiceCatalog, IServiceCatalogImage } from "../types";

const BASE = "/servicecatalog/admin";
const pick = <T,>(res: any, fb: T): T =>
  (res && typeof res === "object" && "data" in res ? (res.data as T) : ((res as T) ?? fb));

// ✅ küçük yardımcılar
const unwrap = <T,>(r: any) => ({ data: pick<T>(r, {} as any), message: r?.message as string | undefined });
const prune = (o: Record<string, any> = {}) => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out;
};

/* ---------- helpers ---------- */
function buildFormData(payload: Record<string, any>, files?: File[], removedImages?: IServiceCatalogImage[]) {
  const fd = new FormData();
  // ❗ removedImages jsonKeys’ten çıkarıldı (çift append bug fix)
  const jsonKeys = new Set(["name", "description", "tags"]);
  for (const [k, v] of Object.entries(payload)) {
    if (v === undefined || v === null) continue;
    if (jsonKeys.has(k)) fd.append(k, typeof v === "string" ? v : JSON.stringify(v));
    else fd.append(k, String(v));
  }
  if (removedImages?.length) fd.append("removedImages", JSON.stringify(removedImages));
  (files || []).forEach((f) => fd.append("images", f));
  return fd;
}

interface State {
  items: IServiceCatalog[];
  selected: IServiceCatalog | null;
  loading: boolean;
  error: string | null;
  success: string | null; // BE’den gelen localized mesajı saklayacağız
}
const initialState: State = { items: [], selected: null, loading: false, error: null, success: null };

/* ---------- thunks ---------- */
export const fetchCatalogs = createAsyncThunk<IServiceCatalog[], CatalogAdminFilters | void, { rejectValue: string }>(
  "servicecatalog/fetchCatalogs",
  async (filters, api) => {
    try {
      const clean = prune(filters as any);
      const r = await apiCall("get", BASE, clean);
      return pick<IServiceCatalog[]>(r, []);
    } catch (e: any) {
      return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Fetch failed");
    }
  }
);

export const fetchCatalogById = createAsyncThunk<IServiceCatalog, string, { rejectValue: string }>(
  "servicecatalog/fetchById",
  async (id, api) => {
    try {
      const r = await apiCall("get", `${BASE}/${id}`);
      return pick<IServiceCatalog>(r, {} as any);
    } catch (e: any) {
      return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Fetch failed");
    }
  }
);

export const createCatalog = createAsyncThunk<
  IServiceCatalog,
  { data: Partial<IServiceCatalog>; files?: File[] },
  { rejectValue: string }
>("servicecatalog/create", async ({ data, files }, api) => {
  try {
    const fd = buildFormData(
      {
        code: data.code,
        name: data.name ?? {},
        description: data.description ?? {},
        defaultDurationMin: data.defaultDurationMin,
        defaultTeamSize: data.defaultTeamSize,
        suggestedPrice: data.suggestedPrice ?? "",
        category: typeof data.category === "object" ? (data.category as any)?._id : data.category,
        tags: data.tags ?? [],
        isActive: data.isActive ?? true,
      },
      files
    );
    const r = await apiCall("post", BASE, fd);
    const { data: created, message } = unwrap<IServiceCatalog>(r);
    if (message) api.dispatch({ type: "servicecatalog/setSvcSuccess", payload: message });
    return created;
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Create failed");
  }
});

export const updateCatalog = createAsyncThunk<
  IServiceCatalog,
  { id: string; data: Partial<IServiceCatalog>; files?: File[]; removedImages?: IServiceCatalogImage[] },
  { rejectValue: string }
>("servicecatalog/update", async ({ id, data, files, removedImages }, api) => {
  try {
    const fd = buildFormData(
      {
        code: data.code,
        name: data.name,
        description: data.description,
        defaultDurationMin: data.defaultDurationMin,
        defaultTeamSize: data.defaultTeamSize,
        suggestedPrice: data.suggestedPrice,
        category: typeof data.category === "object" ? (data.category as any)?._id : data.category,
        tags: data.tags,
        // ❗ eksikti: isActive güncellenebilir
        isActive: data.isActive,
      },
      files,
      removedImages
    );
    const r = await apiCall("put", `${BASE}/${id}`, fd);
    const { data: updated, message } = unwrap<IServiceCatalog>(r);
    if (message) api.dispatch({ type: "servicecatalog/setSvcSuccess", payload: message });
    return updated;
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Update failed");
  }
});

export const deleteCatalog = createAsyncThunk<{ id: string }, string, { rejectValue: string }>(
  "servicecatalog/delete",
  async (id, api) => {
    try {
      const r = await apiCall("delete", `${BASE}/${id}`);
      const { message } = unwrap<any>(r);
      if (message) api.dispatch({ type: "servicecatalog/setSvcSuccess", payload: message });
      return { id };
    } catch (e: any) {
      return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Delete failed");
    }
  }
);

/* ---------- slice ---------- */
const slice = createSlice({
  name: "servicecatalog",
  initialState,
  reducers: {
    clearSvcMsgs: (s) => {
      s.error = null;
      s.success = null;
    },
    setSelectedSvc: (s, a: PayloadAction<IServiceCatalog | null>) => {
      s.selected = a.payload;
    },
    // ✅ BE’den gelen localized mesajı UI’da göstermek için
    setSvcSuccess: (s, a: PayloadAction<string | null>) => {
      s.success = a.payload || null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchCatalogs.fulfilled, (s, a) => {
      s.items = a.payload;
      s.loading = false;
    });
    b.addCase(fetchCatalogById.fulfilled, (s, a) => {
      s.selected = a.payload;
      s.loading = false;
    });
    b.addCase(createCatalog.fulfilled, (s, a) => {
      if (a.payload?._id) s.items.unshift(a.payload);
      s.loading = false;
    });
    b.addCase(updateCatalog.fulfilled, (s, a) => {
      const i = s.items.findIndex((x) => x._id === a.payload._id);
      if (i !== -1) s.items[i] = a.payload;
      if (s.selected?._id === a.payload._id) s.selected = a.payload;
      s.loading = false;
    });
    b.addCase(deleteCatalog.fulfilled, (s, a) => {
      s.items = s.items.filter((x) => x._id !== a.payload.id);
      if (s.selected?._id === a.payload.id) s.selected = null;
      s.loading = false;
    });
    b.addMatcher(
      (ac) => ac.type.startsWith("servicecatalog/") && ac.type.endsWith("/pending"),
      (s) => {
        s.loading = true;
        s.error = null;
        s.success = null;
      }
    );
    b.addMatcher(
      (ac) => ac.type.startsWith("servicecatalog/") && ac.type.endsWith("/rejected"),
      (s: any, ac: any) => {
        s.loading = false;
        s.error = ac.payload || "Operation failed";
      }
    );
  },
});

export const { clearSvcMsgs, setSelectedSvc, setSvcSuccess } = slice.actions;
export default slice.reducer;

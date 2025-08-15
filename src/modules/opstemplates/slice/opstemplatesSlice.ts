// src/modules/operationstemplates/slice/operationstemplatesSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IOperationTemplate,
  TemplatesAdminFilters,
  CreateOpsTemplateDTO,
  UpdateOpsTemplateDTO,
} from "../types";

/**
 * 🔌 BASE path
 * Router admin guard ile geliyor; projendeki mount’a göre AYARLA:
 *  - Eğer BE’de: app.use("/admin/operationstemplates", router)  -> BASE = "/admin/operationstemplates"
 *  - Eğer BE’de: app.use("/operationstemplates", router)         -> BASE = "/operationstemplates"
 */
const BASE = "/operationstemplates";

/** apiCall sözleşmesi: bazı projelerde `data` direkt döner. Bu helper ikisini de destekler. */
const pick = <T,>(res: any, fb: T): T =>
  res && typeof res === "object" && "data" in res ? (res.data as T) : (res as T ?? fb);

/** FormData desteği gerekirse: nested alanlar JSON.stringfy ile gönderilir. */
const stringifyNestedIfFormData = (body: any) => {
  if (typeof FormData !== "undefined" && body instanceof FormData) return body;
  return body; // JSON post ediyorsak dokunma (BE transformNestedFields obje de kabul ediyor)
};

type Reject = { rejectValue: string };

interface State {
  items: IOperationTemplate[];
  loading: boolean;
  error: string | null;
  success: string | null;
  selected: IOperationTemplate | null;
}
const initialState: State = { items: [], loading: false, error: null, success: null, selected: null };

/* ========================= THUNKS ========================= */

export const fetchAllOpsTemplatesAdmin = createAsyncThunk<
  IOperationTemplate[],
  TemplatesAdminFilters | void,
  Reject
>("opstemplates/fetchAll", async (filters, api) => {
  try {
    // BE tarafında isActive yoksa default true uygulanıyor; burada paramı opsiyonel bırakıyoruz.
    const res = await apiCall("get", BASE, filters as any);
    return pick<IOperationTemplate[]>(res, []);
  } catch (e: any) {
      return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Fetch failed");
    }
  }
);


export const fetchOpsTemplateById = createAsyncThunk<
  IOperationTemplate,
  string,
  Reject
>("opstemplates/fetchById", async (id, api) => {
  try {
    const res = await apiCall("get", `${BASE}/${id}`);
    return pick<IOperationTemplate>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.response?.data?.message ?? e?.message ?? "Fetch by id failed");
  }
});

export const createOpsTemplate = createAsyncThunk<
  IOperationTemplate,
  CreateOpsTemplateDTO | FormData,
  Reject
>("opstemplates/create", async (payload, api) => {
  try {
    const body = stringifyNestedIfFormData(payload);
    const res = await apiCall("post", BASE, body);
    return pick<IOperationTemplate>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.response?.data?.message ?? e?.message ?? "Create failed");
  }
});

export const updateOpsTemplate = createAsyncThunk<
  IOperationTemplate,
  { id: string; changes: UpdateOpsTemplateDTO | FormData },
  Reject
>("opstemplates/update", async ({ id, changes }, api) => {
  try {
    const body = stringifyNestedIfFormData(changes);
    const res = await apiCall("put", `${BASE}/${id}`, body);
    return pick<IOperationTemplate>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.response?.data?.message ?? e?.message ?? "Update failed");
  }
});

export const deleteOpsTemplate = createAsyncThunk<
  { id: string },
  string,
  Reject
>("opstemplates/delete", async (id, api) => {
  try {
    await apiCall("delete", `${BASE}/${id}`);
    return { id };
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.response?.data?.message ?? e?.message ?? "Delete failed");
  }
});

/* ========================= SLICE ========================= */

const slice = createSlice({
  name: "opstemplates",
  initialState,
  reducers: {
    clearOpsTemplateMsgs: (s) => { s.error = null; s.success = null; },
    setSelectedOpsTemplate: (s, a: PayloadAction<IOperationTemplate | null>) => { s.selected = a.payload; },
  },
  extraReducers: (b) => {
    // fetch all
    b.addCase(fetchAllOpsTemplatesAdmin.fulfilled, (s, a) => {
      s.items = a.payload; s.loading = false; s.error = null;
    });
    // fetch by id
    b.addCase(fetchOpsTemplateById.fulfilled, (s, a) => {
      s.selected = a.payload ?? null;
      s.loading = false; s.error = null;
    });
    // create
    b.addCase(createOpsTemplate.fulfilled, (s, a) => {
      if (a.payload?._id) s.items.unshift(a.payload);
      s.loading = false; s.success = "created";
    });
    // update
    b.addCase(updateOpsTemplate.fulfilled, (s, a) => {
      const i = s.items.findIndex((x) => x._id === a.payload._id);
      if (i !== -1) s.items[i] = a.payload;
      s.loading = false; s.success = "updated";
      // seçili kart güncelleniyorsa eşitle
      if (s.selected?._id === a.payload._id) s.selected = a.payload;
    });
    // delete
    b.addCase(deleteOpsTemplate.fulfilled, (s, a) => {
      s.items = s.items.filter((x) => x._id !== a.payload.id);
      s.loading = false; s.success = "deleted";
      if (s.selected?._id === a.payload.id) s.selected = null;
    });

    // pending / rejected genel matcher’lar
    b.addMatcher(
      (ac) => ac.type.startsWith("opstemplates/") && ac.type.endsWith("/pending"),
      (s) => { s.loading = true; s.error = null; s.success = null; }
    );
    b.addMatcher(
      (ac) => ac.type.startsWith("opstemplates/") && ac.type.endsWith("/rejected"),
      (s: any, ac: any) => { s.loading = false; s.error = ac.payload || "Operation failed"; }
    );
  },
});

export const { clearOpsTemplateMsgs, setSelectedOpsTemplate } = slice.actions;
export default slice.reducer;

/* ========================= SELECTORS (opsiyonel) ========================= */
// export const selectOpsTemplates = (s: RootState) => s.opstemplates.items;
// export const selectOpsTemplateById = (id: string) => (s: RootState) => s.opstemplates.items.find(x => x._id === id);

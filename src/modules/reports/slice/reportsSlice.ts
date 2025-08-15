// src/modules/reports/slice/reportsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IReportDefinition, IReportRun,
  DefinitionAdminFilters, RunAdminFilters
} from "../types";

const BASE = "/reports";

/* ---------- helpers ---------- */
const take = <T,>(r: any, fb: T): T => (r?.data ?? r ?? fb) as T;

// backend transformNestedFields ile uyum için: nested alanları stringle
function jsonIfDefined<T>(v: T | undefined) {
  return v === undefined ? undefined : JSON.stringify(v);
}
function toDefPayload(changes: Partial<IReportDefinition>) {
  const p: Record<string, any> = { ...changes };
  if ("defaultFilters" in p) p.defaultFilters = jsonIfDefined(p.defaultFilters);
  if ("view" in p)            p.view            = jsonIfDefined(p.view);
  if ("schedule" in p)        p.schedule        = jsonIfDefined(p.schedule);
  if ("tags" in p && Array.isArray(p.tags)) p.tags = JSON.stringify(p.tags);
  return p;
}
function toRunPayload(payload: { definitionRef?: string; kind?: string; filtersUsed?: any; triggeredBy?: "manual"|"schedule"|"api" }) {
  const p: Record<string, any> = { ...payload };
  if ("filtersUsed" in p) p.filtersUsed = jsonIfDefined(p.filtersUsed);
  return p;
}

function upsert<T extends { _id?: string }>(arr: T[], item: T) {
  if (!item?._id) return arr;
  const i = arr.findIndex(x => x._id === item._id);
  if (i === -1) return [item, ...arr];
  const next = arr.slice();
  next[i] = item;
  return next;
}

/* ---------- state ---------- */
interface State {
  defs: IReportDefinition[];
  selectedDef: IReportDefinition | null;

  runs: IReportRun[];
  selectedRun: IReportRun | null;

  loading: boolean;
  error: string | null;
  success: string | null;
}
const initialState: State = {
  defs: [], selectedDef: null,
  runs: [], selectedRun: null,
  loading: false, error: null, success: null
};

/* ---------- thunks: definitions ---------- */
export const fetchDefinitions = createAsyncThunk<
  IReportDefinition[], DefinitionAdminFilters | void, { rejectValue: string }
>("reports/fetchDefinitions", async (filters, api) => {
  try {
    const res = await apiCall("get", `${BASE}/definitions`, filters as any);
    return take<IReportDefinition[]>(res, []);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Fetch failed");
  }
});

export const fetchDefinitionById = createAsyncThunk<
  IReportDefinition, string, { rejectValue: string }
>("reports/fetchDefinitionById", async (id, api) => {
  try {
    const res = await apiCall("get", `${BASE}/definitions/${id}`);
    return take<IReportDefinition>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Fetch failed");
  }
});

export const createDefinition = createAsyncThunk<
  IReportDefinition, Partial<IReportDefinition>, { rejectValue: string }
>("reports/createDefinition", async (changes, api) => {
  try {
    const res = await apiCall("post", `${BASE}/definitions`, toDefPayload(changes));
    return take<IReportDefinition>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Create failed");
  }
});

export const updateDefinition = createAsyncThunk<
  IReportDefinition, { id: string; changes: Partial<IReportDefinition> }, { rejectValue: string }
>("reports/updateDefinition", async ({ id, changes }, api) => {
  try {
    const res = await apiCall("put", `${BASE}/definitions/${id}`, toDefPayload(changes));
    return take<IReportDefinition>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Update failed");
  }
});

export const deleteDefinition = createAsyncThunk<
  { id: string }, string, { rejectValue: string }
>("reports/deleteDefinition", async (id, api) => {
  try {
    await apiCall("delete", `${BASE}/definitions/${id}`);
    return { id };
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Delete failed");
  }
});

/* ---------- thunks: runs ---------- */
export const fetchRuns = createAsyncThunk<
  IReportRun[], RunAdminFilters | void, { rejectValue: string }
>("reports/fetchRuns", async (filters, api) => {
  try {
    const res = await apiCall("get", `${BASE}/runs`, filters as any);
    return take<IReportRun[]>(res, []);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Fetch failed");
  }
});

export const fetchRunById = createAsyncThunk<
  IReportRun, string, { rejectValue: string }
>("reports/fetchRunById", async (id, api) => {
  try {
    const res = await apiCall("get", `${BASE}/runs/${id}`);
    return take<IReportRun>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Fetch failed");
  }
});

export const createRun = createAsyncThunk<
  IReportRun, { definitionRef?: string; kind?: string; filtersUsed?: any; triggeredBy?: "manual"|"schedule"|"api" }, { rejectValue: string }
>("reports/createRun", async (payload, api) => {
  try {
    const res = await apiCall("post", `${BASE}/runs`, toRunPayload(payload));
    return take<IReportRun>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Create failed");
  }
});

export const deleteRun = createAsyncThunk<
  { id: string }, string, { rejectValue: string }
>("reports/deleteRun", async (id, api) => {
  try {
    await apiCall("delete", `${BASE}/runs/${id}`);
    return { id };
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Delete failed");
  }
});

/* ---------- slice ---------- */
const slice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearReportsMsgs: (s) => { s.error = null; s.success = null; },
    setSelectedDefinition: (s, a: PayloadAction<IReportDefinition | null>) => { s.selectedDef = a.payload; },
    setSelectedRun: (s, a: PayloadAction<IReportRun | null>) => { s.selectedRun = a.payload; },
  },
  extraReducers: (b) => {
    /* defs */
    b.addCase(fetchDefinitions.fulfilled, (s, a) => { s.defs = a.payload; s.loading = false; });
    b.addCase(fetchDefinitionById.fulfilled, (s, a) => { s.selectedDef = a.payload; s.loading = false; });

    b.addCase(createDefinition.fulfilled, (s, a) => {
      s.defs = upsert(s.defs, a.payload);
      s.success = "Definition created."; s.loading = false;
    });
    b.addCase(updateDefinition.fulfilled, (s, a) => {
      s.defs = upsert(s.defs, a.payload);
      if (s.selectedDef?._id === a.payload._id) s.selectedDef = a.payload;
      s.success = "Definition updated."; s.loading = false;
    });
    b.addCase(deleteDefinition.fulfilled, (s, a) => {
      s.defs = s.defs.filter(d => d._id !== a.payload.id);
      if (s.selectedDef?._id === a.payload.id) s.selectedDef = null;
      s.success = "Definition deleted."; s.loading = false;
    });

    /* runs */
    b.addCase(fetchRuns.fulfilled, (s, a) => { s.runs = a.payload; s.loading = false; });
    b.addCase(fetchRunById.fulfilled, (s, a) => { s.selectedRun = a.payload; s.loading = false; });

    b.addCase(createRun.fulfilled, (s, a) => {
      s.runs = upsert(s.runs, a.payload);
      s.success = "Run queued."; s.loading = false;
    });
    b.addCase(deleteRun.fulfilled, (s, a) => {
      s.runs = s.runs.filter(r => r._id !== a.payload.id);
      if (s.selectedRun?._id === a.payload.id) s.selectedRun = null;
      s.success = "Run deleted."; s.loading = false;
    });

    /* pending / error */
    b.addMatcher(ac => ac.type.startsWith("reports/") && ac.type.endsWith("/pending"),
      (s) => { s.loading = true; s.error = null; s.success = null; });
    b.addMatcher(ac => ac.type.startsWith("reports/") && ac.type.endsWith("/rejected"),
      (s: any, ac: any) => { s.loading = false; s.error = ac.payload || "Operation failed"; });
  }
});

export const { clearReportsMsgs, setSelectedDefinition, setSelectedRun } = slice.actions;
export default slice.reducer;

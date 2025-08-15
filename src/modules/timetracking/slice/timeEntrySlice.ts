import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ITimeEntry, TimeEntryAdminFilters, Paginated } from "../types";

const API_BASE = "/timetracking"; // BE admin router ile hizalı

const takeData = <T,>(r: any, fb: T) => (r?.data ?? fb) as T;

// undefined/null alanları at — BE doğrulamalarını sadeleştirir
const prune = (obj: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    out[k] = v;
  }
  return out;
};

// BE transformNestedFields ile uyumlu: nested alanları string’e çevir
const stringifyNested = (payload: Record<string, any>) => {
  const nestedKeys = [
    "geoIn",
    "geoOut",
    "deviceIn",
    "deviceOut",
    "breaks",
    "approvals",
    "payCode",
    "rounding",
  ];
  const out: Record<string, any> = { ...payload };
  for (const k of nestedKeys) {
    if (out[k] !== undefined) {
      out[k] = typeof out[k] === "string" ? out[k] : JSON.stringify(out[k]);
    }
  }
  return out;
};

interface State {
  list: ITimeEntry[];
  meta?: Paginated<ITimeEntry>["meta"];
  selected: ITimeEntry | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}
const initialState: State = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  success: null,
};

export const fetchTimeEntries = createAsyncThunk<
  Paginated<ITimeEntry>,
  TimeEntryAdminFilters | void,
  { rejectValue: string }
>("timetracking/fetchAll", async (filters, api) => {
  try {
    const r = await apiCall("get", API_BASE, filters as any);
    return { items: takeData<ITimeEntry[]>(r, []), meta: r?.meta };
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Fetch failed");
  }
});

export const fetchTimeEntryById = createAsyncThunk<
  ITimeEntry,
  string,
  { rejectValue: string }
>("timetracking/fetchById", async (id, api) => {
  try {
    const r = await apiCall("get", `${API_BASE}/${id}`);
    return takeData<ITimeEntry>(r, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Fetch failed");
  }
});

export const createTimeEntry = createAsyncThunk<
  ITimeEntry,
  { data: Partial<ITimeEntry> },
  { rejectValue: string }
>("timetracking/create", async ({ data }, api) => {
  try {
    // Sadece tanımlı alanlar + nested stringify
    const payload = stringifyNested(prune({ ...data }));
    const r = await apiCall("post", API_BASE, payload);
    return takeData<ITimeEntry>(r, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Create failed");
  }
});

export const updateTimeEntry = createAsyncThunk<
  ITimeEntry,
  { id: string; data: Partial<ITimeEntry> },
  { rejectValue: string }
>("timetracking/update", async ({ id, data }, api) => {
  try {
    const payload = stringifyNested(prune({ ...data }));
    const r = await apiCall("put", `${API_BASE}/${id}`, payload);
    return takeData<ITimeEntry>(r, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Update failed");
  }
});

export const deleteTimeEntry = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("timetracking/delete", async (id, api) => {
  try {
    await apiCall("delete", `${API_BASE}/${id}`);
    return { id };
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Delete failed");
  }
});

const slice = createSlice({
  name: "timetracking",
  initialState,
  reducers: {
    clearTTMsgs: (s) => {
      s.error = null;
      s.success = null;
    },
    setSelectedTE: (s, a: PayloadAction<ITimeEntry | null>) => {
      s.selected = a.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchTimeEntries.fulfilled, (s, a) => {
      s.list = a.payload.items;
      s.meta = a.payload.meta;
      s.loading = false;
    });
    b.addCase(fetchTimeEntryById.fulfilled, (s, a) => {
      s.selected = a.payload;
      s.loading = false;
    });
    b.addCase(createTimeEntry.fulfilled, (s, a) => {
      if (a.payload?._id) s.list.unshift(a.payload);
      s.success = "Time entry created.";
      s.loading = false;
    });
    b.addCase(updateTimeEntry.fulfilled, (s, a) => {
      const i = s.list.findIndex((x) => x._id === a.payload._id);
      if (i !== -1) s.list[i] = a.payload;
      if (s.selected?._id === a.payload._id) s.selected = a.payload;
      s.success = "Time entry updated.";
      s.loading = false;
    });
    b.addCase(deleteTimeEntry.fulfilled, (s, a) => {
      s.list = s.list.filter((x) => x._id !== a.payload.id);
      if (s.selected?._id === a.payload.id) s.selected = null;
      s.success = "Time entry deleted.";
      s.loading = false;
    });
    b.addMatcher(
      (ac) => ac.type.startsWith("timetracking/") && ac.type.endsWith("/pending"),
      (s) => {
        s.loading = true;
        s.error = null;
        s.success = null;
      }
    );
    b.addMatcher(
      (ac: any) => ac.type.startsWith("timetracking/") && ac.type.endsWith("/rejected"),
      (s: any, ac: any) => {
        s.loading = false;
        s.error = ac.payload || "Operation failed";
      }
    );
  },
});

export const { clearTTMsgs, setSelectedTE } = slice.actions;
export default slice.reducer;

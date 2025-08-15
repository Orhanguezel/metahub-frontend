import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IOperationJob, JobsAdminFilters, JobsListMeta } from "../types";

/* -------------------- helpers -------------------- */
/** Slice standardı: apiCall payload'ı doğrudan döndürür. (res.data YOK) */
const pickData = <T,>(res: any, fallback: T): T =>
  res && typeof res === "object" && "data" in res ? (res.data as T) : ((res as T) ?? fallback);

/** string id çıkarıcı */
const idOr = (v: any): string | undefined =>
  typeof v === "string" ? v : (v && typeof v === "object" && typeof v._id === "string" ? v._id : undefined);

/** FE→BE: populate gelmiş referansları string id’ye indirger, salt-okunur alanları atar */
function normalizeJobPayload(patch: Partial<IOperationJob>): Record<string, any> {
  const p: Record<string, any> = { ...patch };

  // üst seviye referanslar
  if (p.apartmentRef) p.apartmentRef = idOr(p.apartmentRef);
  if (p.categoryRef) p.categoryRef = idOr(p.categoryRef);
  if (p.serviceRef) p.serviceRef = idOr(p.serviceRef as any);
  if (p.contractRef) p.contractRef = idOr(p.contractRef as any);

  // nested: assignments[].employeeRef
  if (Array.isArray(p.assignments)) {
    p.assignments = p.assignments.map((a: any) => ({
      ...a,
      employeeRef: idOr(a?.employeeRef ?? a?.employee) ?? a?.employeeRef ?? a?.employee,
      // timeEntryRefs zaten string[] olabilir — dokunma
    }));
  }

  // salt okunur / BE hesaplayacağı alanlar
  delete p._id;
  delete p.tenant;
  delete p.createdAt;
  delete p.updatedAt;
  delete p.onTime;

  return p;
}

/* -------------------- state -------------------- */
interface OpsJobsState {
  items: IOperationJob[];
  meta: JobsListMeta | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  selected: IOperationJob | null;
}
const initialState: OpsJobsState = {
  items: [],
  meta: null,
  loading: false,
  error: null,
  successMessage: null,
  selected: null,
};

/* -------------------- thunks -------------------- */
const BASE = "/operationsjobs";

/** LIST */
export const fetchAllOpsJobsAdmin = createAsyncThunk<
  { items: IOperationJob[]; meta: JobsListMeta | null },
  JobsAdminFilters | void,
  { rejectValue: string }
>("opsjobs/fetchAllAdmin", async (filters, thunkAPI) => {
  try {
    const params = {
      limit: filters?.limit ?? 20,
      page: filters?.page ?? 1,
      ...filters,
    };
    const res = await apiCall("get", BASE, params);
    // hem [] hem {data,meta} formatını destekle
    const body = res as any;
    const items: IOperationJob[] = Array.isArray(body) ? (body as IOperationJob[]) : pickData<IOperationJob[]>(body, []) ?? [];
    const meta: JobsListMeta | null = Array.isArray(body) ? null : (body?.meta ?? null);
    return { items, meta };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Fetch failed");
  }
});

/** GET BY ID */
export const fetchOpsJobById = createAsyncThunk<
  IOperationJob,
  string,
  { rejectValue: string }
>("opsjobs/fetchById", async (id, thunkAPI) => {
  try {
    const res = await apiCall("get", `${BASE}/${id}`);
    return pickData<IOperationJob>(res, {} as IOperationJob);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Fetch by id failed");
  }
});

/** CREATE */
export const createOpsJob = createAsyncThunk<
  IOperationJob,
  Partial<IOperationJob>,
  { rejectValue: string }
>("opsjobs/create", async (payload, thunkAPI) => {
  try {
    const res = await apiCall("post", BASE, normalizeJobPayload(payload));
    return pickData<IOperationJob>(res, {} as IOperationJob);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Create failed");
  }
});

/** UPDATE */
export const updateOpsJob = createAsyncThunk<
  IOperationJob,
  { id: string; changes: Partial<IOperationJob> },
  { rejectValue: string }
>("opsjobs/update", async ({ id, changes }, thunkAPI) => {
  try {
    const res = await apiCall("put", `${BASE}/${id}`, normalizeJobPayload(changes));
    return pickData<IOperationJob>(res, {} as IOperationJob);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Update failed");
  }
});

/** DELETE */
export const deleteOpsJob = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("opsjobs/delete", async (id, thunkAPI) => {
  try {
    await apiCall("delete", `${BASE}/${id}`);
    return { id };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Delete failed");
  }
});

/* -------------------- slice -------------------- */
const slice = createSlice({
  name: "opsjobs",
  initialState,
  reducers: {
    clearOpsJobsMessages: (s) => {
      s.error = null;
      s.successMessage = null;
    },
    setSelectedOpsJob: (s, a: PayloadAction<IOperationJob | null>) => {
      s.selected = a.payload;
    },
  },
  extraReducers: (b) => {
    // list
    b.addCase(fetchAllOpsJobsAdmin.fulfilled, (s, a) => {
      s.items = a.payload.items ?? [];
      s.meta = a.payload.meta;
      s.loading = false;
      s.error = null;
    });

    // fetch by id
    b.addCase(fetchOpsJobById.fulfilled, (s, a) => {
      s.selected = a.payload ?? null;
      s.loading = false;
      s.error = null;
    });

    // create
    b.addCase(createOpsJob.fulfilled, (s, a) => {
      if (a.payload?._id) s.items.unshift(a.payload);
      s.successMessage = "created";
      s.loading = false;
    });

    // update
    b.addCase(updateOpsJob.fulfilled, (s, a) => {
      const i = s.items.findIndex((x) => x._id === a.payload._id);
      if (i !== -1) s.items[i] = a.payload;
      s.successMessage = "updated";
      s.loading = false;
      if (s.selected?._id === a.payload._id) s.selected = a.payload;
    });

    // delete
    b.addCase(deleteOpsJob.fulfilled, (s, a) => {
      s.items = s.items.filter((x) => x._id !== a.payload.id);
      s.successMessage = "deleted";
      s.loading = false;
      if (s.selected?._id === a.payload.id) s.selected = null;
    });

    // pending / rejected matcher’lar
    b.addMatcher(
      (ac) => ac.type.startsWith("opsjobs/") && ac.type.endsWith("/pending"),
      (s) => {
        s.loading = true;
        s.error = null;
        s.successMessage = null;
      }
    );
    b.addMatcher(
      (ac: any) => ac.type.startsWith("opsjobs/") && ac.type.endsWith("/rejected"),
      (s, ac: any) => {
        s.loading = false;
        s.error = ac.payload || "Operation failed";
      }
    );
  },
});

export const { clearOpsJobsMessages, setSelectedOpsJob } = slice.actions;
export default slice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IBillingPlan,
  IBillingOccurrence,
  PlanListFilters,
  OccurrenceListFilters,
  BillingPlanStatus,
} from "../types";

/* ===== State ===== */
type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface BillingState {
  plans: IBillingPlan[];
  occurrences: IBillingOccurrence[];

  selectedPlan: IBillingPlan | null;
  selectedOccurrence: IBillingOccurrence | null;

  status: StatusType;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BillingState = {
  plans: [],
  occurrences: [],
  selectedPlan: null,
  selectedOccurrence: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

/* ===== Helpers ===== */
const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in (payload as any)) {
    const msg = (payload as any).message;
    if (typeof msg === "string") return msg;
  }
  return "An error occurred.";
};

const qs = (o: Record<string, any>) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

const BASE = "/billing";

/* ===== Thunks: Plans ===== */
export const fetchBillingPlans = createAsyncThunk<
  IBillingPlan[],
  PlanListFilters | void,
  { rejectValue: string }
>("billing/fetchPlans", async (filters, { rejectWithValue }) => {
  try {
    const url = filters ? `${BASE}/plans?${qs(filters)}` : `${BASE}/plans`;
    const res = await apiCall("get", url);
    return res.data as IBillingPlan[];
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to fetch plans.");
  }
});

export const fetchPlanById = createAsyncThunk<
  IBillingPlan,
  string,
  { rejectValue: string }
>("billing/fetchPlanById", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", `${BASE}/plans/${id}`);
    return res.data as IBillingPlan;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to fetch plan.");
  }
});

export const createPlan = createAsyncThunk<
  { success?: boolean; message?: string; data?: IBillingPlan } & Record<string, any>,
  Partial<IBillingPlan>,
  { rejectValue: string }
>("billing/createPlan", async (payload, { rejectWithValue }) => {
  try {
    // Backend validasyonuyla uyumlu gövde
    const body: any = {
      code: payload.code,
      source: payload.source,
      schedule: payload.schedule,
      status: payload.status,
      notes: payload.notes,
      revisions: payload.revisions,
    };
    const res = await apiCall("post", `${BASE}/plans`, body);
    return res;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to create plan.");
  }
});

export const updatePlan = createAsyncThunk<
  { success?: boolean; message?: string; data?: IBillingPlan } & Record<string, any>,
  { id: string; changes: Partial<IBillingPlan> },
  { rejectValue: string }
>("billing/updatePlan", async ({ id, changes }, { rejectWithValue }) => {
  try {
    // Sadece backend’in izin verdiği alanlar
    const body: any = {
      code: changes.code,
      source: changes.source,
      schedule: changes.schedule,
      status: changes.status,
      notes: changes.notes,
      revisions: changes.revisions,
      lastRunAt: changes.lastRunAt,
      nextDueAt: changes.nextDueAt,
    };
    const res = await apiCall("put", `${BASE}/plans/${id}`, body);
    return res;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to update plan.");
  }
});

export const changePlanStatus = createAsyncThunk<
  { success?: boolean; message?: string; data?: IBillingPlan } & Record<string, any>,
  { id: string; status: BillingPlanStatus },
  { rejectValue: string }
>("billing/changePlanStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await apiCall("patch", `${BASE}/plans/${id}/status`, { status });
    return res;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to change status.");
  }
});

export const deletePlan = createAsyncThunk<
  { id: string; message?: string },
  string,
  { rejectValue: string }
>("billing/deletePlan", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("delete", `${BASE}/plans/${id}`);
    return { id, message: res?.message as string | undefined };
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to delete plan.");
  }
});

/* ===== Thunks: Occurrences ===== */
export const fetchOccurrences = createAsyncThunk<
  IBillingOccurrence[],
  OccurrenceListFilters | void,
  { rejectValue: string }
>("billing/fetchOccurrences", async (filters, { rejectWithValue }) => {
  try {
    const url = filters ? `${BASE}/occurrences?${qs(filters)}` : `${BASE}/occurrences`;
    const res = await apiCall("get", url);
    return res.data as IBillingOccurrence[];
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to fetch occurrences.");
  }
});

export const fetchOccurrenceById = createAsyncThunk<
  IBillingOccurrence,
  string,
  { rejectValue: string }
>("billing/fetchOccurrenceById", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", `${BASE}/occurrences/${id}`);
    return res.data as IBillingOccurrence;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to fetch occurrence.");
  }
});

export const createOccurrence = createAsyncThunk<
  { success?: boolean; message?: string; data?: IBillingOccurrence } & Record<string, any>,
  Partial<IBillingOccurrence>,
  { rejectValue: string }
>("billing/createOccurrence", async (payload, { rejectWithValue }) => {
  try {
    // Backend validasyonuna uygun gövde
    const body: any = {
      plan: typeof payload.plan === "string" ? payload.plan : payload.plan?._id,
      windowStart: payload.windowStart,
      windowEnd: payload.windowEnd,
      dueAt: payload.dueAt,
      amount: payload.amount,
      currency: payload.currency,
      status: payload.status,
      invoice: payload.invoice,
      seq: payload.seq,
      notes: payload.notes,
    };
    const res = await apiCall("post", `${BASE}/occurrences`, body);
    return res;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to create occurrence.");
  }
});

export const updateOccurrence = createAsyncThunk<
  { success?: boolean; message?: string; data?: IBillingOccurrence } & Record<string, any>,
  { id: string; changes: Partial<IBillingOccurrence> },
  { rejectValue: string }
>("billing/updateOccurrence", async ({ id, changes }, { rejectWithValue }) => {
  try {
    // Sadece izinli alanlar
    const body: any = {
      windowStart: changes.windowStart,
      windowEnd: changes.windowEnd,
      dueAt: changes.dueAt,
      amount: changes.amount,
      currency: changes.currency,
      status: changes.status,
      invoice: changes.invoice,
      seq: changes.seq,
      notes: changes.notes,
      // plan değişimi normalde yapılmaz ama backend optional olarak koruyor
      plan: typeof changes.plan === "string" ? changes.plan : (changes.plan as any)?._id,
    };
    const res = await apiCall("patch", `${BASE}/occurrences/${id}`, body);
    return res;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to update occurrence.");
  }
});

export const deleteOccurrence = createAsyncThunk<
  { id: string; message?: string },
  string,
  { rejectValue: string }
>("billing/deleteOccurrence", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("delete", `${BASE}/occurrences/${id}`);
    return { id, message: res?.message as string | undefined };
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to delete occurrence.");
  }
});

/* ===== Slice ===== */
const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    clearBillingMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    setSelectedPlan(state, action: PayloadAction<IBillingPlan | null>) {
      state.selectedPlan = action.payload;
    },
    setSelectedOccurrence(state, action: PayloadAction<IBillingOccurrence | null>) {
      state.selectedOccurrence = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: BillingState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
      state.successMessage = null;
    };
    const setError = (state: BillingState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
      state.successMessage = null;
    };

    /* ---- Plans ---- */
    builder
      .addCase(fetchBillingPlans.pending, startLoading)
      .addCase(fetchBillingPlans.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        s.plans = a.payload;
      })
      .addCase(fetchBillingPlans.rejected, setError)

      .addCase(fetchPlanById.pending, startLoading)
      .addCase(fetchPlanById.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        s.selectedPlan = a.payload;
      })
      .addCase(fetchPlanById.rejected, setError)

      .addCase(createPlan.pending, startLoading)
      .addCase(createPlan.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        const created = a.payload?.data as IBillingPlan | undefined;
        if (created) s.plans.unshift(created);
        s.successMessage = a.payload?.message || null;
      })
      .addCase(createPlan.rejected, setError)

      .addCase(updatePlan.pending, startLoading)
      .addCase(updatePlan.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        const updated = (a.payload?.data || a.payload) as IBillingPlan;
        s.plans = s.plans.map(p => (String(p._id) === String(updated._id) ? updated : p));
        if (s.selectedPlan && String(s.selectedPlan._id) === String(updated._id)) {
          s.selectedPlan = updated;
        }
        s.successMessage = a.payload?.message || null;
      })
      .addCase(updatePlan.rejected, setError)

      .addCase(changePlanStatus.fulfilled, (s, a) => {
        const updated = (a.payload?.data || a.payload) as IBillingPlan;
        s.plans = s.plans.map(p => (String(p._id) === String(updated._id) ? updated : p));
        if (s.selectedPlan && String(s.selectedPlan._id) === String(updated._id)) {
          s.selectedPlan = updated;
        }
        s.successMessage = a.payload?.message || "Plan status changed.";
      })
      .addCase(changePlanStatus.rejected, setError)

      .addCase(deletePlan.pending, startLoading)
      .addCase(deletePlan.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        s.plans = s.plans.filter(p => String(p._id) !== String(a.payload.id));
        if (s.selectedPlan && String(s.selectedPlan._id) === String(a.payload.id)) {
          s.selectedPlan = null;
        }
        s.successMessage = a.payload?.message || null;
      })
      .addCase(deletePlan.rejected, setError);

    /* ---- Occurrences ---- */
    builder
      .addCase(fetchOccurrences.pending, startLoading)
      .addCase(fetchOccurrences.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        s.occurrences = a.payload;
      })
      .addCase(fetchOccurrences.rejected, setError)

      .addCase(fetchOccurrenceById.pending, startLoading)
      .addCase(fetchOccurrenceById.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        s.selectedOccurrence = a.payload;
      })
      .addCase(fetchOccurrenceById.rejected, setError)

      .addCase(createOccurrence.pending, startLoading)
      .addCase(createOccurrence.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        const created = a.payload?.data as IBillingOccurrence | undefined;
        if (created) s.occurrences.unshift(created);
        s.successMessage = a.payload?.message || null;
      })
      .addCase(createOccurrence.rejected, setError)

      .addCase(updateOccurrence.pending, startLoading)
      .addCase(updateOccurrence.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        const updated = (a.payload?.data || a.payload) as IBillingOccurrence;
        s.occurrences = s.occurrences.map(o => (String(o._id) === String(updated._id) ? updated : o));
        if (s.selectedOccurrence && String(s.selectedOccurrence._id) === String(updated._id)) {
          s.selectedOccurrence = updated;
        }
        s.successMessage = a.payload?.message || null;
      })
      .addCase(updateOccurrence.rejected, setError)

      .addCase(deleteOccurrence.pending, startLoading)
      .addCase(deleteOccurrence.fulfilled, (s, a) => {
        s.loading = false; s.status = "succeeded";
        s.occurrences = s.occurrences.filter(o => String(o._id) !== String(a.payload.id));
        if (s.selectedOccurrence && String(s.selectedOccurrence._id) === String(a.payload.id)) {
          s.selectedOccurrence = null;
        }
        s.successMessage = a.payload?.message || null;
      })
      .addCase(deleteOccurrence.rejected, setError);
  },
});

export const {
  clearBillingMessages,
  setSelectedPlan,
  setSelectedOccurrence,
} = billingSlice.actions;

export default billingSlice.reducer;

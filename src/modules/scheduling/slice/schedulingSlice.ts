import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ISchedulePlan, PlanAdminFilters } from "../types";
import { normalizePlanPayload } from "../types";

/** Backend admin rotası */
const BASE = "/scheduling";

/** upsert yardımcıları */
const upsert = <T extends { _id?: string }>(arr: T[], item: T) => {
  if (!item?._id) return arr;
  const i = arr.findIndex(x => x._id === item._id);
  if (i === -1) return [item, ...arr];
  const next = arr.slice();
  next[i] = item;
  return next;
};
const upsertMany = <T extends { _id?: string }>(arr: T[], items: T[]) => {
  let next = arr.slice();
  for (const it of items) next = upsert(next, it);
  return next;
};

/** Slice state (status/loading/error/success pattern’iyle) */
interface State {
  plans: ISchedulePlan[];
  selected: ISchedulePlan | null;
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successKey: string | null; // i18n key; UI'de translate edilecek
}
const initialState: State = {
  plans: [],
  selected: null,
  loading: false,
  status: "idle",
  error: null,
  successKey: null,
};

/** NOT: Parent’ta toplu fetch varsa, hydrate ile state’i dolduracağız. */
export const hydratePlans = createAsyncThunk<ISchedulePlan[], ISchedulePlan[]>(
  "scheduling/hydratePlans",
  async (items) => items
);

/** Admin liste */
export const fetchPlans = createAsyncThunk<ISchedulePlan[], PlanAdminFilters | void, { rejectValue: string }>(
  "scheduling/fetchPlans",
  async (filters, api) => {
    try {
      // apiCall projemizde doğrudan payload döndürüyor (res.data değil)
      const r = await apiCall("get", BASE, filters as any);
      return (r as any)?.data ?? (r as ISchedulePlan[]);
    } catch (e: any) {
      return api.rejectWithValue(e?.data?.message ?? e?.message ?? "scheduling.errors.fetchFailed");
    }
  }
);

/** Detail */
export const fetchPlanById = createAsyncThunk<ISchedulePlan, string, { rejectValue: string }>(
  "scheduling/fetchPlanById",
  async (id, api) => {
    try {
      const r = await apiCall("get", `${BASE}/${id}`);
      return (r as any)?.data ?? (r as ISchedulePlan);
    } catch (e: any) {
      return api.rejectWithValue(e?.data?.message ?? e?.message ?? "scheduling.errors.fetchFailed");
    }
  }
);

/** Create */
export const createPlan = createAsyncThunk<ISchedulePlan, Partial<ISchedulePlan>, { rejectValue: string }>(
  "scheduling/createPlan",
  async (payload, api) => {
    try {
      const r = await apiCall("post", BASE, normalizePlanPayload(payload));
      return (r as any)?.data ?? (r as ISchedulePlan);
    } catch (e: any) {
      return api.rejectWithValue(e?.data?.message ?? e?.message ?? "scheduling.errors.createFailed");
    }
  }
);

/** Update */
export const updatePlan = createAsyncThunk<
  ISchedulePlan,
  { id: string; changes: Partial<ISchedulePlan> },
  { rejectValue: string }
>(
  "scheduling/updatePlan",
  async ({ id, changes }, api) => {
    try {
      const r = await apiCall("put", `${BASE}/${id}`, normalizePlanPayload(changes));
      return (r as any)?.data ?? (r as ISchedulePlan);
    } catch (e: any) {
      return api.rejectWithValue(e?.data?.message ?? e?.message ?? "scheduling.errors.updateFailed");
    }
  }
);

/** Delete */
export const deletePlan = createAsyncThunk<{ id: string }, string, { rejectValue: string }>(
  "scheduling/deletePlan",
  async (id, api) => {
    try {
      await apiCall("delete", `${BASE}/${id}`);
      return { id };
    } catch (e: any) {
      return api.rejectWithValue(e?.data?.message ?? e?.message ?? "scheduling.errors.deleteFailed");
    }
  }
);

const slice = createSlice({
  name: "scheduling",
  initialState,
  reducers: {
    clearSchedulingMsgs: (s) => { s.error = null; s.successKey = null; },
    setSelectedPlan: (s, a: PayloadAction<ISchedulePlan | null>) => { s.selected = a.payload; },
    /** Parent'tan gelen toplu set (fetch kullanmıyoruz senaryosu) */
    setPlansFromParent: (s, a: PayloadAction<ISchedulePlan[]>) => {
      s.plans = a.payload ?? [];
      s.status = "succeeded";
      s.loading = false;
      s.error = null;
    },
  },
  extraReducers: (b) => {
    // hydrate (parent provided)
    b.addCase(hydratePlans.fulfilled, (s, a) => {
      s.plans = upsertMany([], a.payload);
      s.status = "succeeded"; s.loading = false; s.error = null;
    });

    // fetch list/detail
    b.addCase(fetchPlans.fulfilled, (s, a) => {
      s.plans = a.payload;
      s.loading = false; s.status = "succeeded";
    });
    b.addCase(fetchPlanById.fulfilled, (s, a) => {
      s.selected = a.payload;
      s.loading = false; s.status = "succeeded";
    });

    // create/update/delete
    b.addCase(createPlan.fulfilled, (s, a) => {
      if (a.payload?._id) s.plans = upsert(s.plans, a.payload);
      s.successKey = "scheduling.messages.created";
      s.loading = false; s.status = "succeeded";
    });
    b.addCase(updatePlan.fulfilled, (s, a) => {
      s.plans = upsert(s.plans, a.payload);
      if (s.selected?._id === a.payload._id) s.selected = a.payload;
      s.successKey = "scheduling.messages.updated";
      s.loading = false; s.status = "succeeded";
    });
    b.addCase(deletePlan.fulfilled, (s, a) => {
      s.plans = s.plans.filter(p => p._id !== a.payload.id);
      if (s.selected?._id === a.payload.id) s.selected = null;
      s.successKey = "scheduling.messages.deleted";
      s.loading = false; s.status = "succeeded";
    });

    // pending/rejected ortak
    b.addMatcher(
      (ac) => ac.type.startsWith("scheduling/") && ac.type.endsWith("/pending"),
      (s) => { s.loading = true; s.status = "loading"; s.error = null; s.successKey = null; }
    );
    b.addMatcher(
      (ac) => ac.type.startsWith("scheduling/") && ac.type.endsWith("/rejected"),
      (s: any, ac: any) => { s.loading = false; s.status = "failed"; s.error = ac.payload || "scheduling.errors.operationFailed"; }
    );
  }
});

export const { clearSchedulingMsgs, setSelectedPlan, setPlansFromParent } = slice.actions;
export default slice.reducer;

/* --------- Selectors (UI için) --------- */
export const selectSchedulingState = (s: any) => s.scheduling as State;
export const selectSchedulingPlans = (s: any) => (s.scheduling as State).plans;
export const selectSchedulingById = (id?: string) => (s: any) =>
  (s.scheduling as State).plans.find(p => p._id === id) || null;
export const selectSchedulingLoading = (s: any) => (s.scheduling as State).loading;
export const selectSchedulingStatus = (s: any) => (s.scheduling as State).status;
export const selectSchedulingError = (s: any) => (s.scheduling as State).error;
export const selectSchedulingSuccessKey = (s: any) => (s.scheduling as State).successKey;

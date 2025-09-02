// src/modules/reactions/slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  ReactionKind,
  ReactionTargetType,
  IReactionDTO,
  IMyReactionItem,
  IReactionSummaryMap,
  IRatingSummaryMap,
  ApiListResponse,
  ApiItemResponse,
  ApiMapResponse,
} from "../types";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */
const BASE = "/reactions";
const DEFAULT_TARGET_TYPE: ReactionTargetType = "menuitem";

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */
interface ReactionsState {
  // 🌐 Public
  my: IMyReactionItem[];
  summary: Record<string, { total: number; byKind?: any; byEmoji?: any }>;
  ratings: IRatingSummaryMap;
  // only non-RATING keys
  toggles: Record<string, boolean>;

  // 🔐 Admin
  adminList: IReactionDTO[];

  // Common flags
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;

  lastRated?: { targetId: string; value: number } | null;
}

const initialState: ReactionsState = {
  my: [],
  summary: {},
  ratings: {},
  toggles: {},
  adminList: [],
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
  lastRated: null,
};

/* ------------------------------------------------------------------ */
/* Utils                                                               */
/* ------------------------------------------------------------------ */
const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in (payload as any)) {
    const m = (payload as any).message;
    if (typeof m === "string") return m;
  }
  return "An error occurred.";
};

// toggles sadece non-RATING için tutulur
type NonRatingKind = Exclude<ReactionKind, "RATING">;

const tk = (targetId: string, kind: NonRatingKind, emoji?: string | null) =>
  `t:${targetId}|k:${kind}|e:${emoji || ""}`;

// 401 guest algısı
const isAuth401 = (err: any) => {
  const s =
    err?.status ||
    err?.response?.status ||
    err?.payload?.status ||
    err?.data?.status;
  return Number(s) === 401;
};

/* ================================================================== */
/* 🌐 PUBLIC THUNKS                                                    */
/* ================================================================== */

/** PARAMETRESİZ: login kullanıcının MENUITEM reaksiyonları
 *  🔇 401 => guest → [] ile fulfilled
 */
export const fetchMyMenuitemReactions = createAsyncThunk<IMyReactionItem[]>(
  "reactions/fetchMyMenuitemReactions",
  async (_, thunkAPI) => {
    try {
      // ❗ rejectWithValue göndermiyoruz → hata throw edilsin
      const res = (await apiCall(
        "get",
        `${BASE}/me`,
        { targetType: DEFAULT_TARGET_TYPE }
      )) as ApiItemResponse<IMyReactionItem[]>;
      const data = (res?.data as unknown as IMyReactionItem[]) || [];
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      if (isAuth401(err)) {
        // guest modunda boş liste
        return [];
      }
      const message =
        err?.message ||
        err?.data?.message ||
        "reactions.errors.fetchFailed";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

/** GENEL: gerektiğinde farklı targetType için (geri uyum)
 *  🔇 401 => guest → [] ile fulfilled
 */
export const fetchMyReactions = createAsyncThunk<
  IMyReactionItem[],
  | void
  | { targetType?: ReactionTargetType; targetIds?: string[] }
>(
  "reactions/fetchMine",
  async (arg, thunkAPI) => {
    const targetType = (arg && (arg as any).targetType) || DEFAULT_TARGET_TYPE;
    const targetIds = (arg && (arg as any).targetIds) as string[] | undefined;

    const params: any = { targetType };
    if (targetIds?.length) params.targetIds = targetIds.join(",");

    try {
      const res = (await apiCall("get", `${BASE}/me`, params)) as ApiItemResponse<
        IMyReactionItem[]
      >;
      const data = (res?.data as unknown as IMyReactionItem[]) || [];
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      if (isAuth401(err)) {
        return [];
      }
      const message =
        err?.message ||
        err?.data?.message ||
        "reactions.errors.fetchFailed";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

// Toggle / Set / Rate — public aksiyonlar
export const toggleReaction = createAsyncThunk<
  { targetId: string; kind: NonRatingKind; emoji?: string | null; on: boolean; message: string },
  { targetType: ReactionTargetType; targetId: string; kind: NonRatingKind; emoji?: string | null; extra?: Record<string, unknown> }
>(
  "reactions/toggle",
  async (payload, thunkAPI) => {
    try {
      const res = (await apiCall(
        "post",
        `${BASE}/toggle`,
        payload
      )) as ApiItemResponse<{ on: boolean }>;

      return {
        targetId: payload.targetId,
        kind: payload.kind,
        emoji: payload.emoji,
        on: !!res?.data?.on,
        message: res?.message,
      };
    } catch (err: any) {
      const message =
        err?.message ||
        err?.data?.message ||
        "reactions.errors.toggleFailed";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

export const setReaction = createAsyncThunk<
  { targetId: string; kind: NonRatingKind; emoji?: string | null; on: boolean; message: string },
  { targetType: ReactionTargetType; targetId: string; kind: NonRatingKind; on: boolean; emoji?: string | null; extra?: Record<string, unknown> }
>(
  "reactions/set",
  async (payload, thunkAPI) => {
    try {
      const res = (await apiCall(
        "post",
        `${BASE}/set`,
        payload
      )) as ApiItemResponse<{ on: boolean }>;

      return {
        targetId: payload.targetId,
        kind: payload.kind,
        emoji: payload.emoji,
        on: !!res?.data?.on,
        message: res?.message,
      };
    } catch (err: any) {
      const message =
        err?.message ||
        err?.data?.message ||
        "reactions.errors.setFailed";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

export const rateReaction = createAsyncThunk<
  { targetId: string; value: number; message: string },
  { targetType: ReactionTargetType; targetId: string; value: number; extra?: Record<string, unknown> }
>(
  "reactions/rate",
  async (payload, thunkAPI) => {
    try {
      const res = (await apiCall(
        "post",
        `${BASE}/rate`,
        payload
      )) as ApiItemResponse<{ value: number }>;
      return {
        targetId: payload.targetId,
        value: Number(res?.data?.value ?? payload.value),
        message: res?.message,
      };
    } catch (err: any) {
      const message =
        err?.message ||
        err?.data?.message ||
        "reactions.errors.rateFailed";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

// Summary/Ratings — (genelde public; 401 beklemiyoruz)
export const fetchReactionsSummary = createAsyncThunk<
  IReactionSummaryMap,
  { targetType: ReactionTargetType; targetId?: string; targetIds?: string[]; breakdown?: "none" | "kind" | "emoji" | "kind+emoji" }
>(
  "reactions/fetchSummary",
  async ({ targetType, targetId, targetIds, breakdown = "kind" }, thunkAPI) => {
    try {
      const params: any = { targetType, breakdown };
      if (targetId) params.targetId = targetId;
      if (targetIds?.length) params.targetIds = targetIds.join(",");

      const res = (await apiCall(
        "get",
        `${BASE}/summary`,
        params
      )) as ApiMapResponse<IReactionSummaryMap>;

      return res?.data || {};
    } catch (err: any) {
      const message =
        err?.message ||
        err?.data?.message ||
        "reactions.errors.summaryFailed";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

export const fetchRatingsSummary = createAsyncThunk<
  IRatingSummaryMap,
  { targetType: ReactionTargetType; targetId?: string; targetIds?: string[] }
>(
  "reactions/fetchRatingsSummary",
  async ({ targetType, targetId, targetIds }, thunkAPI) => {
    try {
      const params: any = { targetType };
      if (targetId) params.targetId = targetId;
      if (targetIds?.length) params.targetIds = targetIds.join(",");

      const res = (await apiCall(
        "get",
        `${BASE}/ratings/summary`,
        params
      )) as ApiMapResponse<IRatingSummaryMap>;

      return res?.data || {};
    } catch (err: any) {
      const message =
        err?.message ||
        err?.data?.message ||
        "reactions.errors.ratingsFailed";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

/* ================================================================== */
/* 🔐 ADMIN THUNKS                                                     */
/* ================================================================== */

export const adminListReactions = createAsyncThunk<
  IReactionDTO[],
  {
    user?: string;
    targetType?: ReactionTargetType;
    targetId?: string;
    kind?: ReactionKind;
    emoji?: string;
    value?: number;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }
>(
  "reactions/adminList",
  async (params, thunkAPI) => {
    try {
      const res = (await apiCall(
        "get",
        `${BASE}/admin`,
        params
      )) as ApiListResponse<IReactionDTO>;
      return res?.data || [];
    } catch (err: any) {
      const message =
        err?.message ||
        err?.data?.message ||
        "reactions.errors.adminListFailed";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

export const adminDeleteReaction = createAsyncThunk<
  { id: string; message: string },
  string
>(
  "reactions/adminDeleteById",
  async (id, thunkAPI) => {
    try {
      const res = (await apiCall(
        "delete",
        `${BASE}/admin/${id}`,
        null
      )) as { success: boolean; message: string };
      return { id, message: res?.message };
    } catch (err: any) {
      const message =
        err?.message ||
        err?.data?.message ||
        "reactions.errors.adminDeleteFailed";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

export const adminDeleteReactionsByFilter = createAsyncThunk<
  { deletedCount: number; message: string },
  { targetType: ReactionTargetType; targetId: string }
>(
  "reactions/adminDeleteByFilter",
  async (params, thunkAPI) => {
    try {
      const res = (await apiCall(
        "delete",
        `${BASE}/admin`,
        null,
        undefined,
        { params }
      )) as ApiItemResponse<{ deletedCount: number }>;
      return {
        deletedCount: Number(res?.data?.deletedCount ?? 0),
        message: res?.message,
      };
    } catch (err: any) {
      const message =
        err?.message ||
        err?.data?.message ||
        "reactions.errors.adminDeleteByFilterFailed";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

/* ------------------------------------------------------------------ */
/* Slice                                                               */
/* ------------------------------------------------------------------ */
const slice = createSlice({
  name: "reactions",
  initialState,
  reducers: {
    clearReactionsMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    resetReactionsState() {
      return initialState;
    },
    setLocalToggle(
      state,
      action: PayloadAction<{ targetId: string; kind: NonRatingKind; emoji?: string | null; on: boolean }>
    ) {
      const k = tk(action.payload.targetId, action.payload.kind, action.payload.emoji);
      state.toggles[k] = !!action.payload.on;
    },
  },
  extraReducers: (builder) => {
    const start = (s: ReactionsState) => {
      s.loading = true;
      s.status = "loading";
      s.error = null;
      s.successMessage = null;
    };
    const fail = (s: ReactionsState, a: PayloadAction<any>) => {
      s.loading = false;
      s.status = "failed";
      s.error = extractErrorMessage(a.payload);
    };

    /* ---------- PUBLIC ---------- */
    builder
      .addCase(fetchMyMenuitemReactions.pending, start)
      .addCase(fetchMyMenuitemReactions.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.my = a.payload || [];
        for (const r of s.my) {
          if (r.kind === "RATING") continue;
          const kind = r.kind as NonRatingKind;
          s.toggles[tk(r.targetId, kind, r.emoji)] = true;
        }
      })
      .addCase(fetchMyMenuitemReactions.rejected, fail);

    builder
      .addCase(fetchMyReactions.pending, start)
      .addCase(fetchMyReactions.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.my = a.payload || [];
        for (const r of s.my) {
          if (r.kind === "RATING") continue;
          const kind = r.kind as NonRatingKind;
          s.toggles[tk(r.targetId, kind, r.emoji)] = true;
        }
      })
      .addCase(fetchMyReactions.rejected, fail);

    builder
      .addCase(toggleReaction.pending, start)
      .addCase(toggleReaction.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const { targetId, kind, emoji, on, message } = a.payload;
        s.toggles[tk(targetId, kind, emoji)] = on;
        s.successMessage = message;
      })
      .addCase(toggleReaction.rejected, fail);

    builder
      .addCase(setReaction.pending, start)
      .addCase(setReaction.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const { targetId, kind, emoji, on, message } = a.payload;
        s.toggles[tk(targetId, kind, emoji)] = on;
        s.successMessage = message;
      })
      .addCase(setReaction.rejected, fail);

    builder
      .addCase(rateReaction.pending, start)
      .addCase(rateReaction.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.lastRated = { targetId: a.payload.targetId, value: a.payload.value };
        s.successMessage = a.payload.message;
      })
      .addCase(rateReaction.rejected, fail);

    builder
      .addCase(fetchReactionsSummary.pending, start)
      .addCase(fetchReactionsSummary.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.summary = { ...s.summary, ...(a.payload || {}) };
      })
      .addCase(fetchReactionsSummary.rejected, fail);

    builder
      .addCase(fetchRatingsSummary.pending, start)
      .addCase(fetchRatingsSummary.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.ratings = { ...s.ratings, ...(a.payload || {}) };
      })
      .addCase(fetchRatingsSummary.rejected, fail);

    /* ---------- ADMIN ---------- */
    builder
      .addCase(adminListReactions.pending, start)
      .addCase(adminListReactions.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.adminList = a.payload || [];
      })
      .addCase(adminListReactions.rejected, fail);

    builder
      .addCase(adminDeleteReaction.pending, start)
      .addCase(adminDeleteReaction.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.adminList = s.adminList.filter((x) => x._id !== a.payload.id);
        s.successMessage = a.payload.message;
      })
      .addCase(adminDeleteReaction.rejected, fail);

    builder
      .addCase(adminDeleteReactionsByFilter.pending, start)
      .addCase(adminDeleteReactionsByFilter.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.successMessage = `${a.payload.message} (${a.payload.deletedCount})`;
      })
      .addCase(adminDeleteReactionsByFilter.rejected, fail);
  },
});

export const {
  clearReactionsMessages,
  resetReactionsState,
  setLocalToggle,
} = slice.actions;

export default slice.reducer;

/* ------------------------------------------------------------------ */
/* Selectors                                                           */
/* ------------------------------------------------------------------ */
export const selectReactionOn = (
  state: { reactions: ReactionsState },
  targetId: string,
  kind: NonRatingKind,
  emoji?: string | null
) => !!state.reactions.toggles[tk(targetId, kind, emoji)];

export const selectSummaryByTarget = (
  state: { reactions: ReactionsState },
  targetId: string
) => state.reactions.summary[targetId];

export const selectRatingSummaryByTarget = (
  state: { reactions: ReactionsState },
  targetId: string
) => state.reactions.ratings[targetId];

export const selectMyReactions = (state: { reactions: ReactionsState }) =>
  state.reactions.my;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  ICashAccount,
  ICashEntry,
  AccountListFilters,
  EntryListFilters,
  ApiResp,
} from "../types";

const BASE = "/cashbook";

/* ----------------- State ----------------- */
interface CashbookState {
  accounts: ICashAccount[];
  accountDetail?: ICashAccount | null;

  entries: ICashEntry[];
  entryDetail?: ICashEntry | null;

  loading: boolean;
  error: string | null;
  message: string | null;

  selectedEntryIds: string[]; // for reconcile
}

const initialState: CashbookState = {
  accounts: [],
  entries: [],
  loading: false,
  error: null,
  message: null,
  selectedEntryIds: [],
};

/* ----------------- Utils ----------------- */
const extractError = (e: any, fallback: string) =>
  typeof e === "string"
    ? e
    : e?.message || e?.data?.message || fallback;

/** Querystring builder (undefined, null, "" değerleri atla) */
const qs = (o: Record<string, any>) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

/* ----------------- Accounts thunks ----------------- */
export const fetchAccounts = createAsyncThunk<
  ICashAccount[],
  AccountListFilters | void,
  { rejectValue: string }
>("cashbook/fetchAccounts", async (filters, { rejectWithValue }) => {
  try {
    // backend GET /cashbook/accounts?isActive=...
    const url = filters ? `${BASE}/accounts?${qs(filters)}` : `${BASE}/accounts`;
    const res = await apiCall("get", url, {}, rejectWithValue);
    // wrapper genellikle { success, message, data } döndürüyor
    return (res.data as ICashAccount[]) || [];
  } catch (e: any) {
    return rejectWithValue(extractError(e, "Failed to fetch accounts."));
  }
});

export const fetchAccountById = createAsyncThunk<
  ICashAccount,
  string,
  { rejectValue: string }
>("cashbook/fetchAccountById", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", `${BASE}/accounts/${id}`, {}, rejectWithValue);
    return (res.data as ICashAccount) as ICashAccount;
  } catch (e: any) {
    return rejectWithValue(extractError(e, "Failed to fetch account."));
  }
});

export const createAccount = createAsyncThunk<
  ApiResp<ICashAccount>,
  Partial<ICashAccount>,
  { rejectValue: string }
>("cashbook/createAccount", async (payload, { rejectWithValue }) => {
  try {
    // backend create: code,name,type,currency,openingBalance?,isActive?
    const body = {
      code: payload.code,
      name: payload.name,
      type: payload.type,
      currency: payload.currency,
      openingBalance: payload.openingBalance ?? 0,
      isActive: payload.isActive ?? true,
    };
    const res = await apiCall("post", `${BASE}/accounts`, body, rejectWithValue);
    return res as ApiResp<ICashAccount>;
  } catch (e: any) {
    return rejectWithValue(extractError(e, "Failed to create account."));
  }
});

export const updateAccount = createAsyncThunk<
  ApiResp<ICashAccount>,
  { id: string; changes: Partial<ICashAccount> },
  { rejectValue: string }
>("cashbook/updateAccount", async ({ id, changes }, { rejectWithValue }) => {
  try {
    // openingBalance değişmiyor; currency değişimi backend tarafından kısıtlı
    const body: Record<string, any> = {};
    if (changes.code !== undefined) body.code = changes.code;
    if (changes.name !== undefined) body.name = changes.name;
    if (changes.type !== undefined) body.type = changes.type;
    if (changes.currency !== undefined) body.currency = changes.currency;
    if (changes.isActive !== undefined) body.isActive = changes.isActive;

    const res = await apiCall("put", `${BASE}/accounts/${id}`, body, rejectWithValue);
    return res as ApiResp<ICashAccount>;
  } catch (e: any) {
    return rejectWithValue(extractError(e, "Failed to update account."));
  }
});

export const deleteAccount = createAsyncThunk<
  { id: string; message?: string },
  string,
  { rejectValue: string }
>("cashbook/deleteAccount", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("delete", `${BASE}/accounts/${id}`, {}, rejectWithValue);
    return { id, message: res?.message as string | undefined };
  } catch (e: any) {
    return rejectWithValue(extractError(e, "Failed to delete account."));
  }
});

/* ----------------- Entries thunks ----------------- */
export const fetchEntries = createAsyncThunk<
  ICashEntry[],
  EntryListFilters | void,
  { rejectValue: string }
>("cashbook/fetchEntries", async (filters, { rejectWithValue }) => {
  try {
    // backend GET /cashbook/entries?accountId&apartmentId&from&to&direction&category&reconciled
    const url = filters ? `${BASE}/entries?${qs(filters)}` : `${BASE}/entries`;
    const res = await apiCall("get", url, {}, rejectWithValue);
    return (res.data as ICashEntry[]) || [];
  } catch (e: any) {
    return rejectWithValue(extractError(e, "Failed to fetch entries."));
  }
});

export const fetchEntryById = createAsyncThunk<
  ICashEntry,
  string,
  { rejectValue: string }
>("cashbook/fetchEntryById", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", `${BASE}/entries/${id}`, {}, rejectWithValue);
    return (res.data as ICashEntry) as ICashEntry;
  } catch (e: any) {
    return rejectWithValue(extractError(e, "Failed to fetch entry."));
  }
});

export const createEntry = createAsyncThunk<
  ApiResp<ICashEntry>,
  Partial<ICashEntry>,
  { rejectValue: string }
>("cashbook/createEntry", async (payload, { rejectWithValue }) => {
  try {
    // currency backend tarafından account’tan set edilir; göndermiyoruz.
    const body = {
      accountId: payload.accountId,
      date: payload.date,
      direction: payload.direction,
      amount: payload.amount,
      description: payload.description,
      category: payload.category,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      apartmentId: payload.apartmentId,
      contractId: payload.contractId,
      invoiceId: payload.invoiceId,
      paymentId: payload.paymentId,
      expenseId: payload.expenseId,
      jobId: payload.jobId,
    };
    const res = await apiCall("post", `${BASE}/entries`, body, rejectWithValue);
    return res as ApiResp<ICashEntry>;
  } catch (e: any) {
    return rejectWithValue(extractError(e, "Failed to create entry."));
  }
});

export const updateEntry = createAsyncThunk<
  ApiResp<ICashEntry>,
  { id: string; changes: Partial<ICashEntry> },
  { rejectValue: string }
>("cashbook/updateEntry", async ({ id, changes }, { rejectWithValue }) => {
  try {
    // yalnız manual & unlocked alanları güncellenir (backend kontrol ediyor)
    const body: Record<string, any> = {};
    if (changes.date !== undefined) body.date = changes.date;
    if (changes.direction !== undefined) body.direction = changes.direction;
    if (changes.amount !== undefined) body.amount = changes.amount;
    if (changes.description !== undefined) body.description = changes.description;
    if (changes.category !== undefined) body.category = changes.category;
    if (changes.tags !== undefined) body.tags = Array.isArray(changes.tags) ? changes.tags : [];

    const res = await apiCall("put", `${BASE}/entries/${id}`, body, rejectWithValue);
    return res as ApiResp<ICashEntry>;
  } catch (e: any) {
    return rejectWithValue(extractError(e, "Failed to update entry."));
  }
});

export const deleteEntry = createAsyncThunk<
  { id: string; message?: string },
  string,
  { rejectValue: string }
>("cashbook/deleteEntry", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("delete", `${BASE}/entries/${id}`, {}, rejectWithValue);
    return { id, message: res?.message as string | undefined };
  } catch (e: any) {
    return rejectWithValue(extractError(e, "Failed to delete entry."));
  }
});

/* ----------------- Reconcile thunks ----------------- */
export const reconcile = createAsyncThunk<
  { reconciliationId: string },
  { entryIds: string[]; reconciliationId?: string },
  { rejectValue: string }
>("cashbook/reconcile", async (payload, { rejectWithValue }) => {
  try {
    // backend: { success, message, data: { reconciliationId } }
    const res = await apiCall("post", `${BASE}/reconcile`, payload, rejectWithValue);
    const rid =
      res?.data?.reconciliationId ||
      res?.data?.data?.reconciliationId || // bazı wrapperlar data içinde data döndürüyor
      res?.reconciliationId;
    return { reconciliationId: String(rid) };
  } catch (e: any) {
    return rejectWithValue(extractError(e, "Failed to reconcile."));
  }
});

export const unreconcile = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("cashbook/unreconcile", async (rid, { rejectWithValue }) => {
  try {
    await apiCall("delete", `${BASE}/reconcile/${rid}`, {}, rejectWithValue);
    return rid;
  } catch (e: any) {
    return rejectWithValue(extractError(e, "Failed to unreconcile."));
  }
});

/* ----------------- Slice ----------------- */
const cashbookSlice = createSlice({
  name: "cashbook",
  initialState,
  reducers: {
    clearCashbookMessages(state) {
      state.message = null;
      state.error = null;
    },
    clearCashbookDetails(state) {
      state.accountDetail = null;
      state.entryDetail = null;
    },
    toggleEntrySelection(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.selectedEntryIds.includes(id)) {
        state.selectedEntryIds = state.selectedEntryIds.filter((x) => x !== id);
      } else {
        state.selectedEntryIds.push(id);
      }
    },
    clearEntrySelection(state) {
      state.selectedEntryIds = [];
    },
  },
  extraReducers: (b) => {
    /* Accounts */
    b.addCase(fetchAccounts.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchAccounts.fulfilled, (s, a) => { s.loading = false; s.accounts = a.payload; })
     .addCase(fetchAccounts.rejected, (s, a) => { s.loading = false; s.error = a.payload || "Fetch accounts error"; })

     .addCase(fetchAccountById.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchAccountById.fulfilled, (s, a) => { s.loading = false; s.accountDetail = a.payload; })
     .addCase(fetchAccountById.rejected, (s, a) => { s.loading = false; s.error = a.payload || "Fetch account error"; })

     .addCase(createAccount.pending, (s) => { s.loading = true; s.message = null; s.error = null; })
     .addCase(createAccount.fulfilled, (s, a) => {
        s.loading = false;
        const created = a.payload?.data as ICashAccount | undefined;
        if (created) s.accounts.unshift(created);
        s.message = a.payload?.message || "Account created.";
     })
     .addCase(createAccount.rejected, (s, a) => { s.loading = false; s.error = a.payload || "Create account error"; })

     .addCase(updateAccount.fulfilled, (s, a) => {
        const updated = (a.payload?.data || a.payload) as ICashAccount;
        s.accounts = s.accounts.map(x => x._id === updated._id ? updated : x);
        if (s.accountDetail && s.accountDetail._id === updated._id) s.accountDetail = updated;
        s.message = a.payload?.message || "Account updated.";
     })
     .addCase(updateAccount.rejected, (s, a) => { s.error = a.payload || "Update account error"; })

     .addCase(deleteAccount.fulfilled, (s, a) => {
        s.accounts = s.accounts.filter(x => x._id !== a.payload.id);
        if (s.accountDetail?._id === a.payload.id) s.accountDetail = null;
        s.message = a.payload?.message || "Account deleted.";
     })
     .addCase(deleteAccount.rejected, (s, a) => { s.error = a.payload || "Delete account error"; });

    /* Entries */
    b.addCase(fetchEntries.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchEntries.fulfilled, (s, a) => { s.loading = false; s.entries = a.payload; })
     .addCase(fetchEntries.rejected, (s, a) => { s.loading = false; s.error = a.payload || "Fetch entries error"; })

     .addCase(fetchEntryById.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchEntryById.fulfilled, (s, a) => { s.loading = false; s.entryDetail = a.payload; })
     .addCase(fetchEntryById.rejected, (s, a) => { s.loading = false; s.error = a.payload || "Fetch entry error"; })

     .addCase(createEntry.pending, (s) => { s.loading = true; s.message = null; s.error = null; })
     .addCase(createEntry.fulfilled, (s, a) => {
        s.loading = false;
        const created = a.payload?.data as ICashEntry | undefined;
        if (created) s.entries.unshift(created);
        s.message = a.payload?.message || "Entry created.";
     })
     .addCase(createEntry.rejected, (s, a) => { s.loading = false; s.error = a.payload || "Create entry error"; })

     .addCase(updateEntry.fulfilled, (s, a) => {
        const updated = (a.payload?.data || a.payload) as ICashEntry;
        s.entries = s.entries.map(x => x._id === updated._id ? updated : x);
        if (s.entryDetail && s.entryDetail._id === updated._id) s.entryDetail = updated;
        s.message = a.payload?.message || "Entry updated.";
     })
     .addCase(updateEntry.rejected, (s, a) => { s.error = a.payload || "Update entry error"; })

     .addCase(deleteEntry.fulfilled, (s, a) => {
        s.entries = s.entries.filter(x => x._id !== a.payload.id);
        if (s.entryDetail?._id === a.payload.id) s.entryDetail = null;
        s.message = a.payload?.message || "Entry deleted.";
     })
     .addCase(deleteEntry.rejected, (s, a) => { s.error = a.payload || "Delete entry error"; })

     .addCase(reconcile.fulfilled, (s) => {
        s.message = "Entries reconciled.";
        s.selectedEntryIds = [];
     })
     .addCase(reconcile.rejected, (s, a) => { s.error = a.payload || "Reconcile error"; })

     .addCase(unreconcile.fulfilled, (s) => {
        s.message = "Reconciliation removed.";
     })
     .addCase(unreconcile.rejected, (s, a) => { s.error = a.payload || "Unreconcile error"; });
  },
});

export const {
  clearCashbookMessages,
  clearCashbookDetails,
  toggleEntrySelection,
  clearEntrySelection,
} = cashbookSlice.actions;

export default cashbookSlice.reducer;

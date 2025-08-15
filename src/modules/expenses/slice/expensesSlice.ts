import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IExpense, ExpenseListFilters } from "../types";

const BASE = "/expenses";

const pickData = <T,>(res: any, fallback: T): T =>
  res && typeof res === "object" && "data" in res ? (res.data as T) : ((res as T) ?? fallback);

interface ExpensesState {
  expensesAdmin: IExpense[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  selected: IExpense | null;
}

const initialState: ExpensesState = {
  expensesAdmin: [],
  loading: false,
  error: null,
  successMessage: null,
  selected: null,
};

/** GET /expenses — admin list */
export const fetchAllExpensesAdmin = createAsyncThunk<
  IExpense[],
  ExpenseListFilters | void,
  { rejectValue: string }
>("expenses/fetchAllAdmin", async (filters, thunkAPI) => {
  try {
    const res = await apiCall("get", BASE, filters as any);
    return pickData<IExpense[]>(res, []);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Fetch failed");
  }
});

/** GET /expenses/:id — admin detail */
export const fetchExpenseById = createAsyncThunk<
  IExpense,
  string,
  { rejectValue: string }
>("expenses/fetchById", async (id, thunkAPI) => {
  try {
    const res = await apiCall("get", `${BASE}/${id}`);
    return pickData<IExpense>(res, {} as IExpense);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Fetch failed");
  }
});

/** POST /expenses */
export const createExpense = createAsyncThunk<
  IExpense,
  Partial<IExpense>,
  { rejectValue: string }
>("expenses/create", async (payload, thunkAPI) => {
  try {
    const res = await apiCall("post", BASE, payload);
    return pickData<IExpense>(res, {} as IExpense);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Create failed");
  }
});

/** PUT /expenses/:id */
export const updateExpense = createAsyncThunk<
  IExpense,
  { id: string; changes: Partial<IExpense> },
  { rejectValue: string }
>("expenses/update", async ({ id, changes }, thunkAPI) => {
  try {
    const res = await apiCall("put", `${BASE}/${id}`, changes);
    return pickData<IExpense>(res, {} as IExpense);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Update failed");
  }
});

/** DELETE /expenses/:id */
export const deleteExpense = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("expenses/delete", async (id, thunkAPI) => {
  try {
    await apiCall("delete", `${BASE}/${id}`);
    return { id };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Delete failed");
  }
});

const slice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearExpenseMessages: (s) => {
      s.error = null;
      s.successMessage = null;
    },
    setSelectedExpense: (s, a: PayloadAction<IExpense | null>) => {
      s.selected = a.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchAllExpensesAdmin.fulfilled, (s, a) => {
      s.expensesAdmin = a.payload ?? [];
      s.loading = false;
      s.error = null;
    });
    b.addCase(fetchExpenseById.fulfilled, (s, a) => {
      s.selected = a.payload || null;
      // liste içinde varsa güncelle
      const idx = s.expensesAdmin.findIndex(x => x._id === a.payload?._id);
      if (idx !== -1 && a.payload) s.expensesAdmin[idx] = a.payload;
      s.loading = false;
      s.error = null;
    });
    b.addCase(createExpense.fulfilled, (s, a) => {
      if (a.payload?._id) s.expensesAdmin.unshift(a.payload);
      s.successMessage = "Created.";
      s.loading = false;
    });
    b.addCase(updateExpense.fulfilled, (s, a) => {
      const i = s.expensesAdmin.findIndex(x => x._id === a.payload._id);
      if (i !== -1) s.expensesAdmin[i] = a.payload;
      else if (a.payload?._id) s.expensesAdmin.unshift(a.payload);
      s.successMessage = "Updated.";
      s.loading = false;
    });
    b.addCase(deleteExpense.fulfilled, (s, a) => {
      s.expensesAdmin = s.expensesAdmin.filter(x => x._id !== a.payload.id);
      if (s.selected?._id === a.payload.id) s.selected = null;
      s.successMessage = "Deleted.";
      s.loading = false;
    });

    // pending / rejected
    b.addMatcher(
      (ac) => ac.type.startsWith("expenses/") && ac.type.endsWith("/pending"),
      (s) => {
        s.loading = true;
        s.error = null;
        s.successMessage = null;
      }
    );
    b.addMatcher(
      (ac: any) => ac.type.startsWith("expenses/") && ac.type.endsWith("/rejected"),
      (s, ac: any) => {
        s.loading = false;
        s.error = ac.payload || "Operation failed";
      }
    );
  },
});

export const { clearExpenseMessages, setSelectedExpense } = slice.actions;
export default slice.reducer;

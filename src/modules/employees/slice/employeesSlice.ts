import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IEmployee, EmployeeListFilters } from "../types";

const BASE: string = "/employees";

/* Backend bazen { data: ... } döndürebilir */
const pickData = <T,>(res: any, fallback: T): T =>
  res && typeof res === "object" && "data" in res ? (res.data as T) : ((res as T) ?? fallback);

interface EmployeesState {
  employeesAdmin: IEmployee[];
  selected: IEmployee | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: EmployeesState = {
  employeesAdmin: [],
  selected: null,
  loading: false,
  error: null,
  successMessage: null,
};

/* ---------- Thunks ---------- */

/** LIST (admin) */
export const fetchAllEmployeesAdmin = createAsyncThunk<
  IEmployee[], EmployeeListFilters | void, { rejectValue: string }
>("employees/fetchAllAdmin", async (filters, thunkAPI) => {
  try {
    const res = await apiCall("get", `${BASE}`, filters as any);
    return pickData<IEmployee[]>(res, []);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Fetch failed");
  }
});

/** GET BY ID (admin) */
export const fetchEmployeeById = createAsyncThunk<
  IEmployee, string, { rejectValue: string }
>("employees/fetchById", async (id, thunkAPI) => {
  try {
    const res = await apiCall("get", `${BASE}/${id}`);
    return pickData<IEmployee>(res, {} as IEmployee);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Fetch failed");
  }
});

/** CREATE */
export const createEmployee = createAsyncThunk<
  IEmployee, Partial<IEmployee>, { rejectValue: string }
>("employees/create", async (payload, thunkAPI) => {
  try {
    const res = await apiCall("post", `${BASE}`, payload);
    return pickData<IEmployee>(res, {} as IEmployee);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Create failed");
  }
});

/** UPDATE */
export const updateEmployee = createAsyncThunk<
  IEmployee, { id: string; changes: Partial<IEmployee> }, { rejectValue: string }
>("employees/update", async ({ id, changes }, thunkAPI) => {
  try {
    const res = await apiCall("put", `${BASE}/${id}`, changes);
    return pickData<IEmployee>(res, {} as IEmployee);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Update failed");
  }
});

/** DELETE */
export const deleteEmployee = createAsyncThunk<
  { id: string }, string, { rejectValue: string }
>("employees/delete", async (id, thunkAPI) => {
  try {
    await apiCall("delete", `${BASE}/${id}`);
    return { id };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Delete failed");
  }
});

/* ---------- Slice ---------- */
const slice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    clearEmployeeMessages: (s) => { s.error = null; s.successMessage = null; },
    setSelectedEmployee: (s, a: PayloadAction<IEmployee | null>) => { s.selected = a.payload; },
  },
  extraReducers: (b) => {
    b.addCase(fetchAllEmployeesAdmin.fulfilled, (s, a) => {
      s.employeesAdmin = a.payload ?? [];
      s.loading = false; s.error = null;
    });
    b.addCase(fetchEmployeeById.fulfilled, (s, a) => {
      s.selected = a.payload || null;
      s.loading = false; s.error = null;
    });
    b.addCase(createEmployee.fulfilled, (s, a) => {
      if (a.payload?._id) s.employeesAdmin.unshift(a.payload);
      s.successMessage = "Created."; s.loading = false;
    });
    b.addCase(updateEmployee.fulfilled, (s, a) => {
      const i = s.employeesAdmin.findIndex(x => x._id === a.payload._id);
      if (i !== -1) s.employeesAdmin[i] = a.payload;
      if (s.selected && s.selected._id === a.payload._id) s.selected = a.payload;
      s.successMessage = "Updated."; s.loading = false;
    });
    b.addCase(deleteEmployee.fulfilled, (s, a) => {
      s.employeesAdmin = s.employeesAdmin.filter(x => x._id !== a.payload.id);
      if (s.selected && s.selected._id === a.payload.id) s.selected = null;
      s.successMessage = "Deleted."; s.loading = false;
    });

    /* pending / rejected matcher’ları */
    b.addMatcher((ac) => ac.type.startsWith("employees/") && ac.type.endsWith("/pending"),
      (s) => { s.loading = true; s.error = null; s.successMessage = null; });
    b.addMatcher((ac: any) => ac.type.startsWith("employees/") && ac.type.endsWith("/rejected"),
      (s, ac: any) => { s.loading = false; s.error = ac.payload || "Operation failed"; });
  }
});

export const { clearEmployeeMessages, setSelectedEmployee } = slice.actions;
export default slice.reducer;

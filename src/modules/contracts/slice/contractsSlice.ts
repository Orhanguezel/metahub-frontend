import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IContract, ContractListFilters, ContractStatus } from "../types";

/* If backend sometimes returns raw or { data: ... } */
const pickData = <T,>(res: any, fallback: T): T =>
  res && typeof res === "object" && "data" in res ? (res.data as T) : ((res as T) ?? fallback);

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface ContractsState {
  contractsAdmin: IContract[];
  selected: IContract | null;
  status: StatusType;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ContractsState = {
  contractsAdmin: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in (payload as any)) {
    const msg = (payload as any).message;
    if (typeof msg === "string") return msg;
  }
  return "An error occurred.";
};

const ADMIN_BASE = "/contracts";

/* -------- Thunks (Admin) -------- */
export const fetchAllContractsAdmin = createAsyncThunk<
  IContract[],
  ContractListFilters | void,
  { rejectValue: string }
>("contracts/fetchAllAdmin", async (params, thunkAPI) => {
  try {
    const res = await apiCall("get", ADMIN_BASE, params || {});
    return pickData<IContract[]>(res, []);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Fetch failed");
  }
});

export const fetchContractAdminById = createAsyncThunk<
  IContract,
  string,
  { rejectValue: string }
>("contracts/fetchAdminById", async (id, thunkAPI) => {
  try {
    const res = await apiCall("get", `${ADMIN_BASE}/${id}`);
    return pickData<IContract>(res, {} as IContract);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Fetch failed");
  }
});

export const createContract = createAsyncThunk<
  IContract,
  Partial<IContract>,
  { rejectValue: string }
>("contracts/create", async (payload, thunkAPI) => {
  try {
    const res = await apiCall("post", ADMIN_BASE, payload);
    return pickData<IContract>(res, {} as IContract);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Create failed");
  }
});

export const updateContract = createAsyncThunk<
  IContract,
  { id: string; changes: Partial<IContract> },
  { rejectValue: string }
>("contracts/update", async ({ id, changes }, thunkAPI) => {
  try {
    const res = await apiCall("put", `${ADMIN_BASE}/${id}`, changes);
    return pickData<IContract>(res, {} as IContract);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Update failed");
  }
});

export const changeContractStatus = createAsyncThunk<
  IContract,
  { id: string; status: ContractStatus },
  { rejectValue: string }
>("contracts/changeStatus", async ({ id, status }, thunkAPI) => {
  try {
    const res = await apiCall("patch", `${ADMIN_BASE}/${id}/status`, { status });
    return pickData<IContract>(res, {} as IContract);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Status change failed");
  }
});

export const deleteContract = createAsyncThunk<
  { id: string; message?: string },
  string,
  { rejectValue: string }
>("contracts/delete", async (id, thunkAPI) => {
  try {
    const res = await apiCall("delete", `${ADMIN_BASE}/${id}`);
    const msg = (res && typeof res === "object" && "message" in res ? (res as any).message : undefined) as
      | string
      | undefined;
    return { id, message: msg };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Delete failed");
  }
});

/* -------- Slice -------- */
const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    clearContractMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    setSelectedContract(state, action: PayloadAction<IContract | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (s: ContractsState) => {
      s.loading = true;
      s.status = "loading";
      s.error = null;
      s.successMessage = null;
    };
    const setError = (s: ContractsState, a: PayloadAction<any>) => {
      s.loading = false;
      s.status = "failed";
      s.error = extractErrorMessage(a.payload);
      s.successMessage = null;
    };

    builder
      /* LIST */
      .addCase(fetchAllContractsAdmin.pending, startLoading)
      .addCase(fetchAllContractsAdmin.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.contractsAdmin = a.payload ?? [];
      })
      .addCase(fetchAllContractsAdmin.rejected, setError)

      /* GET BY ID */
      .addCase(fetchContractAdminById.pending, startLoading)
      .addCase(fetchContractAdminById.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.selected = a.payload;
      })
      .addCase(fetchContractAdminById.rejected, setError)

      /* CREATE */
      .addCase(createContract.pending, startLoading)
      .addCase(createContract.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const created = a.payload as IContract | undefined;
        if (created && created._id) s.contractsAdmin.unshift(created);
        s.successMessage = "Created.";
      })
      .addCase(createContract.rejected, setError)

      /* UPDATE (PUT) */
      .addCase(updateContract.pending, startLoading)
      .addCase(updateContract.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const updated = a.payload as IContract;
        const idx = s.contractsAdmin.findIndex((x) => String(x._id) === String(updated._id));
        if (idx !== -1) s.contractsAdmin[idx] = updated;
        if (s.selected && String(s.selected._id) === String(updated._id)) s.selected = updated;
        s.successMessage = "Updated.";
      })
      .addCase(updateContract.rejected, setError)

      /* PATCH STATUS */
      .addCase(changeContractStatus.pending, startLoading)
      .addCase(changeContractStatus.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        const updated = a.payload as IContract;
        const idx = s.contractsAdmin.findIndex((x) => String(x._id) === String(updated._id));
        if (idx !== -1) s.contractsAdmin[idx] = updated;
        if (s.selected && String(s.selected._id) === String(updated._id)) s.selected = updated;
        s.successMessage = "Status updated.";
      })
      .addCase(changeContractStatus.rejected, setError)

      /* DELETE */
      .addCase(deleteContract.pending, startLoading)
      .addCase(deleteContract.fulfilled, (s, a) => {
        s.loading = false;
        s.status = "succeeded";
        s.contractsAdmin = s.contractsAdmin.filter((x) => String(x._id) !== String(a.payload.id));
        if (s.selected && String(s.selected._id) === String(a.payload.id)) s.selected = null;
        s.successMessage = a.payload.message ?? "Deleted.";
      })
      .addCase(deleteContract.rejected, setError);
  },
});

export const { clearContractMessages, setSelectedContract } = contractsSlice.actions;
export default contractsSlice.reducer;

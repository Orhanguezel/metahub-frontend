import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IPriceList,
  IPriceListItem,
  PriceListAdminFilters,
  PriceListItemAdminFilters,
  PriceListWithItems,
} from "../types";

/** Backend route’ları:
 *  Admin:   /pricelist/admin/...
 *  Public:  /pricelist/public/...
 */
const BASE = "/pricelist";
const BASE_ADMIN = `${BASE}/admin`;

/* { data } sarıcısını güvenle ayıkla */
const pick = <T,>(res: any, fb: T): T =>
  res && typeof res === "object" && "data" in res ? ((res.data as T) ?? fb) : ((res as T) ?? fb);

interface State {
  items: IPriceList[];
  selected: IPriceList | null;
  selectedItems: IPriceListItem[];
  loading: boolean;
  error: string | null;
  /** i18n key: "created" | "updated" | "deleted" */
  success: string | null;
}

const initialState: State = {
  items: [],
  selected: null,
  selectedItems: [],
  loading: false,
  error: null,
  success: null,
};

/* ================== Thunks — Price Lists (Admin) ================== */
export const fetchPriceListsAdmin = createAsyncThunk<
  IPriceList[],
  PriceListAdminFilters | void,
  { rejectValue: string }
>("pricelists/fetchAll", async (filters, api) => {
  try {
    const res = await apiCall("get", `${BASE_ADMIN}`, filters as any);
    return pick<IPriceList[]>(res, []);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Fetch failed");
  }
});

export const fetchPriceListById = createAsyncThunk<
  PriceListWithItems,
  string,
  { rejectValue: string }
>("pricelists/fetchById", async (id, api) => {
  try {
    const res = await apiCall("get", `${BASE_ADMIN}/${id}`);
    return pick<PriceListWithItems>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Fetch failed");
  }
});

export const createPriceList = createAsyncThunk<
  IPriceList,
  Partial<IPriceList>,
  { rejectValue: string }
>("pricelists/create", async (payload, api) => {
  try {
    const res = await apiCall("post", `${BASE_ADMIN}`, payload);
    return pick<IPriceList>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Create failed");
  }
});

export const updatePriceList = createAsyncThunk<
  IPriceList,
  { id: string; changes: Partial<IPriceList> },
  { rejectValue: string }
>("pricelists/update", async ({ id, changes }, api) => {
  try {
    const res = await apiCall("put", `${BASE_ADMIN}/${id}`, changes);
    return pick<IPriceList>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Update failed");
  }
});

export const deletePriceList = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("pricelists/delete", async (id, api) => {
  try {
    await apiCall("delete", `${BASE_ADMIN}/${id}`);
    return { id };
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Delete failed");
  }
});

/* ================== Thunks — Price List Items (Admin) ================== */
export const fetchPriceListItems = createAsyncThunk<
  IPriceListItem[],
  { listId: string; filters?: PriceListItemAdminFilters },
  { rejectValue: string }
>("pricelists/items/fetch", async ({ listId, filters }, api) => {
  try {
    const res = await apiCall("get", `${BASE_ADMIN}/${listId}/items`, filters as any);
    return pick<IPriceListItem[]>(res, []);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Fetch failed");
  }
});

export const createPriceListItem = createAsyncThunk<
  IPriceListItem,
  { listId: string; payload: Partial<IPriceListItem> },
  { rejectValue: string }
>("pricelists/items/create", async ({ listId, payload }, api) => {
  try {
    const res = await apiCall("post", `${BASE_ADMIN}/${listId}/items`, payload);
    return pick<IPriceListItem>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Create failed");
  }
});

export const updatePriceListItem = createAsyncThunk<
  IPriceListItem,
  { listId: string; itemId: string; changes: Partial<IPriceListItem> },
  { rejectValue: string }
>("pricelists/items/update", async ({ listId, itemId, changes }, api) => {
  try {
    const res = await apiCall("put", `${BASE_ADMIN}/${listId}/items/${itemId}`, changes);
    return pick<IPriceListItem>(res, {} as any);
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Update failed");
  }
});

export const deletePriceListItem = createAsyncThunk<
  { itemId: string },
  { listId: string; itemId: string },
  { rejectValue: string }
>("pricelists/items/delete", async ({ listId, itemId }, api) => {
  try {
    await apiCall("delete", `${BASE_ADMIN}/${listId}/items/${itemId}`);
    return { itemId };
  } catch (e: any) {
    return api.rejectWithValue(e?.data?.message ?? e?.message ?? "Delete failed");
  }
});

/* ================== Slice ================== */
const slice = createSlice({
  name: "pricelists",
  initialState,
  reducers: {
    clearPriceListMsgs: (s) => {
      s.error = null;
      s.success = null;
    },
    setSelectedPriceList: (s, a: PayloadAction<IPriceList | null>) => {
      s.selected = a.payload;
      s.selectedItems = [];
    },
  },
  extraReducers: (b) => {
    // lists
    b.addCase(fetchPriceListsAdmin.fulfilled, (s, a) => {
      s.items = a.payload;
      s.loading = false;
      s.error = null;
    });
    b.addCase(createPriceList.fulfilled, (s, a) => {
      if (a.payload?._id) s.items.unshift(a.payload);
      s.loading = false;
      s.success = "created";
    });
    b.addCase(updatePriceList.fulfilled, (s, a) => {
      const i = s.items.findIndex((x) => x._id === a.payload._id);
      if (i !== -1) s.items[i] = a.payload;
      if (s.selected?._id === a.payload._id) s.selected = a.payload;
      s.loading = false;
      s.success = "updated";
    });
    b.addCase(deletePriceList.fulfilled, (s, a) => {
      s.items = s.items.filter((x) => x._id !== a.payload.id);
      if (s.selected?._id === a.payload.id) {
        s.selected = null;
        s.selectedItems = [];
      }
      s.loading = false;
      s.success = "deleted";
    });

    // by id (includes items)
    b.addCase(fetchPriceListById.fulfilled, (s, a) => {
      const list = a.payload?.list as IPriceList | undefined;
      const items = a.payload?.items as IPriceListItem[] | undefined;
      if (list) {
        s.selected = list;
        s.selectedItems = items ?? [];
        s.error = null;
      }
      s.loading = false;
    });

    // items
    b.addCase(fetchPriceListItems.fulfilled, (s, a) => {
      s.selectedItems = a.payload;
      s.loading = false;
    });
    b.addCase(createPriceListItem.fulfilled, (s, a) => {
      s.selectedItems.unshift(a.payload);
      s.loading = false;
      s.success = "created";
    });
    b.addCase(updatePriceListItem.fulfilled, (s, a) => {
      const i = s.selectedItems.findIndex((x) => x._id === a.payload._id);
      if (i !== -1) s.selectedItems[i] = a.payload;
      s.loading = false;
      s.success = "updated";
    });
    b.addCase(deletePriceListItem.fulfilled, (s, a) => {
      s.selectedItems = s.selectedItems.filter((x) => x._id !== a.payload.itemId);
      s.loading = false;
      s.success = "deleted";
    });

    // generic pending/rejected
    b.addMatcher(
      (ac) => ac.type.startsWith("pricelists/") && ac.type.endsWith("/pending"),
      (s) => {
        s.loading = true;
        s.error = null;
        s.success = null;
      }
    );
    b.addMatcher(
      (ac) => ac.type.startsWith("pricelists/") && ac.type.endsWith("/rejected"),
      (s: State, ac: any) => {
        s.loading = false;
        s.error = ac.payload || "Operation failed";
      }
    );
  },
});

export const { clearPriceListMsgs, setSelectedPriceList } = slice.actions;
export default slice.reducer;

// frontend/modules/webhooks/slice.ts
import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IWebhookEndpointFE,
  IWebhookDeliveryFE,
  WebhookEndpointCreatePayload,
  WebhookEndpointUpdatePayload,
  WebhookEndpointListParams,
  WebhookDeliveryListParams,
  WebhookRetryResponse, // { deliveryId?: string }
  WebhookTestSendPayload, // { endpointRef?: string; targetUrl?: string; eventType?: string; ... }
} from "../types";

/* ================== Utils ================== */

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in (payload as any)) {
    const msg = (payload as any).message;
    if (typeof msg === "string") return msg;
  }
  return "An error occurred.";
};

const upsert = <T extends { _id: string }>(arr: T[], item?: T) => {
  if (!item?._id) return arr;
  const i = arr.findIndex((x) => String(x._id) === String(item._id));
  if (i >= 0) arr[i] = item;
  else arr.unshift(item);
  return arr;
};

const removeById = <T extends { _id: string }>(arr: T[], id: string) =>
  arr.filter((x) => String(x._id) !== String(id));

const BASE = `/webhooks`;

/* ================== Thunks ================== */
/** ENDPOINTS — LIST (GET /webhooks/endpoints) */
export const fetchWebhookEndpoints = createAsyncThunk<
  IWebhookEndpointFE[],
  WebhookEndpointListParams | void
>("webhooks/fetchEndpoints", async (params, thunkAPI) => {
  const res = await apiCall(
    "get",
    `${BASE}/endpoints`,
    params || {},
    thunkAPI.rejectWithValue
  );
  return (res?.data ?? []) as IWebhookEndpointFE[];
});

/** ENDPOINTS — GET BY ID (GET /webhooks/endpoints/:id) */
export const fetchWebhookEndpointById = createAsyncThunk<
  IWebhookEndpointFE,
  string
>("webhooks/fetchEndpointById", async (id, thunkAPI) => {
  const res = await apiCall(
    "get",
    `${BASE}/endpoints/${encodeURIComponent(id)}`,
    {},
    thunkAPI.rejectWithValue
  );
  return res?.data as IWebhookEndpointFE;
});

/** ENDPOINTS — CREATE (POST /webhooks/endpoints) */
export const createWebhookEndpoint = createAsyncThunk<
  IWebhookEndpointFE,
  WebhookEndpointCreatePayload
>("webhooks/createEndpoint", async (payload, thunkAPI) => {
  const res = await apiCall(
    "post",
    `${BASE}/endpoints`,
    payload,
    thunkAPI.rejectWithValue
  );
  return res?.data as IWebhookEndpointFE;
});

/** ENDPOINTS — UPDATE (PUT /webhooks/endpoints/:id) */
export const updateWebhookEndpoint = createAsyncThunk<
  IWebhookEndpointFE,
  { id: string; patch: WebhookEndpointUpdatePayload }
>("webhooks/updateEndpoint", async ({ id, patch }, thunkAPI) => {
  const res = await apiCall(
    "put",
    `${BASE}/endpoints/${encodeURIComponent(id)}`,
    patch,
    thunkAPI.rejectWithValue
  );
  return res?.data as IWebhookEndpointFE;
});

/** ENDPOINTS — DELETE (DELETE /webhooks/endpoints/:id)
 * BE `data` döndürmediğinden id’yi geri döndürüyoruz.
 */
export const deleteWebhookEndpoint = createAsyncThunk<string, string>(
  "webhooks/deleteEndpoint",
  async (id, thunkAPI) => {
    await apiCall(
      "delete",
      `${BASE}/endpoints/${encodeURIComponent(id)}`,
      {},
      thunkAPI.rejectWithValue
    );
    return id;
  }
);

/** DELIVERIES — LIST (GET /webhooks/deliveries) */
export const fetchWebhookDeliveries = createAsyncThunk<
  IWebhookDeliveryFE[],
  WebhookDeliveryListParams | void
>("webhooks/fetchDeliveries", async (params, thunkAPI) => {
  const res = await apiCall(
    "get",
    `${BASE}/deliveries`,
    params || {},
    thunkAPI.rejectWithValue
  );
  return (res?.data ?? []) as IWebhookDeliveryFE[];
});

/** DELIVERIES — GET BY ID (GET /webhooks/deliveries/:id) */
export const fetchWebhookDeliveryById = createAsyncThunk<
  IWebhookDeliveryFE,
  string
>("webhooks/fetchDeliveryById", async (id, thunkAPI) => {
  const res = await apiCall(
    "get",
    `${BASE}/deliveries/${encodeURIComponent(id)}`,
    {},
    thunkAPI.rejectWithValue
  );
  return res?.data as IWebhookDeliveryFE;
});

/** DELIVERIES — RETRY (POST /webhooks/deliveries/:id/retry)
 * res.data => { deliveryId?: string }
 */
export const retryWebhookDelivery = createAsyncThunk<
  WebhookRetryResponse,
  string
>("webhooks/retryDelivery", async (id, thunkAPI) => {
  const res = await apiCall(
    "post",
    `${BASE}/deliveries/${encodeURIComponent(id)}/retry`,
    {},
    thunkAPI.rejectWithValue
  );
  return (res?.data ?? {}) as WebhookRetryResponse;
});

/** TEST — SEND (POST /webhooks/test)
 * res.data => { deliveryId?: string }
 */
export const sendWebhookTest = createAsyncThunk<
  { deliveryId?: string },
  WebhookTestSendPayload
>("webhooks/sendTest", async (payload, thunkAPI) => {
  const res = await apiCall(
    "post",
    `${BASE}/test`,
    payload,
    thunkAPI.rejectWithValue
  );
  return (res?.data ?? {}) as { deliveryId?: string };
});

/* ================== State ================== */

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface WebhooksState {
  endpoints: IWebhookEndpointFE[];
  deliveries: IWebhookDeliveryFE[];

  selectedEndpoint: IWebhookEndpointFE | null;
  selectedDelivery: IWebhookDeliveryFE | null;

  status: StatusType;
  loading: boolean;
  error: string | null;
  successMessage: string | null; // not: artık server message’ı dönmüyoruz; UI isterse sabit string set edebilir
}

const initialState: WebhooksState = {
  endpoints: [],
  deliveries: [],

  selectedEndpoint: null,
  selectedDelivery: null,

  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

/* ================== Slice ================== */

const webhooksSlice = createSlice({
  name: "webhooks",
  initialState,
  reducers: {
    clearWebhooksMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    setSelectedWebhookEndpoint(state, action: PayloadAction<IWebhookEndpointFE | null>) {
      state.selectedEndpoint = action.payload;
    },
    setSelectedWebhookDelivery(state, action: PayloadAction<IWebhookDeliveryFE | null>) {
      state.selectedDelivery = action.payload;
    },
    // İsterseniz UI’dan başarılı işlem sonrası küçük toast göstermek için:
    setWebhooksSuccessMessage(state, action: PayloadAction<string | null>) {
      state.successMessage = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: WebhooksState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
      state.successMessage = null;
    };
    const setError = (state: WebhooksState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    /* ---- Endpoints ---- */
    builder
      .addCase(fetchWebhookEndpoints.pending, startLoading)
      .addCase(fetchWebhookEndpoints.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.endpoints = action.payload ?? [];
      })
      .addCase(fetchWebhookEndpoints.rejected, setError);

    builder
      .addCase(fetchWebhookEndpointById.pending, startLoading)
      .addCase(fetchWebhookEndpointById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const ep = action.payload;
        state.endpoints = upsert([...state.endpoints], ep);
        state.selectedEndpoint = ep;
      })
      .addCase(fetchWebhookEndpointById.rejected, setError);

    builder
      .addCase(createWebhookEndpoint.pending, startLoading)
      .addCase(createWebhookEndpoint.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const created = action.payload;
        if (created) state.endpoints = upsert([...state.endpoints], created);
        // message artık thunk’tan gelmiyor; isterseniz sabit bir mesaj kullanın:
        // state.successMessage = "created";
      })
      .addCase(createWebhookEndpoint.rejected, setError);

    const onEndpointUpdate = (state: WebhooksState, action: PayloadAction<IWebhookEndpointFE>) => {
      state.loading = false;
      state.status = "succeeded";
      const updated = action.payload;
      state.endpoints = upsert([...state.endpoints], updated);
      if (
        state.selectedEndpoint &&
        String(state.selectedEndpoint._id) === String(updated._id)
      ) {
        state.selectedEndpoint = updated;
      }
      // state.successMessage = "updated";
    };

    builder
      .addCase(updateWebhookEndpoint.pending, startLoading)
      .addCase(updateWebhookEndpoint.fulfilled, onEndpointUpdate)
      .addCase(updateWebhookEndpoint.rejected, setError);

    builder
      .addCase(deleteWebhookEndpoint.pending, startLoading)
      .addCase(deleteWebhookEndpoint.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const id = action.payload;
        if (id) state.endpoints = removeById(state.endpoints, id);
        if (state.selectedEndpoint && String(state.selectedEndpoint._id) === String(id)) {
          state.selectedEndpoint = null;
        }
        // state.successMessage = "deleted";
      })
      .addCase(deleteWebhookEndpoint.rejected, setError);

    /* ---- Deliveries ---- */
    builder
      .addCase(fetchWebhookDeliveries.pending, startLoading)
      .addCase(fetchWebhookDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.deliveries = action.payload ?? [];
      })
      .addCase(fetchWebhookDeliveries.rejected, setError);

    builder
      .addCase(fetchWebhookDeliveryById.pending, startLoading)
      .addCase(fetchWebhookDeliveryById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const doc = action.payload;
        state.deliveries = upsert([...state.deliveries], doc);
        state.selectedDelivery = doc;
      })
      .addCase(fetchWebhookDeliveryById.rejected, setError);

    builder
      .addCase(retryWebhookDelivery.pending, startLoading)
      .addCase(retryWebhookDelivery.fulfilled, (state) => {
        state.loading = false;
        state.status = "succeeded";
        // state.successMessage = "retry_queued";
      })
      .addCase(retryWebhookDelivery.rejected, setError);

    builder
      .addCase(sendWebhookTest.pending, startLoading)
      .addCase(sendWebhookTest.fulfilled, (state) => {
        state.loading = false;
        state.status = "succeeded";
        // state.successMessage = "test_sent";
      })
      .addCase(sendWebhookTest.rejected, setError);
  },
});

export const {
  clearWebhooksMessages,
  setSelectedWebhookEndpoint,
  setSelectedWebhookDelivery,
  setWebhooksSuccessMessage,
} = webhooksSlice.actions;

export default webhooksSlice.reducer;

/* ================== Selectors ================== */
export const selectWebhookEndpoints = (s: any) =>
  (s.webhooks?.endpoints ?? []) as IWebhookEndpointFE[];

export const selectWebhookDeliveries = (s: any) =>
  (s.webhooks?.deliveries ?? []) as IWebhookDeliveryFE[];

export const selectSelectedWebhookEndpoint = (s: any) =>
  (s.webhooks?.selectedEndpoint ?? null) as IWebhookEndpointFE | null;

export const selectSelectedWebhookDelivery = (s: any) =>
  (s.webhooks?.selectedDelivery ?? null) as IWebhookDeliveryFE | null;

export const selectWebhooksLoading = (s: any) =>
  Boolean(s.webhooks?.loading);

export const selectWebhooksError = (s: any) =>
  (s.webhooks?.error ?? null) as string | null;

export const selectWebhooksSuccessMessage = (s: any) =>
  (s.webhooks?.successMessage ?? null) as string | null;

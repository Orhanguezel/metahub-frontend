// src/store/pageConfigApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pageConfigApi = createApi({
  reducerPath: "pageConfigApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL, // .env'de API_URL tanımlı
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getPageConfig: builder.query<{ modules: any[]; meta?: any }, string>({
      query: (page) => `/page-config/${page}`, // Örnek: `/page-config/blogs`
    }),
  }),
});

export const { useGetPageConfigQuery } = pageConfigApi;

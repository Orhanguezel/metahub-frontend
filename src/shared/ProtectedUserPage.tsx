// src/shared/ProtectedUserPage.tsx
"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useRef } from "react";
import { fetchCurrentUser } from "@/modules/users/slice/accountSlice";
import { Loading } from "@/shared";

export default function ProtectedUserPage({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.account.profile);
  const loading = useAppSelector((state) => state.account.loading);
  const error = useAppSelector((state) => state.account.error);
  const fetchedRef = useRef(false); // sonsuz döngü önleyici

  useEffect(() => {
    // Sadece ilk açılışta bir kez fetch
    if (!profile && !fetchedRef.current) {
      dispatch(fetchCurrentUser());
      fetchedRef.current = true;
    }
  }, [dispatch, profile]);

  useEffect(() => {
    // Profil ve yükleme bittiğinde ama profil yoksa yönlendir
    if (!loading && !profile) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }, [loading, profile]);

  if (loading || !profile) {
    return <Loading />;
  }

  if (error && !loading) {
    return <div style={{ padding: 32, color: "red" }}>Kullanıcı profili alınamadı: {error}</div>;
  }

  return <>{children}</>;
}


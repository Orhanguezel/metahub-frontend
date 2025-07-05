"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCurrentUser } from "@/modules/users/slice/accountSlice";

export default function InitUserLoader() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.account.profile);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, profile]);

  return null;
}

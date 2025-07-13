import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCurrentUser } from "@/modules/users/slice/accountSlice";

export default function InitUserLoader() {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.account);
  const [hasTried, setHasTried] = useState(false);

  useEffect(() => {
    if (!profile && !loading && !hasTried) {
      dispatch(fetchCurrentUser());
      setHasTried(true);
    }
  }, [dispatch, profile, loading, hasTried]);

  return null;
}

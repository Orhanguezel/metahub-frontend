"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchUsers } from "@/store/user/userCrudSlice";
import UserTableRow from "./UserTableRow";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { User } from "@/types/user";
import { UserFilterState } from "@/app/admin/users/page"; // ✅ doğru filter tipi

interface Props {
  filters: UserFilterState;
}

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.backgroundSecondary};
  color: ${({ theme }) => theme.text};
`;

const Th = styled.th`
  text-align: left;
  padding: 10px;
  background: ${({ theme }) => theme.backgroundAlt};
  border-bottom: 1px solid ${({ theme }) => theme.border || "#ccc"};
`;

export default function UserTable({ filters }: Props) {
  const { t } = useTranslation("admin");
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.userCrud);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(filters.query.toLowerCase()) ||
      u.email.toLowerCase().includes(filters.query.toLowerCase());

    const matchRole = filters.role ? u.role === filters.role : true;
    const matchActive =
      filters.isActive === ""
        ? true
        : filters.isActive === "true"
        ? u.isActive
        : !u.isActive;

    return matchQuery && matchRole && matchActive;
  });

  if (loading) return <p>{t("users.loading")}</p>;

  return (
    <Table>
      <thead>
        <tr>
          <Th>{t("users.table.name")}</Th>
          <Th>{t("users.table.email")}</Th>
          <Th>{t("users.table.role")}</Th>
          <Th>{t("users.table.active")}</Th>
          <Th>{t("users.table.actions")}</Th>
        </tr>
      </thead>
      <tbody>
        {filteredUsers.map((user: User) => (
          <UserTableRow key={user._id} user={user} />
        ))}
      </tbody>
    </Table>
  );
}

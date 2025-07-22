import styled from "styled-components";
import { User } from "@/modules/users/types/user";
import { getImageSrc } from "@/shared/getImageSrc";
import { getProfileImageUrl } from "@/shared/getProfileImageUrl";
import { UserActions } from "@/modules/users";

interface Props {
  user: User;
  onRefresh?: () => void;
}

export default function UserTableRow({ user, onRefresh }: Props) {
  return (
    <tr>
      <Td>
        <UserInfo>
          <Avatar
            src={getImageSrc(getProfileImageUrl(user.profileImage), "profile")}
            alt="avatar"
          />
          <span>{user.name}</span>
        </UserInfo>
      </Td>
      <Td>{user.email}</Td>
      <Td>{user.role}</Td>
      <Td>{user.isActive ? "✅" : "❌"}</Td>
      <Td>
        <UserActions
          userId={user._id}
          currentRole={user.role}
          onRefresh={onRefresh || (() => {})}
        />
      </Td>
    </tr>
  );
}

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border || "#eee"};
  vertical-align: middle;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 0.6rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

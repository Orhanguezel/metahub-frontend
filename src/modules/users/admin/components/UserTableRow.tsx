import styled from "styled-components";
import { User } from "@/modules/users/types/user";
import { getImageSrc } from "@/shared/getImageSrc";
import { getProfileImageUrl } from "@/shared/getProfileImageUrl";
import { UserActions } from "@/modules/users";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { adminUserTranslations } from "@/modules/users";

interface Props {
  user: User;
  onRefresh?: () => void;
}

export default function UserTableRow({ user, onRefresh }: Props) {
  const { t } = useI18nNamespace("adminUser", adminUserTranslations);

  const src =
    getImageSrc(getProfileImageUrl(user.profileImage), "profile") ||
    "/defaults/profile.png";

  return (
    <Row>
      {/* Ad Soyad + Email (tek kolon) */}
      <Td>
        <UserInfo>
          <Avatar
            src={src}
            alt={t("users.avatarAlt", "{{name}} profil fotoğrafı", {
              name: user.name || "user",
            })}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/defaults/profile.png";
            }}
          />
          <NameEmail>
            <Name title={user.name}>{user.name}</Name>
            <Email title={user.email}>{user.email}</Email>
          </NameEmail>
        </UserInfo>
      </Td>

      {/* Rol */}
      <Td>
        <RoleBadge title={user.role}>{user.role}</RoleBadge>
      </Td>

      {/* Durum */}
      <Td>
        <StatusChip $active={!!user.isActive} aria-label={user.isActive ? t("users.active", "Aktif") : t("users.inactive", "Pasif")}>
          <Dot $active={!!user.isActive} />
          {user.isActive ? t("users.active", "Aktif") : t("users.inactive", "Pasif")}
        </StatusChip>
      </Td>

      {/* İşlemler */}
      <TdActions>
        <UserActions
          userId={user._id}
          currentRole={user.role}
          onRefresh={onRefresh || (() => {})}
        />
      </TdActions>
    </Row>
  );
}

/* ===================== styles ===================== */

const Row = styled.tr`
  transition: background ${({ theme }) => theme.transition.fast};
  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
  }
`;

const Td = styled.td`
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderBright};
  vertical-align: middle;
  color: ${({ theme }) => theme.colors.text};
`;

const TdActions = styled(Td)`
  text-align: right;
  white-space: nowrap;

  ${({ theme }) => theme.media.small} {
    text-align: left;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.circle};
  object-fit: cover;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderBright};
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
`;

const NameEmail = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0; /* text-overflow için gerekli */
`;

const Name = styled.span`
  color: ${({ theme }) => theme.colors.title};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  line-height: 1.15;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Email = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.92rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.borderHighlight};
  font-size: 0.85rem;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-transform: none;
`;

const StatusChip = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 0.85rem;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.successBg : theme.colors.dangerBg};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.success : theme.colors.danger};
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.success : theme.colors.danger)};
`;

const Dot = styled.i<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: ${({ theme }) => theme.radii.circle};
  display: inline-block;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.success : theme.colors.danger};
`;

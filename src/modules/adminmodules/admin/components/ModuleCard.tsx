"use client";

import React from "react";
import styled from "styled-components";
import { Check, X, Globe, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as MdIcons from "react-icons/md";

interface RouteMeta {
  method: string;
  path: string;
  summary?: string;
}

interface Label {
  tr: string;
  en: string;
  de: string;
}

interface ModuleCardProps {
  module: {
    name: string;
    label: Label;
    enabled: boolean;
    icon?: string;
    version?: string;
    visibleInSidebar?: boolean;
    useAnalytics?: boolean;
    createdAt?: string;
    updatedAt?: string;
    routes?: RouteMeta[];
  };
  search?: string;
  onClick?: () => void;
  onDelete?: (name: string) => void;
}

const dynamicIcon = (iconName?: string) => {
  if (iconName && MdIcons[iconName as keyof typeof MdIcons]) {
    return MdIcons[iconName as keyof typeof MdIcons];
  }
  return MdIcons.MdSettings;
};

const highlightMatch = (text: string, search: string) => {
  if (!search) return text;
  const regex = new RegExp(`(${search})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <Highlight key={i}>{part}</Highlight>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  search = "",
  onClick,
  onDelete,
}) => {
  const { i18n, t } = useTranslation("adminModules");
  const currentLang = (i18n.language || "en") as keyof Label;
  const moduleLabel = module.label?.[currentLang] || module.name;
  const swaggerLink = `/api-docs/#/${module.name}`;

  const IconComponent = dynamicIcon(module.icon);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(module.name);
    }
  };

  return (
    <Card onClick={onClick}>
      <CardHeader>
        <IconWrapper>
          <IconComponent />
        </IconWrapper>

        <ModuleInfo>
          <LabelText>{highlightMatch(moduleLabel, search)}</LabelText>
          <NameText>{highlightMatch(module.name, search)}</NameText>
        </ModuleInfo>

        <Actions>
          <TrashButton
            onClick={handleDeleteClick}
            title={t("delete", "Delete Module")}
          >
            <Trash2 size={18} />
          </TrashButton>
        </Actions>
      </CardHeader>

      <Divider />

      <StatusGroup>
        <StatusItem>
          <span>{t("enabled", "Enabled")}</span>
          {module.enabled ? <Check color="green" /> : <X color="red" />}
        </StatusItem>
        <StatusItem>
          <span>{t("visibleInSidebar", "Sidebar")}</span>
          {module.visibleInSidebar ? (
            <Check color="green" />
          ) : (
            <X color="gray" />
          )}
        </StatusItem>
        <StatusItem>
          <span>{t("useAnalytics", "Analytics")}</span>
          {module.useAnalytics ? <Check color="blue" /> : <X color="gray" />}
        </StatusItem>
      </StatusGroup>

      <MetaInfo>
        <small>{t("createdAt", "Created at")}:</small>
        <TimeText>{new Date(module.createdAt || "").toLocaleString()}</TimeText>
        <small>{t("updatedAt", "Updated at")}:</small>
        <TimeText>{new Date(module.updatedAt || "").toLocaleString()}</TimeText>
      </MetaInfo>

      {module.routes && module.routes.length > 0 && (
        <>
          <Divider />
          <RouteList>
            {module.routes.slice(0, 5).map((r, idx) => (
              <li key={idx}>
                <code>{r.method}</code>
                <span>{r.path}</span>
              </li>
            ))}
            {module.routes.length > 5 && (
              <li className="more">
                +{module.routes.length - 5} {t("more", "more")}
              </li>
            )}
          </RouteList>
        </>
      )}

      <CardFooter>
        <SwaggerLink
          href={swaggerLink}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <Globe size={16} />
          {t("swagger", "Swagger")}
        </SwaggerLink>
      </CardFooter>
    </Card>
  );
};

export default ModuleCard;

// 🎨 Styled Components

const Card = styled.div`
  background: ${({ theme }) => theme.cards.background};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: box-shadow ${({ theme }) => theme.transition.fast};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    cursor: pointer;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IconWrapper = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const ModuleInfo = styled.div`
  flex: 1;
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TrashButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: ${({ theme }) => theme.colors.danger};
  transition: opacity ${({ theme }) => theme.transition.fast};

  &:hover {
    opacity: 0.7;
  }
`;

const LabelText = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin: 0;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const NameText = styled.small`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Highlight = styled.span`
  background-color: ${({ theme }) => theme.colors.warning};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0 2px;
  animation: highlightFlash 0.8s ease-in-out;

  @keyframes highlightFlash {
    from {
      background-color: transparent;
    }
    to {
      background-color: ${({ theme }) => theme.colors.warning};
    }
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  margin: 0.3rem 0;
`;

const StatusGroup = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const MetaInfo = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const TimeText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text};
`;

const RouteList = styled.ul`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding-left: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  li {
    display: flex;
    gap: ${({ theme }) => theme.spacing.xs};

    code {
      font-weight: ${({ theme }) => theme.fontWeights.semiBold};
      color: ${({ theme }) => theme.colors.primary};
    }

    &.more {
      font-style: italic;
      opacity: 0.7;
    }
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SwaggerLink = styled.a`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.link};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transition.fast};

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.linkHover};
  }
`;

"use client";

import React from "react";
import styled from "styled-components";
import { Check, X, Globe, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as MdIcons from "react-icons/md"; // Material Design iconları

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
  search?: string; // 🔥 Yeni: Arama kelimesi props olarak alınacak
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

const ModuleCard: React.FC<ModuleCardProps> = ({ module, search = "", onClick, onDelete }) => {
  const { i18n, t } = useTranslation();
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
          <TrashButton onClick={handleDeleteClick} title={t("admin.modules.delete", "Modülü Sil")}>
            <Trash2 size={18} />
          </TrashButton>
        </Actions>
      </CardHeader>

      <Divider />

      <StatusGroup>
        <StatusItem>
          <span>{t("admin.modules.enabled", "Aktif")}</span>
          {module.enabled ? <Check color="green" /> : <X color="red" />}
        </StatusItem>
        <StatusItem>
          <span>{t("admin.modules.sidebar", "Sidebar")}</span>
          {module.visibleInSidebar ? <Check color="green" /> : <X color="gray" />}
        </StatusItem>
        <StatusItem>
          <span>{t("admin.modules.analytics", "Analytics")}</span>
          {module.useAnalytics ? <Check color="blue" /> : <X color="gray" />}
        </StatusItem>
      </StatusGroup>

      <MetaInfo>
        <small>{t("createdAt", "Oluşturuldu")}:</small>
        <TimeText>{new Date(module.createdAt || "").toLocaleString()}</TimeText>
        <small>{t("updatedAt", "Güncellendi")}:</small>
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
              <li className="more">+{module.routes.length - 5} more</li>
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
          Swagger
        </SwaggerLink>
      </CardFooter>
    </Card>
  );
};

export default ModuleCard;

// --- Styled Components

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
`;

const IconWrapper = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.primary};
`;

const ModuleInfo = styled.div`
  flex: 1;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TrashButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: ${({ theme }) => theme.danger};
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.7;
  }
`;

const LabelText = styled.h3`
  font-size: 1rem;
  margin: 0;
`;

const NameText = styled.small`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.8rem;
`;

const Highlight = styled.span`
  background-color: yellow;
  color: black;
  font-weight: bold;
  border-radius: 4px;
  padding: 0 2px;
  animation: highlightFlash 0.8s ease-in-out;

  @keyframes highlightFlash {
    from { background-color: transparent; }
    to { background-color: yellow; }
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border};
  margin: 0.3rem 0;
`;

const StatusGroup = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const MetaInfo = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const TimeText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text};
`;

const RouteList = styled.ul`
  font-size: 0.8rem;
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  li {
    display: flex;
    gap: 0.5rem;

    code {
      font-weight: bold;
      color: ${({ theme }) => theme.primary};
    }

    &.more {
      font-style: italic;
      opacity: 0.6;
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
  gap: 0.4rem;
  color: ${({ theme }) => theme.link};
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    text-decoration: underline;
  }
`;
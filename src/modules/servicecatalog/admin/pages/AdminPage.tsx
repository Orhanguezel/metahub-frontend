"use client";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/servicecatalog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearSvcMsgs,
  setSelectedSvc,
} from "@/modules/servicecatalog/slice/serviceCatalogSlice";
import type { IServiceCatalog } from "@/modules/servicecatalog/types";
import { CatalogList, CatalogForm, CatalogDetail } from "@/modules/servicecatalog";

type Props = {
  /** Parent dinamik fetch yapıyorsa buradan tetiklenir */
  onRefresh?: () => void;
};

export default function ServiceCatalogAdminPage({ onRefresh }: Props) {
  const { t } = useI18nNamespace("servicecatalog", translations);

  const dispatch = useAppDispatch();
  const { items, selected, loading, error, success } = useAppSelector(
    (s) => s.servicecatalog
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IServiceCatalog | null>(null);

  // 🔔 toast & mesaj temizliği (fetch yok)
  useEffect(() => {
    if (success) toast.success(success);
    if (error) toast.error(error);
    if (success || error) dispatch(clearSvcMsgs());
  }, [success, error, dispatch]);

  const count = useMemo(() => items.length, [items]);

  return (
    <Page>
      <Head>
        <Title aria-label={t("admin.title", "Service Catalog")}>
          {t("admin.title", "Service Catalog")}
        </Title>
        <Right>
          <Counter
            title={t("admin.counter.title", "Total services")}
            aria-live="polite"
          >
            {count}
          </Counter>
          <Primary
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            {t("admin.new", "+ New Service")}
          </Primary>

          {/* Parent fetch kullanıyorsa göster */}
          {onRefresh && (
            <SmallBtn
              type="button"
              onClick={onRefresh}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? t("common.loading", "Loading…") : t("admin.refresh", "Refresh")}
            </SmallBtn>
          )}
        </Right>
      </Head>

      {showForm && (
        <Card>
          <CatalogForm
            initial={editing || undefined}
            onClose={() => setShowForm(false)}
            // ⛔ Re-fetch yok; create/update slice state’i güncelliyor
            onSaved={() => setShowForm(false)}
          />
        </Card>
      )}

      <Section>
        <SectionHead>
          <SubTitle>{t("admin.itemsTitle", "Items")}</SubTitle>
        </SectionHead>

        <Card>
          <CatalogList
            items={items}
            loading={loading}
            onEdit={(svc) => {
              setEditing(svc);
              setShowForm(true);
            }}
          />
        </Card>

        {selected && (
          <Card>
            <CatalogDetail
              item={selected}
              onClose={() => dispatch(setSelectedSvc(null))}
            />
          </Card>
        )}
      </Section>
    </Page>
  );
}

/* ========== styled ========== */

const Page = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;

const Head = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.h2};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  color: ${({ theme }) => theme.colors.title};
  margin: 0;
`;

const Right = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
  flex-wrap: wrap;
`;

const Counter = styled.span`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.title};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  min-width: 2.25rem;
  text-align: center;
`;

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacings.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SubTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.textAlt};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;

const BaseButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  outline: none;
  line-height: 1;
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
  &:focus-visible {
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Primary = styled(BaseButton)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 12px;
  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

const SmallBtn = styled(BaseButton)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 6px 10px;
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
`;

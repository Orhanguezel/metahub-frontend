"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCustomersAdmin,
  setSelectedCustomer,
  createCustomerAdmin,
  updateCustomerAdmin,
  deleteCustomerAdmin,
  clearCustomerMessages,
} from "@/modules/customer/slice/customerSlice";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { CustomerForm, CustomerInfoCard } from "@/modules/customer";
import CustomerDetailsPage from "@/modules/customer/admin/components/CustomerDetailsPage";
import Modal from "@/shared/Modal";
import styled from "styled-components";
import type { ICustomer } from "@/modules/customer/types";

// Varsayılan müşteri modeli
const defaultCustomer: ICustomer = {
  tenant: "",
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  addresses: [],
  isActive: true,
  notes: "",
};

export default function AdminCustomerPage() {
  const { t } = useI18nNamespace("customer", translations);
  const dispatch = useAppDispatch();

  const customers = useAppSelector((state) => state.customer.customerAdmin);
  const selected = useAppSelector((state) => state.customer.selected);
  const loading = useAppSelector((state) => state.customer.loading);
  const successMessage = useAppSelector((state) => state.customer.successMessage);
  const error = useAppSelector((state) => state.customer.error);

  // Detay modalı state
  const [detailsCustomer, setDetailsCustomer] = useState<ICustomer | null>(null);

  useEffect(() => {
    dispatch(fetchCustomersAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearCustomerMessages());
  }, [successMessage, error, dispatch]);

  const initialValues: ICustomer = useMemo(() => {
    if (selected) return { ...defaultCustomer, ...selected };
    return defaultCustomer;
  }, [selected]);

  // Müşteri kaydet/güncelle
  const handleSubmit = (values: ICustomer) => {
    if (values._id) {
      dispatch(updateCustomerAdmin({ id: values._id, data: values }));
    } else {
      dispatch(createCustomerAdmin(values));
    }
  };

  // Yeni müşteri ekle
  const handleAddNew = () => dispatch(setSelectedCustomer(null));

  // Müşteri seç
  const handleSelectCustomer = (cust: ICustomer) => dispatch(setSelectedCustomer(cust));

  // Müşteri sil
  const handleDeleteCustomer = (id: string) => {
    if (window.confirm(t("deleteConfirm", "Are you sure you want to delete this customer?"))) {
      dispatch(deleteCustomerAdmin(id));
    }
  };

  return (
    <Container>
      <InnerWrapper>
        <Title>{t("title", "Customer Management")}</Title>
        <Grid>
          <ListPanel>
            <PanelHeader>
              <span>{t("customerList", "Customers")}</span>
              <AddButton onClick={handleAddNew}>{t("addNew", "Add New")}</AddButton>
            </PanelHeader>
            <CustomerList>
              {customers
                .filter(Boolean)
                .filter(cust => !!cust && !!cust.companyName)
                .map((cust) => (
                  <CustomerRow
                    key={cust._id}
                    $active={
                      !!selected &&
                      !!selected._id &&
                      !!cust._id &&
                      String(selected._id) === String(cust._id)
                    }
                    onClick={() => handleSelectCustomer(cust)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>
                          {cust.companyName || "-"}
                        </strong>
                        <small>{cust.contactName || "-"}</small>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <EditButton
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setDetailsCustomer(cust);
                          }}
                        >
                          {t("editAddresses", "Adresleri Yönet")}
                        </EditButton>
                        <DeleteButton
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteCustomer(String(cust._id));
                          }}
                        >
                          {t("delete", "Sil")}
                        </DeleteButton>
                      </div>
                    </div>
                  </CustomerRow>
                ))}
            </CustomerList>
          </ListPanel>
          <DetailsPanel>
            {selected && <CustomerInfoCard customer={selected} />}
            <CustomerForm
              initialValues={initialValues}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </DetailsPanel>
        </Grid>
      </InnerWrapper>

      {/* Modal ile adres yönetimi */}
      <Modal isOpen={!!detailsCustomer} onClose={() => setDetailsCustomer(null)}>
        {detailsCustomer && (
          <CustomerDetailsPage
            customer={detailsCustomer}
            // Artık parent’ta fetch zaten otomatik! Ekstra onAddressChanged gerekmez.
          />
        )}
      </Modal>
    </Container>
  );
}

// --- Styled Components ---
const Container = styled.div`
  background: ${({ theme }) => theme.colors.sectionBackground};
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
`;
const InnerWrapper = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  padding: ${({ theme }) => theme.spacings.xl};
  margin: 0 auto;
`;
const Title = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-align: center;
  letter-spacing: 0.02em;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: ${({ theme }) => theme.spacings.xl};
  align-items: flex-start;
  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacings.md};
  }
`;
const ListPanel = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
  min-height: 500px;
  display: flex;
  flex-direction: column;
`;
const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
`;
const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  padding: 6px 16px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
`;
const CustomerList = styled.div`
  flex: 1;
  overflow-y: auto;
`;
const CustomerRow = styled.div<{ $active?: boolean }>`
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.backgroundAlt : "transparent"};
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }
  strong {
    font-size: ${({ theme }) => theme.fontSizes.md};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  small {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-left: 8px;
  }
`;
const EditButton = styled.button`
  margin-left: 8px;
  padding: 4px 12px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  background: ${({ theme }) => theme.colors.info};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.primary}; }
`;
const DeleteButton = styled.button`
  padding: 4px 12px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.error}; }
`;
const DetailsPanel = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;

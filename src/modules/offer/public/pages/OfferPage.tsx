"use client";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchCustomerPublicById,
  updateCustomerPublic,
} from "@/modules/customer/slice/customerSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import styled from "styled-components";
import { AddressForm } from "@/modules/users";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation"; // --- QUERY için

// --- FINAL, PUBLIC, TUTARLI OFFER PAGE ---
export default function OfferPage() {
  // --- 1️⃣ Query param veya user.customerId öncelik sırası ---
  const params = useSearchParams();
  const queryCustomerId = params.get("customerId");
  const { profile: user, loading: userLoading, error: userError } = useAppSelector((state) => state.account);
  const customerId = queryCustomerId || user?.customerId; // 👈 Artık public!

  const { t, i18n } = useI18nNamespace("offer", translations);
  const dispatch = useAppDispatch();
  const { selected: customer, loading, error } = useAppSelector((s) => s.customer);

  // --- 2️⃣ Form state ---
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [updated, setUpdated] = useState(false);

  // --- 3️⃣ customerId değişirse müşteri datası fetch et ---
  useEffect(() => {
    if (customerId) dispatch(fetchCustomerPublicById(customerId));
  }, [customerId, dispatch]);

  // --- 4️⃣ Customer verisi gelince formu doldur ---
  useEffect(() => {
    if (customer) {
      setForm({
        companyName:
          typeof customer.companyName === "object"
            ? customer.companyName?.[i18n.language?.slice(0, 2)] ||
              Object.values(customer.companyName)[0] ||
              ""
            : customer.companyName || "",
        contactName: customer.contactName || "",
        email: customer.email || "",
        phone: customer.phone || "",
      });
    }
  }, [customer, i18n.language]);

  // --- 5️⃣ Form input değişikliği ---
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // --- 6️⃣ Form submit işlemi ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!customerId) throw new Error("Müşteri bulunamadı!");
      await dispatch(
        updateCustomerPublic({
          id: customerId,
          data: {
            companyName: form.companyName,
            contactName: form.contactName,
            email: form.email,
            phone: form.phone,
          },
        })
      ).unwrap();
      setUpdated(true);
      setTimeout(() => setUpdated(false), 1600);
    } catch (err: any) {
      toast.error(
        err?.message || t("error.updateFailed", "Güncelleme başarısız oldu.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  // --- 7️⃣ UI: Durum kontrol ---
  if (userLoading) {
    return <Wrapper>{t("loadingUser", "Kullanıcı kontrol ediliyor...")}</Wrapper>;
  }
  if (!customerId) {
    return <Wrapper>{t("error.unauthorized", "Oturum açmadınız veya müşteri profili bulunamadı.")}</Wrapper>;
  }
  if (userError) {
    return <Wrapper style={{ color: "#b31d1d" }}>{userError}</Wrapper>;
  }
  if (loading && !customer) {
    return <Wrapper>{t("loadingCustomer", "Müşteri bilgileri yükleniyor...")}</Wrapper>;
  }
  if (error && !customer) {
    return <Wrapper style={{ color: "#b31d1d" }}>{error}</Wrapper>;
  }

  // --- 8️⃣ UI: Form render ---
  return (
    <Wrapper>
      <Title>
        {t("completeAddressTitle", "Teklifi Tamamlamak İçin Bilgilerinizi Güncelleyin")}
      </Title>

      <EditForm onSubmit={handleSubmit} autoComplete="off">
        <SectionTitle>{t("summary.title", "Müşteri Bilgisi")}</SectionTitle>
        <Input
          name="companyName"
          placeholder={t("companyName", "Firma Adı")}
          value={form.companyName}
          onChange={handleChange}
          required
        />
        <Input
          name="contactName"
          placeholder={t("contactName", "Yetkili")}
          value={form.contactName}
          onChange={handleChange}
          required
        />
        <Input
          name="email"
          type="email"
          placeholder={t("email", "E-Posta")}
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          name="phone"
          placeholder={t("phone", "Telefon")}
          value={form.phone}
          onChange={handleChange}
          required
        />
        <SubmitBtn type="submit" disabled={submitting}>
          {submitting
            ? t("saving", "Kaydediliyor...")
            : t("saveCustomer", "Bilgileri Kaydet")}
        </SubmitBtn>
        {updated && (
          <SuccessMsg>
            {t("success.customerUpdated", "Müşteri bilgileri güncellendi.")}
          </SuccessMsg>
        )}
      </EditForm>

      <SectionTitle style={{ marginTop: 18 }}>
        {t("addressFormTitle", "Adres Bilgisi")}
      </SectionTitle>
      <AddressForm
        parentType="customer"
        parentId={customerId}
        addresses={customer?.addresses?.filter(
          (a) => typeof a === "object" && a !== null
        )}
        renderAsForm={true}
        loading={false}
      />
    </Wrapper>
  );
}

// --- Styled Components (değişmedi) ---
const Wrapper = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 2.5rem 1rem 4rem 1rem;
  background: ${({ theme }) => theme.colors.sectionBackground};
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Title = styled.h1`
  font-size: 2.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.7rem;
  text-align: center;
`;
const EditForm = styled.form`
  width: 100%;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 2px 12px #23233215;
  padding: 1.3em 1.1em;
  margin-bottom: 1.7em;
  display: flex;
  flex-direction: column;
  gap: 0.7em;
`;
const SectionTitle = styled.h3`
  font-size: 1.13em;
  font-weight: 700;
  margin-bottom: 0.55em;
`;
const Input = styled.input`
  width: 100%;
  padding: 0.83em 1em;
  font-size: 1.06em;
  border-radius: 7px;
  border: 1.3px solid #e2e6ef;
  margin-bottom: 0.45em;
  &:focus {
    border-color: #3a80f7;
    outline: none;
  }
`;
const SubmitBtn = styled.button`
  width: 100%;
  background: #2d72fd;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 0.87em 1em;
  font-size: 1.07em;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 14px #2d72fd22;
  margin-top: 0.6em;
  transition: background 0.18s;
  &:hover {
    background: #2255b7;
  }
`;
const SuccessMsg = styled.div`
  color: #0b933c;
  font-size: 1.08em;
  text-align: center;
  margin-top: 0.7em;
`;

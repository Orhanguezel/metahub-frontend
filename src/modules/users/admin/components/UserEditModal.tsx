// UserEditModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { adminUserTranslations } from "@/modules/users";
import type { User } from "@/modules/users/types/user";
import { useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/modules/users/slice/userCrudSlice";

interface Props {
  user: User;
  onClose: () => void;
}

type FormState = {
  name: string;
  email: string;
  phone: string;
  role: User["role"];
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function UserEditModal({ user, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("adminUser", adminUserTranslations);

  const [form, setForm] = useState<FormState>({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const roleOptions = useMemo<User["role"][]>(
    () => ["user", "customer", "staff", "moderator", "admin"],
    []
  );

  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name?.trim()) next.name = t("form.errors.nameRequired", "İsim zorunlu");
    if (!form.email?.trim()) {
      next.email = t("form.errors.emailRequired", "E-posta zorunlu");
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = t("form.errors.emailInvalid", "Geçerli bir e-posta girin");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      (Object.entries(form) as [keyof FormState, string][]).forEach(([k, v]) =>
        formData.append(k, v ?? "")
      );

      const res = await dispatch(updateUser({ id: user._id, formData })).unwrap();
      toast.success(res?.message || t("users.edit.success", "Kullanıcı güncellendi"));
      onClose();
    } catch (err: any) {
      toast.error(err?.message || t("users.edit.error", "Güncelleme başarısız"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay onClick={onOverlayClick} aria-modal="true" role="dialog" aria-labelledby="edit-user-title">
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title id="edit-user-title">{t("users.edit.title", "Kullanıcıyı Düzenle")}</Title>
          <CloseBtn
            type="button"
            onClick={onClose}
            aria-label={t("actions.close", "Kapat")}
            title={t("actions.close", "Kapat")}
          >
            ×
          </CloseBtn>
        </Header>

        <Form onSubmit={handleSubmit} noValidate>
          <Field>
            <Label htmlFor="name">{t("form.name", "Ad Soyad")}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "err-name" : undefined}
              placeholder={t("form.name.ph", "Örn. Jane Doe")}
            />
            {errors.name && <ErrorText id="err-name">{errors.name}</ErrorText>}
          </Field>

          <Field>
            <Label htmlFor="email">{t("form.email", "E-posta")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "err-email" : undefined}
              placeholder="name@company.com"
            />
            {errors.email && <ErrorText id="err-email">{errors.email}</ErrorText>}
          </Field>

          <Field>
            <Label htmlFor="phone">{t("form.phone", "Telefon")}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder={t("form.phone.ph", "+49 170 000000")}
            />
          </Field>

          <Field>
            <Label htmlFor="role">{t("form.role", "Rol")}</Label>
            <Select id="role" name="role" value={form.role} onChange={handleChange}>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {t(`roles.${r}`, r)}
                </option>
              ))}
            </Select>
          </Field>

          <Actions>
            <Ghost type="button" onClick={onClose} disabled={submitting}>
              {t("actions.cancel", "İptal")}
            </Ghost>
            <Primary type="submit" disabled={submitting}>
              {submitting ? t("actions.saving", "Kaydediliyor…") : t("actions.save", "Kaydet")}
            </Primary>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
}

/* ===================== styles ===================== */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayBackground};
  display: grid;
  place-items: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  padding: ${({ theme }) => theme.spacings.md};
`;

const Modal = styled.div`
  width: min(640px, 100%);
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderBright};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  padding: ${({ theme }) => theme.spacings.xl};
  ${(({ theme }) => theme.media.small)} {
    padding: ${({ theme }) => theme.spacings.lg};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
`;

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.title};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const CloseBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.circle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: filter 0.15s, transform 0.05s, box-shadow 0.15s;
  &:hover { filter: brightness(0.98); }
  &:active { transform: translateY(1px); }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacings.md};
  ${(({ theme }) => theme.media.small)} {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 6px;
`;

const baseField = `
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
`;

const Input = styled.input`
  ${baseField}
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  border: 1px solid ${({ theme }) => theme.inputs.border};
  ::placeholder { color: ${({ theme }) => theme.colors.placeholder}; }
  &:focus {
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
  &[aria-invalid="true"] {
    border-color: ${({ theme }) => theme.colors.danger};
  }
`;

const Select = styled.select`
  ${baseField}
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  border: 1px solid ${({ theme }) => theme.inputs.border};
  &:focus {
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const ErrorText = styled.small`
  color: ${({ theme }) => theme.colors.danger};
  margin-top: 6px;
`;

const Actions = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacings.md};
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const BaseBtn = styled.button`
  height: 42px;
  padding: 0 ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  transition: filter .15s, transform .05s, box-shadow .15s, background .15s, border-color .15s;
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

const Primary = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border-color: ${({ theme }) => theme.buttons.primary.background};
  &:hover { filter: brightness(0.98); }
`;

const Ghost = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border-color: ${({ theme }) => theme.buttons.secondary.background};
  &:hover { filter: brightness(0.98); }
`;

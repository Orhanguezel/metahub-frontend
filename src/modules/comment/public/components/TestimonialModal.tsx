import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createComment } from "@/modules/comment/slice/commentSlice";
import styled from "styled-components";

export default function TestimonialModal({
  open, onClose, t, afterSubmit
}: {
  open: boolean;
  onClose: () => void;
  t: any;
  lang: string;
  contentType: string;
  contentId: string;
  afterSubmit: () => void;
}) {

  const CONTENT_TYPE = "about";
  const CONTENT_ID = "000000000000000000000000";

  const dispatch = useAppDispatch();
  const router = useRouter();
  const profile = useAppSelector((s) => s.account.profile);
  const [form, setForm] = useState({ label: "", text: "" });
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!form.text) {
      setFormError(t("form.required", "Lütfen yorumunuzu yazın."));
      return;
    }
    if (!profile) {
      setFormError(t("form.loginFirst", "Yorum bırakmak için giriş yapmalısınız."));
      router.push("/login");
      return;
    }
    setSending(true);
    try {
      await dispatch(
        createComment({
          name: profile?.name ?? "",
          profileImage: profile?.profileImage ?? "",
          company: profile?.company ?? "",
          position: profile?.position ?? "",
          email: profile?.email ?? "",
          comment: form.text,
          label: form.label,
          type: "testimonial",
          contentType: CONTENT_TYPE,
          contentId: CONTENT_ID,
          recaptchaToken: "", // ReCAPTCHA entegrasyonu eklenebilir
          isPublished: false,
          isActive: true,
        })
      ).unwrap();

      setFormSuccess(t("form.success", "Yorumunuz başarıyla gönderildi! Onaylandıktan sonra yayınlanacaktır."));
      setForm({ label: "", text: "" });
      onClose();
      afterSubmit();
    } catch (err: any) {
      setFormError(err?.message || t("form.error", "Bir hata oluştu. Lütfen tekrar deneyin."));
    }
    setSending(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <ModalOverlay
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <FormTitle>{t("form.title", "Yorumunuzu Bırakın")}</FormTitle>
            <TestimonialForm onSubmit={handleSubmit} autoComplete="off">
              <Input
                type="text"
                name="label"
                value={form.label}
                onChange={handleFormChange}
                placeholder={t("form.label", "Başlık/Unvan (opsiyonel)")}
                disabled={sending}
                maxLength={60}
                autoComplete="off"
              />
              <TextArea
                name="text"
                value={form.text}
                onChange={handleFormChange}
                required
                rows={3}
                placeholder={t("form.text", "Yorumunuz")}
                disabled={sending}
                maxLength={240}
                autoComplete="off"
              />
              <SubmitButton type="submit" disabled={sending}>
                {sending
                  ? t("form.sending", "Gönderiliyor...")
                  : t("form.submit", "Gönder")}
              </SubmitButton>
            </TestimonialForm>
            {formSuccess && <FormSuccess>{formSuccess}</FormSuccess>}
            {formError && <FormError>{formError}</FormError>}
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
}

// --- Styled Components (tam ortalı ve responsive!) ---

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: 2.4rem 2.2rem;
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  min-width: 330px;
  max-width: 96vw;
  width: 410px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;

  @media (max-width: 600px) {
    padding: 1.3rem 0.8rem;
    min-width: unset;
    width: 98vw;
    max-width: 98vw;
  }
`;

const FormTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 1.2rem;
  text-align: center;
  width: 100%;
`;

const TestimonialForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.08em;
  width: 100%;
`;

const Input = styled.input`
  border: 1.5px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: 0.7em 0.95em;
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-family: inherit;
  margin-bottom: 0.12em;
  width: 100%;
  transition: border-color 0.18s;
  &:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    outline: none;
  }
`;

const TextArea = styled.textarea`
  border: 1.5px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: 0.7em 0.95em;
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-family: inherit;
  resize: none;
  text-align: center;
  min-height: 90px;
  width: 100%;
  transition: border-color 0.18s;
  &:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    outline: none;
  }
`;

const SubmitButton = styled.button`
  padding: 0.85em 1.8em;
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-top: 0.7em;
  transition: background 0.15s, color 0.12s;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  &:hover, &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    opacity: ${({ theme }) => theme.opacity.hover};
    text-align: center;
  }
  width: 100%;
`;

const FormSuccess = styled.div`
  color: ${({ theme }) => theme.colors.success};
  margin-top: 1.1em;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-align: center;
`;

const FormError = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-top: 1.1em;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-align: center;
`;


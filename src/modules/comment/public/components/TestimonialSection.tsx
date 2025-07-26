"use client";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useMemo, useState, useEffect, useCallback } from "react";
import { MdStars } from "react-icons/md";
import { useRouter } from "next/navigation";
import { SupportedLocale } from "@/types/common";
import { createComment, fetchCommentsForContent } from "@/modules/comment/slice/commentSlice";
import { AnimatePresence, motion } from "framer-motion";
import { getImageSrc } from "@/shared/getImageSrc";


function resolveProfileImage(img: any): string {
  if (!img) return "/defaults/profile-thumbnail.png";
  if (typeof img === "object" && img !== null) {
    if (img.thumbnail && typeof img.thumbnail === "string" && img.thumbnail.startsWith("http"))
      return img.thumbnail;
    if (img.url && typeof img.url === "string" && img.url.startsWith("http"))
      return img.url;
    return getImageSrc(img.thumbnail || img.url || "", "profile");
  }
  if (typeof img === "string") {
    if (!img.trim()) return "/defaults/profile-thumbnail.png";
    if (img.startsWith("http")) return img;
    return getImageSrc(img, "profile");
  }
  return "/defaults/profile-thumbnail.png";
}

export default function TestimonialSection() {
  const { i18n, t } = useI18nNamespace("testimonial", translations3);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { profile } = useAppSelector((state) => state.account);

  // Varsayılan about içeriği (gerekirse prop olarak da alabilirsin)
  const CONTENT_TYPE = "about";
  const CONTENT_ID = "000000000000000000000000";

  // --- İlk render’da yorumları çek ---
  useEffect(() => {
    dispatch(
      fetchCommentsForContent({
        type: CONTENT_TYPE,
        id: CONTENT_ID,
        commentType: "testimonial",
      })
    );
  }, [dispatch]);

  // Sadece ilk 6 yayınlanmış testimonial
  const allComments = useAppSelector((state) => state.comments.comments);
  const testimonials = useMemo(
    () =>
      Array.isArray(allComments)
        ? allComments
            .filter((c: any) => c.type === "testimonial" && c.isPublished)
            .slice(0, 6)
        : [],
    [allComments]
  );

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ label: "", text: "" });
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // --- Modal aç/login yönlendirme ---
  const handleOpenModal = useCallback(() => {
    if (!profile) {
      router.push("/login");
      return;
    }
    setShowModal(true);
  }, [profile, router]);

  // --- Form input değişikliği ---
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // --- Form submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!form.text) {
      setFormError(t("form.required", "Lütfen yorumunuzu yazın."));
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
          isPublished: false,
          isActive: true,
        })
      ).unwrap();
      setFormSuccess(t("form.success", "Yorumunuz başarıyla gönderildi! Onaylandıktan sonra yayınlanacaktır."));
      setForm({ label: "", text: "" });
      setShowModal(false);
      // Ekledikten sonra tekrar fetch et (en güncel liste!)
      dispatch(
        fetchCommentsForContent({
          type: CONTENT_TYPE,
          id: CONTENT_ID,
          commentType: "testimonial",
        })
      );
    } catch (err: any) {
      setFormError(err?.message || t("form.error", "Bir hata oluştu. Lütfen tekrar deneyin."));
    }
    setSending(false);
  };

  // Çok dilli alan getter
  const getLangField = (field: any) =>
    typeof field === "object" && field
      ? field[lang] || field.tr || field.en || Object.values(field)[0] || ""
      : field || "";

  return (
    <Section>
      <SectionTitle>
        <MdStars size={28} style={{ verticalAlign: "middle" }} />
        <span>{t("sectionTitle", "Testimonials")}</span>
      </SectionTitle>
      <SectionDesc>
        {t(
          "sectionDesc",
          "Kullanıcılarımızdan gelen gerçek yorumlar. Siz de yorum bırakmak için giriş yapın."
        )}
      </SectionDesc>

      <CardsGrid>
        {testimonials.map((item, idx) => (
          <Card key={item._id || idx}>
            <CardHeader>
              <Avatar
                src={resolveProfileImage(item.profileImage)}
                alt={getLangField(item.name) || "Anonim"}
                loading="lazy"
                width={62}
                height={62}
              />
              <CardHeaderText>
                <CardName>{getLangField(item.name) || t("anon", "Anonim")}</CardName>
                <CardTitle>
                  {getLangField(item.company) ||
                    getLangField(item.label) ||
                    ""}
                </CardTitle>
              </CardHeaderText>
            </CardHeader>
            <CardBody>
              <Quote>
                &quot;{getLangField(item.text)}&quot;
              </Quote>
            </CardBody>
          </Card>
        ))}
        <AddCard>
          <AddButton onClick={handleOpenModal}>
            {t("form.addTestimonial", "Yorum Yaz")}
          </AddButton>
        </AddCard>
      </CardsGrid>

      <AnimatePresence>
        {showModal && (
          <ModalOverlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <FormTitle>{t("form.title", "Yorumunuzu Bırakın")}</FormTitle>
              <TestimonialForm onSubmit={handleSubmit}>
                <label>
                  {t("form.label", "Başlık/Unvan (opsiyonel)")}
                  <input
                    type="text"
                    name="label"
                    value={form.label}
                    onChange={handleFormChange}
                    disabled={sending}
                  />
                </label>
                <label>
                  {t("form.text", "Yorumunuz")}
                  <textarea
                    name="text"
                    value={form.text}
                    onChange={handleFormChange}
                    required
                    rows={4}
                    disabled={sending}
                  />
                </label>
                <SubmitButton type="submit" disabled={sending}>
                  {sending
                    ? t("form.sending", "Gönderiliyor...")
                    : t("form.submit", "Gönder")}
                </SubmitButton>
                {formSuccess && <FormSuccess>{formSuccess}</FormSuccess>}
                {formError && <FormError>{formError}</FormError>}
              </TestimonialForm>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Section>
  );
}

// ---- Styles (theme ve responsive ile tam uyumlu) ----

const Section = styled.section`
  background: ${({ theme }) => theme.colors.achievementBackground};
  padding: ${({ theme }) => theme.spacings.xxl} 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.h2};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  text-align: center;
  margin-bottom: 0.4em;
`;

const SectionDesc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.main};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  text-align: center;
  margin-bottom: 2.4rem;
  max-width: 700px;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
  gap: ${({ theme }) => theme.spacings.xl};
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 2.7rem auto;
  align-items: stretch;

  ${({ theme }) => theme.media.small} {
    gap: ${({ theme }) => theme.spacings.lg};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1.9rem 2rem 1.9rem;
  min-width: 0;
  transition: box-shadow 0.17s;
  &:hover {
    box-shadow: 0 16px 44px 0 rgba(40,117,194,0.09);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.1em;
  margin-bottom: 1.15em;
  width: 100%;
`;

const Avatar = styled.img`
  width: 62px;
  height: 62px;
  border-radius: ${({ theme }) => theme.radii.circle};
  border: 2.5px solid ${({ theme }) => theme.colors.primary};
  object-fit: cover;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const CardHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.14em;
`;

const CardName = styled.span`
  color: ${({ theme }) => theme.colors.primaryDark};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  letter-spacing: 0.01em;
`;

const CardTitle = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.main};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const CardBody = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
`;

const Quote = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  text-align: left;
  margin: 0;
`;

const AddCard = styled(Card)`
  min-height: 210px;
  justify-content: center;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 2px dashed ${({ theme }) => theme.colors.primary};
  box-shadow: none;
  cursor: pointer;
  transition: border 0.2s, background 0.2s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryHover};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
  }
`;

const AddButton = styled.button`
  padding: 1em 2.6em;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background 0.14s;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`;

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
  padding: 2.5rem 2.3rem;
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  min-width: 320px;
  max-width: 96vw;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const FormTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 1.2rem;
`;

const TestimonialForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.08em;
  width: 100%;
  label {
    font-size: ${({ theme }) => theme.fontSizes.base};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    margin-bottom: 0.22em;
    font-family: ${({ theme }) => theme.fonts.main};
  }
  input, textarea {
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
    border-radius: ${({ theme }) => theme.radii.sm};
    font-size: ${({ theme }) => theme.fontSizes.base};
    padding: 0.85em 0.85em;
    margin-top: 0.32em;
    background: ${({ theme }) => theme.colors.inputBackground};
    font-family: inherit;
    resize: none;
    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
      outline: none;
    }
  }
`;

const SubmitButton = styled.button`
  padding: 0.83em 1.7em;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  margin-top: 0.7em;
  transition: background 0.15s;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`;

const FormSuccess = styled.div`
  color: ${({ theme }) => theme.colors.success};
  margin-top: 1.1em;
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const FormError = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-top: 1.1em;
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

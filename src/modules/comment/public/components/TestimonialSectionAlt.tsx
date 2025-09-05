"use client";

import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/comment/locales";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useMemo, useState, useCallback, useEffect } from "react";
import { MdStars, MdStar, MdStarBorder } from "react-icons/md";
import { useRouter } from "next/navigation";
import type { SupportedLocale } from "@/types/common";
import type { IComment } from "@/modules/comment/types";
import {
  createComment,
  fetchTestimonialsPublic,
  selectTestimonials,
} from "@/modules/comment/slice/slice";
import { AnimatePresence, motion } from "framer-motion";
import { resolveProfileImage } from "@/shared/resolveProfileImage";

export default function TestimonialSectionAlt() {
  const { i18n, t } = useI18nNamespace("comment", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "tr";

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { profile } = useAppSelector((state) => state.account);

  // Public testimonials (max 6)
  useEffect(() => {
    dispatch(fetchTestimonialsPublic({ page: 1, limit: 6 }));
  }, [dispatch]);

  const source = useAppSelector(selectTestimonials);

  // çalışan pattern + slice(0,6)
  const testimonials = useMemo<IComment[]>(
    () =>
      (Array.isArray(source) ? source : [])
        .filter((c) => (c?.type ? c.type === "testimonial" : true))
        .filter((c) => c?.isPublished !== false)
        .slice(0, 6),
    [source]
  );

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ label: "", text: "" });
  const [rating, setRating] = useState<number>(0); // ⭐
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleOpenModal = useCallback(() => {
    if (!profile) {
      router.push("/login");
      return;
    }
    setShowModal(true);
  }, [profile, router]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!form.text?.trim()) {
      setFormError(t("form.required", "Lütfen yorumunuzu yazın."));
      return;
    }
    setSending(true);

    try {
      await dispatch(
        createComment({
          name: profile?.name ?? "",
          profileImage: profile?.profileImage ?? "",
          company: (profile as any)?.company ?? "",
          position: (profile as any)?.position ?? "",
          email: profile?.email ?? "",
          comment: form.text,
          label: form.label,
          type: "testimonial",
          contentType: "global", // testimonial → global, contentId yok
          isPublished: false,
          isActive: true,
          ...(rating > 0 ? { rating } : {}),
        })
      ).unwrap();

      setFormSuccess(
        t("form.success", "Yorumunuz başarıyla gönderildi! Onaylandıktan sonra yayınlanacaktır.")
      );
      setForm({ label: "", text: "" });
      setRating(0);
      setShowModal(false);

      // Listeyi yenile
      dispatch(fetchTestimonialsPublic({ page: 1, limit: 6 }));
    } catch (err: any) {
      setFormError(err?.message || t("form.error", "Bir hata oluştu. Lütfen tekrar deneyin."));
    }
    setSending(false);
  };

  // Çok dilli/sade alan getter
  const getLangField = (field: any) =>
    typeof field === "object" && field
      ? field[lang] || field.tr || field.en || Object.values(field)[0] || ""
      : field || "";

  // Tarih normalize
  const fmtDate = (v: any) => {
    const raw = typeof v === "string" ? v : v?.$date || v?.toString?.();
    const d = raw ? new Date(raw) : null;
    return d && !isNaN(d.valueOf()) ? d.toLocaleString() : "";
  };

  return (
    <Section>
      <SectionHeader>
        <TitleLine>
          <StarIcon aria-hidden="true" />
          <Title>{t("sectionTitle", "Testimonials")}</Title>
        </TitleLine>
        <SectionDesc>
          {t("sectionDesc", "Kullanıcılarımızdan gelen gerçek yorumlar. Siz de yorum bırakmak için giriş yapın.")}
        </SectionDesc>
      </SectionHeader>

      <CardsGrid>
        {testimonials.map((item, idx) => {
          const key = item._id || `${item.email || "anon"}-${idx}`;
          const replyText =
            (item.reply?.text &&
              (item.reply.text[lang] || item.reply.text.tr || item.reply.text.en)) ||
            null;

          const ratingVal = typeof item.rating === "number" ? item.rating : 0;

          return (
            <Card key={key}>
              <CardHeader>
                <Avatar
                  src={resolveProfileImage(item.profileImage, "profile")}
                  alt={getLangField(item.name) || "Anonim"}
                  loading="lazy"
                  width={62}
                  height={62}
                />
                <HeaderText>
                  <CardName>{getLangField(item.name) || t("anon", "Anonim")}</CardName>
                  <CardMeta>
                    {getLangField((item as any).company) || getLangField(item.label) || ""}
                    {item.createdAt ? <DateDot>· {fmtDate(item.createdAt)}</DateDot> : null}
                  </CardMeta>
                </HeaderText>
              </CardHeader>

              {/* ⭐ rating göster */}
              {ratingVal > 0 && (
                <StarsRow title={`${ratingVal}/5`} aria-label={`${ratingVal} / 5`}>
                  {[1, 2, 3, 4, 5].map((n) =>
                    ratingVal >= n ? <MdStar key={n} size={18} /> : <MdStarBorder key={n} size={18} />
                  )}
                  <StarsValue>{ratingVal}/5</StarsValue>
                </StarsRow>
              )}

              <CardBody>
                <Quote>&quot;{getLangField(item.text)}&quot;</Quote>

                {replyText ? (
                  <ReplyBlock>
                    <ReplyTitle>{t("admin.reply", "Yanıt")}</ReplyTitle>
                    <ReplyText>{replyText}</ReplyText>
                    {item.reply?.createdAt ? <ReplyDate>{fmtDate(item.reply.createdAt)}</ReplyDate> : null}
                  </ReplyBlock>
                ) : null}
              </CardBody>
            </Card>
          );
        })}

        <AddCard>
          <AddButton
            type="button"
            onClick={handleOpenModal}
            aria-label={t("form.addTestimonial", "Yorum Yaz")}
          >
            {t("form.addTestimonial", "Yorum Yaz")}
          </AddButton>
        </AddCard>
      </CardsGrid>

      {/* Modal */}
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

                {/* ⭐ Rating alanı */}
                <FieldBlock>
                  <FieldLabel htmlFor="rating-stars">
                    {t("rating", "Değerlendirme")}{" "}
                    <small style={{ opacity: 0.7 }}>({t("optional", "opsiyonel")})</small>
                  </FieldLabel>
                  <StarsWrap
                    id="rating-stars"
                    role="radiogroup"
                    aria-label={t("rating", "Değerlendirme")}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight") setRating((r) => Math.min(5, r + 1));
                      if (e.key === "ArrowLeft") setRating((r) => Math.max(0, r - 1));
                      if (e.key === "Home") setRating(1);
                      if (e.key === "End") setRating(5);
                      if (e.key === "Escape") setRating(0);
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((n) => {
                      const filled = rating >= n;
                      return (
                        <StarButton
                          key={n}
                          type="button"
                          role="radio"
                          aria-label={`${n} ${t("stars", "yıldız")}`}
                          aria-checked={filled}
                          onClick={() => setRating(n === rating ? 0 : n)}
                        >
                          {filled ? <MdStar size={22} /> : <MdStarBorder size={22} />}
                        </StarButton>
                      );
                    })}
                    <RatingValue>{rating > 0 ? `${rating}/5` : t("optional", "opsiyonel")}</RatingValue>
                  </StarsWrap>
                </FieldBlock>

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
                  {sending ? t("form.sending", "Gönderiliyor...") : t("form.submit", "Gönder")}
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

/* ----------------------- Styles (eksiksiz) ----------------------- */

const Section = styled.section`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xxl};
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background-color ${({ theme }) => theme.transition.fast},
    color ${({ theme }) => theme.transition.fast};
  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.xl} 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${({ theme }) => theme.spacings.sm} 0 ${({ theme }) => theme.spacings.md};
`;

const TitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const StarIcon = styled(MdStars)`
  width: 28px;
  height: 28px;
  color: ${({ theme }) => theme.colors.primary};
  flex: 0 0 auto;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  letter-spacing: -0.01em;
  line-height: 1.13;
  margin: 0;
  font-size: clamp(2.1rem, 3.2vw, 2.7rem);
`;

const SectionDesc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  text-align: center;
  margin: 0.8rem;
  max-width: 720px;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(260px, 40vw, 330px), 1fr));
  gap: ${({ theme }) => theme.spacings.xl};
  width: 100%;
  max-width: 1200px;
  margin: 0 auto ${({ theme }) => theme.spacings.xl} auto;
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
  padding: 2.2rem 1.8rem 1.9rem 1.8rem;
  min-width: 0;
  transition: box-shadow ${({ theme }) => theme.transition.fast},
    transform ${({ theme }) => theme.transition.fast};
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => `${theme.shadows.lg}, ${theme.colors.shadowHighlight}`};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.1em;
  margin-bottom: 1.1em;
  width: 100%;
`;

const Avatar = styled.img`
  width: 62px;
  height: 62px;
  border-radius: ${({ theme }) => theme.radii.circle};
  border: 2px solid ${({ theme }) => theme.colors.borderHighlight};
  object-fit: cover;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  flex: 0 0 auto;
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.14em;
`;

const CardName = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  letter-spacing: 0.01em;
`;

const CardMeta = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  letter-spacing: 0.03em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  flex-wrap: wrap;
`;

const DateDot = styled.span`
  opacity: 0.7;
  font-weight: normal;
  text-transform: none;
`;

const StarsRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 4px 0 8px 0;
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StarsValue = styled.small`
  margin-left: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const CardBody = styled.div`
  width: 100%;
`;

const Quote = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0;
`;

/* Admin reply */
const ReplyBlock = styled.div`
  margin-top: 0.75rem;
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 0.6rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
`;

const ReplyTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 0.25rem;
`;

const ReplyText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.55;
`;

const ReplyDate = styled.div`
  margin-top: 0.25rem;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const AddCard = styled(Card)`
  justify-content: center;
  align-items: center;
  min-height: 210px;
  box-shadow: none;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 2px dashed ${({ theme }) => theme.colors.borderHighlight};
  transition: background ${({ theme }) => theme.transition.fast},
    border-color ${({ theme }) => theme.transition.fast};
  &:hover {
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    border-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const AddButton = styled.button`
  padding: 1em 2.4em;
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background ${({ theme }) => theme.transition.fast},
    transform ${({ theme }) => theme.transition.fast};
  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    transform: translateY(-1px);
    outline: none;
  }
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
  color: ${({ theme }) => theme.colors.text};
  padding: 2.4rem 2.1rem;
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  min-width: 320px;
  max-width: min(680px, 96vw);
  width: 100%;
`;

const FormTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.title};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin: 0 0 1rem 0;
`;

const TestimonialForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  label {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.base};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    margin-bottom: 0.25rem;
    font-family: ${({ theme }) => theme.fonts.body};
  }

  input,
  textarea {
    width: 100%;
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
    border-radius: ${({ theme }) => theme.radii.md};
    font-size: ${({ theme }) => theme.fontSizes.base};
    padding: 0.85em;
    background: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
    transition: border-color ${({ theme }) => theme.transition.fast},
      background ${({ theme }) => theme.transition.fast};
  }

  input:focus,
  textarea:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }
`;

const FieldBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const StarsWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
  outline: none;
`;

const StarButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  cursor: pointer;
`;

const RatingValue = styled.span`
  margin-left: 6px;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SubmitButton = styled.button`
  padding: 0.83em 1.6em;
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-top: 0.6rem;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background ${({ theme }) => theme.transition.fast},
    transform ${({ theme }) => theme.transition.fast};
  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    transform: translateY(-1px);
    outline: none;
  }
`;

const FormSuccess = styled.div`
  color: ${({ theme }) => theme.colors.success};
  margin-top: 1rem;
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const FormError = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-top: 1rem;
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

"use client";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/comment/locales";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useMemo, useState, useCallback } from "react";
import { MdStars, MdStar, MdStarBorder } from "react-icons/md";
import { useRouter } from "next/navigation";
import type { SupportedLocale } from "@/types/common";
import {
  createComment,
  selectCommentsFor,
} from "@/modules/comment/slice/slice";
import { AnimatePresence, motion } from "framer-motion";
import { resolveProfileImage } from "@/shared/resolveProfileImage";

// ----- DUMMY TESTIMONIALS -----
const DUMMY_TESTIMONIALS = [
  {
    _id: "dummy-1",
    name: { tr: "Ayşe Demir", en: "Ayşe Demir" },
    company: { tr: "Apartman Yöneticisi", en: "Apartment Manager" },
    label: { tr: "Yönetici", en: "Manager" },
    profileImage: "https://randomuser.me/api/portraits/women/41.jpg",
    text: {
      tr: "Güzel Temizlik ile merdiven ve ortak alan temizliğimiz kusursuz. Ekipleri güvenilir ve titiz çalışıyor.",
      en: "Cleaning of stairs and common areas is flawless with Güzel Temizlik. The team is trustworthy and meticulous.",
      de: "Die Treppen- und Gemeinschaftsreinigung mit Güzel Temizlik ist einwandfrei. Das Team arbeitet zuverlässig und gründlich.",
      pl: "Sprzątanie klatek i części wspólnych z Güzel Temizlik to najwyższy poziom. Zespół jest godny zaufania i dokładny.",
      fr: "Le nettoyage des escaliers et des parties communes est impeccable avec Güzel Temizlik. L'équipe est fiable et minutieuse.",
      es: "La limpieza de escaleras y áreas comunes es impecable con Güzel Temizlik. El equipo es confiable y meticuloso.",
    },
    isPublished: true,
    type: "testimonial",
    rating: 5,
  },
  {
    _id: "dummy-2",
    name: { tr: "Mehmet Yıldız", en: "Mehmet Yıldız" },
    company: { tr: "Site Yöneticisi", en: "Site Manager" },
    label: { tr: "Yönetici", en: "Manager" },
    profileImage: "https://randomuser.me/api/portraits/men/66.jpg",
    text: {
      tr: "Düzenli ve sürdürülebilir temizlik için ilk tercihimiz oldular. Apartman sakinleri çok memnun.",
      en: "They became our first choice for regular and sustainable cleaning. All residents are very satisfied.",
      de: "Für regelmäßige und nachhaltige Reinigung sind sie unsere erste Wahl. Die Bewohner sind sehr zufrieden.",
      pl: "Są naszym pierwszym wyborem do regularnego i zrównoważonego sprzątania. Wszyscy mieszkańcy są bardzo zadowoleni.",
      fr: "Ils sont devenus notre premier choix pour un nettoyage régulier et durable. Tous les résidents sont ravis.",
      es: "Se convirtieron en nuestra primera opción para limpieza regular y sostenible. Todos los residentes están muy satisfechos.",
    },
    isPublished: true,
    type: "testimonial",
    rating: 4,
  },
  {
    _id: "dummy-3",
    name: { tr: "Elif Kaya", en: "Elif Kaya" },
    company: { tr: "Apartman Yöneticisi", en: "Apartment Manager" },
    label: { tr: "Yönetici", en: "Manager" },
    profileImage: "https://randomuser.me/api/portraits/women/71.jpg",
    text: {
      tr: "Fiyatları şeffaf ve her zaman ulaşılabilirler. Her seferinde beklediğimizden daha iyi hizmet aldık.",
      en: "Their pricing is transparent and they are always accessible. We always received better service than expected.",
      de: "Die Preise sind transparent und sie sind immer erreichbar. Der Service war stets besser als erwartet.",
      pl: "Ceny są przejrzyste, zawsze dostępni. Obsługa zawsze przerosła nasze oczekiwania.",
      fr: "Leurs prix sont transparents et ils sont toujours joignables. Nous avons toujours reçu un service au-delà de nos attentes.",
      es: "Sus precios son transparentes y siempre están disponibles. Siempre recibimos un servicio mejor de lo esperado.",
    },
    isPublished: true,
    type: "testimonial",
    rating: 5,
  },
];

export default function TestimonialSection() {
  const { i18n, t } = useI18nNamespace("comment", translations);
  const lang = i18n.language?.slice(0, 2) as SupportedLocale;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { profile } = useAppSelector((state) => state.account);

  // --- Varsayılan About içeriği ---
  const CONTENT_TYPE = "about" as const;
  const CONTENT_ID = "000000000000000000000000";

  // ✅ Parent fetch ediyor: store’dan oku (keyed selector > legacy)
  const keyed = useAppSelector((s) =>
    selectCommentsFor(s, {
      type: CONTENT_TYPE,
      id: CONTENT_ID,
      commentType: "testimonial",
    })
  );
  const legacy = useAppSelector((s) => s.comments?.comments ?? []);
  const source: any[] = (
    Array.isArray(keyed) && keyed.length ? keyed : legacy
  ) as any[];

  // --- Fallback: Dummy testimonial ---
  const testimonials = useMemo(() => {
    const published = (source || []).filter(
      (c) => c?.type === "testimonial" && c?.isPublished === true
    );
    return (published.length ? published : DUMMY_TESTIMONIALS).slice(0, 6);
  }, [source]);

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ label: "", text: "" });
  const [rating, setRating] = useState<number>(0); // ⭐ puan
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
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // ⭐ Klavye ile rating ayarı
  const handleKeyRating = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") setRating((r) => Math.min(5, r + 1));
    if (e.key === "ArrowLeft") setRating((r) => Math.max(0, r - 1));
    if (e.key === "Home") setRating(1);
    if (e.key === "End") setRating(5);
    if (e.key === "Escape") setRating(0);
  };

  // --- Form submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!form.text.trim()) {
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
          ...(rating > 0 ? { rating } : {}), // 0 ise gönderme
        })
      ).unwrap();
      setFormSuccess(
        t(
          "form.success",
          "Yorumunuz başarıyla gönderildi! Onaylandıktan sonra yayınlanacaktır."
        )
      );
      setForm({ label: "", text: "" });
      setRating(0);
      setShowModal(false);
      // ❌ Ek fetch yok; parent hallediyor.
    } catch (err: any) {
      setFormError(
        err?.message ||
          t("form.error", "Bir hata oluştu. Lütfen tekrar deneyin.")
      );
    }
    setSending(false);
  };

  // --- Çok dilli alan getter ---
  const getLangField = (field: any) =>
    typeof field === "object" && field
      ? field[lang] || field.tr || field.en || Object.values(field)[0] || ""
      : field || "";

  return (
    <Section>
      <SectionTitle>
        <MdStars size={28} style={{ marginRight: 10 }} />
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
                src={resolveProfileImage(item.profileImage, "profile")}
                alt={getLangField(item.name) || "Anonim"}
                loading="lazy"
                width={62}
                height={62}
              />
              <CardHeaderText>
                <CardName>
                  {getLangField(item.name) || t("anon", "Anonim")}
                </CardName>
                <CardTitle>
                  {getLangField(item.company) || getLangField(item.label) || ""}
                </CardTitle>
              </CardHeaderText>
            </CardHeader>

            {/* ⭐ Kartta rating varsa göster */}
            {typeof (item as any).rating === "number" &&
              (item as any).rating > 0 && (
                <StarsRow title={`${(item as any).rating}/5`}>
                  {[1, 2, 3, 4, 5].map((n) =>
                    (item as any).rating >= n ? (
                      <MdStar key={n} size={18} />
                    ) : (
                      <MdStarBorder key={n} size={18} />
                    )
                  )}
                  <StarsValue>{(item as any).rating}/5</StarsValue>
                </StarsRow>
              )}

            <CardBody>
              <Quote>&quot;{getLangField(item.text)}&quot;</Quote>
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

                {/* ⭐ Rating alanı */}
                <FieldBlock>
                  <FieldLabel htmlFor="rating-stars">
                    {t("rating", "Değerlendirme")}{" "}
                    <small style={{ opacity: 0.7 }}>
                      ({t("optional", "opsiyonel")})
                    </small>
                  </FieldLabel>
                  <StarsWrap
                    id="rating-stars"
                    role="radiogroup"
                    aria-label={t("rating", "Değerlendirme")}
                    tabIndex={0}
                    onKeyDown={handleKeyRating}
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
                          {filled ? (
                            <MdStar size={22} />
                          ) : (
                            <MdStarBorder size={22} />
                          )}
                        </StarButton>
                      );
                    })}
                    <RatingValue>
                      {rating > 0 ? `${rating}/5` : t("optional", "opsiyonel")}
                    </RatingValue>
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

/* ----------------------- Styles ----------------------- */

const Section = styled.section`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacings.xxl} 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.36em;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.h2};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  text-align: center;
  margin-bottom: 0.4em;

  svg {
    display: inline-block;
    margin-bottom: 0.06em;
    @media (max-width: 600px) {
      width: 1.5em;
      height: 1.5em;
    }
  }

  @media (max-width: 700px) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    gap: 0.25em;
  }
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
    box-shadow: 0 16px 44px 0 rgba(40, 117, 194, 0.09);
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
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background 0.14s;
  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
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

    &:focus {
      border-color: ${({ theme }) => theme.colors.inputBorderFocus};
      background: ${({ theme }) => theme.colors.inputBackgroundFocus};
      outline: none;
      box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    }
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
  padding: 0.83em 1.7em;
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  margin-top: 0.7em;
  transition: background 0.15s;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
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

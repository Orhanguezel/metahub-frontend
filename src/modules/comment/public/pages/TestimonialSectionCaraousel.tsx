"use client";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/comment/locales";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  MdStars,
  MdArrowBackIos,
  MdArrowForwardIos,
  MdFormatQuote,
  MdAddComment,
  MdStar,
  MdStarBorder,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import type { SupportedLocale } from "@/types/common";
import {
  createComment,
  fetchTestimonialsPublic,
  selectTestimonials,
} from "@/modules/comment/slice/slice";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { resolveProfileImage } from "@/shared/resolveProfileImage";

export default function TestimonialSection() {
  const { i18n, t } = useI18nNamespace("comment", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "tr";
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { profile } = useAppSelector((s) => s.account);
  const loading = useAppSelector((s) => s.comments.loading);
  const error = useAppSelector((s) => s.comments.error);

  // ✅ Public testimonials (BE: /comment/testimonials) — merkezde aktif kart ile 3'lü carousel
  useEffect(() => {
    dispatch(fetchTestimonialsPublic({ page: 1, limit: 12 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const source = useAppSelector(selectTestimonials);

  // Çalışan liste paternini kullan: yayınlanmış olanları al, boşsa []
  const testimonials = useMemo(
    () =>
      (Array.isArray(source) ? source : [])
        .filter((c) => (c?.type ? c.type === "testimonial" : true))
        .filter((c) => c?.isPublished !== false),
    [source]
  );

  // --- Carousel State ---
  const [activeIdx, setActiveIdx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Otomatik kaydır (3'ten fazla varsa)
  useEffect(() => {
    if (!testimonials.length || testimonials.length <= 3) return;
    timerRef.current = setTimeout(() => {
      setActiveIdx((i) => (i + 1) % testimonials.length);
    }, 5200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIdx, testimonials.length]);

  // Swipe (mobil)
  const startX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx > 50) prevSlide();
    if (dx < -50) nextSlide();
    startX.current = null;
  };

  const nextSlide = () => setActiveIdx((i) => (i + 1) % testimonials.length);
  const prevSlide = () =>
    setActiveIdx((i) => (i - 1 + testimonials.length) % testimonials.length);

  // Çok dilli getter
  const getLangField = useCallback(
    (field: any) =>
      typeof field === "object" && field
        ? field[lang] || field.tr || field.en || Object.values(field)[0] || ""
        : field || "",
    [lang]
  );

  // --- Yorum Ekle Modal ---
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ label: "", text: "" });
  const [rating, setRating] = useState<number>(0);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleKeyRating = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") setRating((r) => Math.min(5, r + 1));
    if (e.key === "ArrowLeft") setRating((r) => Math.max(0, r - 1));
    if (e.key === "Home") setRating(1);
    if (e.key === "End") setRating(5);
    if (e.key === "Escape") setRating(0);
  };

  const openModal = () => {
    if (!profile) {
      router.push("/login");
      return;
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!form.text?.trim()) {
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
          company: (profile as any)?.company ?? "",
          position: (profile as any)?.position ?? "",
          email: profile?.email ?? "",
          comment: form.text,
          label: form.label,
          type: "testimonial",
          contentType: "global", // ✅ testimonial → global
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
      dispatch(fetchTestimonialsPublic({ page: 1, limit: 12 }));
    } catch (err: any) {
      setFormError(err?.message || t("form.error", "Bir hata oluştu. Lütfen tekrar deneyin."));
    } finally {
      setSending(false);
    }
  };

  // 3'lü sırada görünen kart index'leri
  const getCardIdx = (offset: number) => {
    const total = testimonials.length;
    if (total === 0) return -1;
    return (activeIdx + offset + total) % total;
  };

  const isEmpty = !loading && !error && testimonials.length === 0;

  return (
    <Section aria-busy={loading}>
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

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {loading ? (
        <SkeletonRow>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </SkeletonRow>
      ) : null}

      {!loading && isEmpty ? (
        <EmptyWrap>
          <p>{t("empty", "Henüz bir yorum yok.")}</p>
          <AddCommentBtn onClick={openModal}>
            <MdAddComment size={22} />
            {t("form.addTestimonial", "Yorum Yaz")}
          </AddCommentBtn>
        </EmptyWrap>
      ) : null}

      {!loading && !isEmpty ? (
        <CarouselArea onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <Row>
            {[-1, 0, 1].map((offset, idx) => {
              const cardIdx = getCardIdx(offset);
              const card = testimonials[cardIdx];
              if (!card) return <EmptyCard key={idx} />;
              const isActive = offset === 0;

              const imgSrc =
                resolveProfileImage(card.profileImage, "profile") ||
                "/images/avatar-fallback.png";
              const ratingVal = typeof card.rating === "number" ? card.rating : 0;

              return (
                <CardMain key={card._id || idx} $active={isActive}>
                  <CardHeader>
                    <Name $active={isActive}>
                      {getLangField(card.name) || t("anon", "Anonim")}
                    </Name>
                    <Role>
                      {getLangField((card as any).company) ||
                        getLangField(card.label) ||
                        ""}
                    </Role>
                  </CardHeader>

                  {/* ⭐ rating satırı */}
                  {ratingVal > 0 && (
                    <StarsRow title={`${ratingVal}/5`} aria-label={`${ratingVal} / 5`}>
                      {[1, 2, 3, 4, 5].map((n) =>
                        ratingVal >= n ? <MdStar key={n} size={18} /> : <MdStarBorder key={n} size={18} />
                      )}
                      <StarsValue>{ratingVal}/5</StarsValue>
                    </StarsRow>
                  )}

                  <Text $active={isActive}>
                    <MdFormatQuote
                      size={38}
                      style={{
                        opacity: 0.13,
                        marginBottom: -13,
                        marginRight: 8,
                        display: "inline",
                      }}
                    />
                    <span>{getLangField(card.text)}</span>
                  </Text>

                  <BubblePointer $active={isActive} />

                  <AvatarCircle $active={isActive}>
                    <Image
                      src={imgSrc}
                      alt={getLangField(card.name) || "Anonim"}
                      width={54}
                      height={54}
                      loading="lazy"
                      onError={(e: any) => {
                        e.currentTarget.src = "/images/avatar-fallback.png";
                      }}
                    />
                  </AvatarCircle>
                </CardMain>
              );
            })}
          </Row>

          <Nav>
            <NavBtn onClick={prevSlide} aria-label="Önceki">
              <MdArrowBackIos size={22} />
            </NavBtn>
            <NavBtn onClick={nextSlide} aria-label="Sonraki">
              <MdArrowForwardIos size={22} />
            </NavBtn>
          </Nav>

          <Dots>
            {testimonials.map((_, idx) => (
              <Dot key={idx} $active={idx === activeIdx} onClick={() => setActiveIdx(idx)} />
            ))}
          </Dots>
        </CarouselArea>
      ) : null}

      {/* --- YORUM EKLE BUTONU --- */}
      {!loading && !error ? (
        <AddCommentBtn onClick={openModal}>
          <MdAddComment size={22} />
          {t("form.addTestimonial", "Yorum Yaz")}
        </AddCommentBtn>
      ) : null}

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
                    maxLength={60}
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
                          {filled ? <MdStar size={22} /> : <MdStarBorder size={22} />}
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
                    maxLength={240}
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

/* ----------------------- Styles ----------------------- */

const Section = styled.section`
  background: ${({ theme }) => theme.colors.achievementBackground};
  padding: ${({ theme }) => theme.spacings.xxl} 0 ${({ theme }) => theme.spacings.xl} 0;
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
  margin-bottom: 0.38em;
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const SectionDesc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.main};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  text-align: center;
  margin-bottom: 2.5rem;
  max-width: 700px;
`;

const CarouselArea = styled.div`
  width: 100%;
  max-width: 1080px;
  margin: 0 auto 0 auto;
  position: relative;
  min-height: 390px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 44px;
  margin-bottom: 28px;

  @media (max-width: 900px) {
    gap: 20px;
  }
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
`;

const CardMain = styled.div<{ $active?: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.cardBackground};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.background : theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ $active, theme }) =>
    $active
      ? `0 8px 44px 0 ${theme.colors.primaryTransparent}, 0 1px 10px #0003`
      : "0 2px 12px 0 #0011"};
  min-height: 282px;
  max-width: 350px;
  width: 100%;
  padding: 2.1rem 1.7rem 3.2rem 1.7rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  margin-bottom: 44px;
  z-index: ${({ $active }) => ($active ? 2 : 1)};
  transform: ${({ $active }) => ($active ? "scale(1.08)" : "scale(0.96)")};
  opacity: ${({ $active }) => ($active ? 1 : 0.8)};
  border: ${({ $active, theme }) =>
    $active ? `2.2px solid ${theme.colors.primary}` : "2.2px solid transparent"};
  transition: all 0.26s cubic-bezier(0.42, 1.12, 0.48, 1.07);

  @media (max-width: 900px) {
    min-height: 220px;
    max-width: 98vw;
    margin-bottom: 36px;
    transform: scale(1);
  }
`;

const EmptyCard = styled.div`
  flex: 1 1 340px;
  max-width: 340px;
  min-height: 282px;
  @media (max-width: 900px) {
    display: none;
  }
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.08em;
  margin-bottom: 0.6em;
`;

const Name = styled.div<{ $active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.14em;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.background : theme.colors.primaryDark};
`;

const Role = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.special};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const StarsRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 4px 0 10px 0;
  svg {
    color: ${({ theme }) => theme.colors.background}; /* aktif kartta da görünür olsun */
    filter: ${({ theme }) => (theme.colors.background ? "none" : "grayscale(0)")};
  }
`;

const StarsValue = styled.small`
  margin-left: 4px;
  color: currentColor;
  opacity: 0.9;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const Text = styled.div<{ $active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 1.5em;
  color: inherit;
  min-height: 56px;
  line-height: 1.5;
  span {
    font-weight: 500;
  }
`;

const BubblePointer = styled.div<{ $active?: boolean }>`
  position: absolute;
  left: 50%;
  bottom: -26px;
  transform: translateX(-50%);
  width: 38px;
  height: 36px;
  z-index: 2;
  &::after {
    content: "";
    display: block;
    width: 38px;
    height: 36px;
    clip-path: polygon(50% 100%, 0 0, 100% 0);
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.cardBackground};
  }
`;

const AvatarCircle = styled.div<{ $active?: boolean }>`
  position: absolute;
  left: 50%;
  bottom: -54px;
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 14px 0 ${({ theme }) => theme.colors.primaryTransparent};
  border: 3px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.cardBackground};
  z-index: 3;
  overflow: hidden;
  & > img {
    border-radius: 50%;
    width: 50px;
    height: 50px;
    object-fit: cover;
    background: ${({ theme }) => theme.colors.inputBackground};
  }
`;

const Nav = styled.div`
  display: flex;
  gap: 16px;
  position: absolute;
  left: 50%;
  bottom: -46px;
  transform: translateX(-50%);
  z-index: 11;
`;

const NavBtn = styled.button`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.circle};
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 2px 10px 0 ${({ theme }) => theme.colors.primaryTransparent};
  cursor: pointer;
  transition: background 0.14s, color 0.14s, box-shadow 0.16s;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
    box-shadow: 0 6px 24px 0 ${({ theme }) => theme.colors.primaryTransparent};
  }
`;

const Dots = styled.div`
  display: flex;
  gap: 13px;
  margin-top: 38px;
  justify-content: center;
`;

const Dot = styled.button<{ $active?: boolean }>`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.skeleton};
  box-shadow: ${({ $active, theme }) =>
    $active ? `0 3px 14px 0 ${theme.colors.primaryTransparent}` : "none"};
  cursor: pointer;
  transition: background 0.22s, box-shadow 0.18s;
`;

// Yorum ekle butonu
const AddCommentBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.7em;
  margin: 48px auto 0 auto;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  padding: 0.85em 2.2em;
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: background 0.16s;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

// Bilgi kutuları
const ErrorBox = styled.div`
  background: ${({ theme }) => theme.colors.dangerBg || "rgba(220, 38, 38, .08)"};
  color: ${({ theme }) => theme.colors.danger || "#dc2626"};
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: 12px;
`;

const EmptyWrap = styled.div`
  display: grid;
  place-items: center;
  gap: 12px;
  padding: 16px 0 6px;
`;

// Loading
const SkeletonRow = styled.div`
  width: 100%;
  max-width: 1080px;
  margin: 0 auto 20px auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
`;

const SkeletonCard = styled.div`
  height: 240px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.backgroundAlt},
    ${({ theme }) => theme.colors.backgroundSecondary},
    ${({ theme }) => theme.colors.backgroundAlt}
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

// Modal stilleri
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
  width: min(680px, 96vw);
  display: flex;
  flex-direction: column;
  align-items: stretch;
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
  padding: 0.83em 1.7em;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  margin-top: 0.7em;
  transition: background 0.15s;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
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

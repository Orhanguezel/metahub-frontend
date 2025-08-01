"use client";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useMemo, useState, useEffect, useRef } from "react";
import { MdStars, MdArrowBackIos, MdArrowForwardIos, MdFormatQuote, MdAddComment } from "react-icons/md";
import { useRouter } from "next/navigation";
import { SupportedLocale } from "@/types/common";
import { createComment, fetchCommentsForContent } from "@/modules/comment/slice/commentSlice";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { resolveProfileImage } from "@/shared/resolveProfileImage";

// ----

export default function TestimonialSection() {
  const { i18n, t } = useI18nNamespace("testimonial", translations3);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { profile } = useAppSelector((state) => state.account);

  const CONTENT_TYPE = "about";
  const CONTENT_ID = "000000000000000000000000";

  // Yorumları çek
  useEffect(() => {
    dispatch(fetchCommentsForContent({
      type: CONTENT_TYPE,
      id: CONTENT_ID,
      commentType: "testimonial",
    }));
  }, [dispatch]);

  // Dinamik testimonial listesi
  const allComments = useAppSelector((state) => state.comments.comments);
  const testimonials = useMemo(
    () =>
      Array.isArray(allComments)
        ? allComments.filter((c: any) => c.type === "testimonial" && c.isPublished)
        : [],
    [allComments]
  );

  // --- Carousel State ---
  const [activeIdx, setActiveIdx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Otomatik kaydır
  useEffect(() => {
    if (testimonials.length <= 3) return;
    timerRef.current = setTimeout(() => {
      setActiveIdx((i) => (i + 1) % testimonials.length);
    }, 5200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeIdx, testimonials.length]);

  // Swipe hareketi (mobil)
  const startX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx > 50) prevSlide();
    if (dx < -50) nextSlide();
    startX.current = null;
  };

  const nextSlide = () => setActiveIdx((i) => (i + 1) % testimonials.length);
  const prevSlide = () => setActiveIdx((i) => (i - 1 + testimonials.length) % testimonials.length);

  // Çok dilli alan getter
  const getLangField = (field: any) =>
    typeof field === "object" && field
      ? field[lang] || field.tr || field.en || Object.values(field)[0] || ""
      : field || "";

  // --- Yorum Ekle Modal ---
  const [showModal, setShowModal] = useState(false);
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
          isPublished: false,
          isActive: true,
        })
      ).unwrap();
      setFormSuccess(t("form.success", "Yorumunuz başarıyla gönderildi! Onaylandıktan sonra yayınlanacaktır."));
      setForm({ label: "", text: "" });
      setShowModal(false);
      dispatch(fetchCommentsForContent({
        type: CONTENT_TYPE,
        id: CONTENT_ID,
        commentType: "testimonial",
      }));
    } catch (err: any) {
      setFormError(err?.message || t("form.error", "Bir hata oluştu. Lütfen tekrar deneyin."));
    }
    setSending(false);
  };

  // --- 3'lü satırda dönen slider verileri ---
  const getCardIdx = (offset: number) => {
    const total = testimonials.length;
    if (total === 0) return -1;
    return (activeIdx + offset + total) % total;
  };

  // ---- Render ----
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

      <CarouselArea
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Row>
          {[ -1, 0, 1 ].map((offset, idx) => {
            const cardIdx = getCardIdx(offset);
            const card = testimonials[cardIdx];
            if (!card) return <EmptyCard key={idx} />;
            const isActive = offset === 0;
            return (
              <CardMain key={card._id || idx} $active={isActive}>
                <CardHeader>
                  <Name $active={isActive}>{getLangField(card.name) || t("anon", "Anonim")}</Name>
                  <Role>{getLangField(card.company) || getLangField(card.label) || ""}</Role>
                </CardHeader>
                <Text $active={isActive}>
                  <MdFormatQuote
                    size={38}
                    style={{
                      opacity: 0.13,
                      marginBottom: -13,
                      marginRight: 8,
                      display: "inline"
                    }}
                  />
                  <span>{getLangField(card.text)}</span>
                </Text>
                <BubblePointer $active={isActive} />
                <AvatarCircle $active={isActive}>
                  <Image
                    src={resolveProfileImage(card.profileImage, "profile")}
                    alt={getLangField(card.name) || "Anonim"}
                    width={54}
                    height={54}
                    loading="lazy"
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
            <Dot
              key={idx}
              $active={idx === activeIdx}
              onClick={() => setActiveIdx(idx)}
            />
          ))}
        </Dots>
      </CarouselArea>

      {/* --- YORUM EKLE BUTONU --- */}
      <AddCommentBtn onClick={() => setShowModal(true)}>
        <MdAddComment size={22} />
        {t("form.addTestimonial", "Yorum Yaz")}
      </AddCommentBtn>
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
                <input
                  type="text"
                  name="label"
                  value={form.label}
                  onChange={handleFormChange}
                  placeholder={t("form.label", "Başlık/Unvan (opsiyonel)")}
                  disabled={sending}
                  maxLength={60}
                />
                <textarea
                  name="text"
                  value={form.text}
                  onChange={handleFormChange}
                  required
                  rows={3}
                  placeholder={t("form.text", "Yorumunuz")}
                  disabled={sending}
                  maxLength={240}
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
    </Section>
  );
}

// --- Styled Components ---

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
    $active
      ? theme.colors.primary
      : theme.colors.cardBackground};
  color: ${({ $active, theme }) =>
    $active
      ? theme.colors.background
      : theme.colors.text};
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
  border: ${({ $active, theme }) => $active ? `2.2px solid ${theme.colors.primary}` : "2.2px solid transparent"};
  transition: all 0.26s cubic-bezier(.42,1.12,.48,1.07);

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
  margin-bottom: 0.9em;
`;

const Name = styled.div<{ $active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.14em;
  color: ${({ $active, theme }) => $active ? theme.colors.background : theme.colors.primaryDark};
`;

const Role = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.special};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const Text = styled.div<{ $active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 1.5em;
  color: inherit;
  min-height: 56px;
  line-height: 1.5;
  span { font-weight: 500; }
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
    background: inherit;
    clip-path: polygon(50% 100%, 0 0, 100% 0);
    background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.cardBackground};
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
  border: 3px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.cardBackground};
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
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
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
    color: ${({ theme }) => theme.colors.text};
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
  color: ${({ theme }) => theme.colors.buttonText};
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


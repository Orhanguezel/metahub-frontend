// app/page-not-found/page.tsx
"use client";

import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";

// 6 dil: en, tr, de, fr, es, pl
const translations = {
  en: {
    title: "Page not found (404)",
    lead: "We couldn't find the page you were looking for.",
    redirect: "You'll be redirected to the homepage shortly…",
    secondsLeft: "Redirecting in {{s}}s.",
    goHome: "Go to homepage",
    backTo: "Back to homepage",
  },
  tr: {
    title: "Sayfa bulunamadı (404)",
    lead: "Aradığınız sayfayı bulamadık.",
    redirect: "Az sonra ana sayfaya yönlendirileceksiniz…",
    secondsLeft: "{{s}} sn içinde yönlendirileceksiniz.",
    goHome: "Ana sayfaya git",
    backTo: "Ana sayfaya dön",
  },
  de: {
    title: "Seite nicht gefunden (404)",
    lead: "Die gesuchte Seite wurde nicht gefunden.",
    redirect: "Sie werden in Kürze zur Startseite weitergeleitet…",
    secondsLeft: "Weiterleitung in {{s}} Sek.",
    goHome: "Zur Startseite",
    backTo: "Zur Startseite",
  },
  fr: {
    title: "Page introuvable (404)",
    lead: "Nous n’avons pas trouvé la page recherchée.",
    redirect: "Vous allez être redirigé vers l’accueil…",
    secondsLeft: "Redirection dans {{s}} s.",
    goHome: "Aller à l’accueil",
    backTo: "Retour à l’accueil",
  },
  es: {
    title: "Página no encontrada (404)",
    lead: "No pudimos encontrar la página que buscabas.",
    redirect: "Serás redirigido a la página de inicio en breve…",
    secondsLeft: "Redirigiendo en {{s}} s.",
    goHome: "Ir al inicio",
    backTo: "Volver al inicio",
  },
  pl: {
    title: "Strony nie znaleziono (404)",
    lead: "Nie znaleźliśmy szukanej strony.",
    redirect: "Za chwilę nastąpi przekierowanie na stronę główną…",
    secondsLeft: "Przekierowanie za {{s}} s.",
    goHome: "Przejdź na stronę główną",
    backTo: "Powrót na stronę główną",
  },
};

const REDIRECT_SEC = 2;

export default function PageNotFound() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams?.get("from") || "";
  const { t } = useI18nNamespace("notFound", translations);

  const [left, setLeft] = useState(REDIRECT_SEC);

  useEffect(() => {
    const tick = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    const to = setTimeout(() => router.replace("/"), REDIRECT_SEC * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(to);
    };
  }, [router]);

  return (
    <Wrap role="region" aria-labelledby="nf-title">
      <Card>
        <Badge>404</Badge>
        <Title id="nf-title">{t("title", "Page not found (404)")}</Title>
        <Lead>{t("lead", "We couldn't find the page you were looking for.")}</Lead>

        {from ? <FromPath title={from}>{from}</FromPath> : null}

        <Hint aria-live="polite">
          {left > 0
            ? t("secondsLeft", "Redirecting in {{s}}s.", { s: left })
            : t("redirect", "You'll be redirected to the homepage shortly…")}
        </Hint>

        <Actions>
          <Primary as={Link} href="/" prefetch>
            {t("goHome", "Go to homepage")}
          </Primary>
        </Actions>
      </Card>
    </Wrap>
  );
}

/* ---------------- styles ---------------- */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrap = styled.main`
  min-height: 60vh;
  display: grid;
  place-items: center;
  padding: ${({ theme }) => theme?.spacings?.xl || "32px"};
  background: ${({ theme }) => theme?.colors?.background || "#f5f5f5"};
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme?.spacings?.md || "16px"};
  }
`;

const Card = styled.section`
  max-width: 720px;
  width: 100%;
  background: ${({ theme }) => theme?.colors?.sectionBackground || "#fff"};
  border: ${({ theme }) => theme?.borders?.thin || "1px solid"}
          ${({ theme }) => theme?.colors?.border || "#eaeaea"};
  border-radius: ${({ theme }) => theme?.radii?.xl || "20px"};
  box-shadow: ${({ theme }) => theme?.shadows?.lg || "0 8px 16px rgba(0,0,0,0.09)"};
  padding: clamp(20px, 4vw, 40px);
  text-align: center;
  animation: ${fadeIn} 0.35s ease both;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme?.radii?.pill || "9999px"};
  background: ${({ theme }) => theme?.colors?.primaryTransparent || "rgba(72,98,137,.1)"};
  color: ${({ theme }) => theme?.colors?.primary || "#486289"};
  border: 1px solid ${({ theme }) => theme?.colors?.primary || "#486289"};
  font-weight: ${({ theme }) => theme?.fontWeights?.semiBold || 600};
  margin-bottom: ${({ theme }) => theme?.spacings?.md || "16px"};
`;

const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme?.colors?.title || "#486289"};
  font-size: ${({ theme }) => theme?.fontSizes?.h3 || "2rem"};
`;

const Lead = styled.p`
  margin: 8px 0 0 0;
  color: ${({ theme }) => theme?.colors?.textSecondary || "#666"};
  font-size: ${({ theme }) => theme?.fontSizes?.md || "1.1rem"};
`;

const FromPath = styled.div`
  margin-top: 6px;
  color: ${({ theme }) => theme?.colors?.textMuted || "#888"};
  font-size: ${({ theme }) => theme?.fontSizes?.sm || ".9rem"};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Hint = styled.p`
  margin: 10px 0 0 0;
  color: ${({ theme }) => theme?.colors?.textMuted || "#888"};
  font-size: ${({ theme }) => theme?.fontSizes?.sm || ".9rem"};
`;

const Actions = styled.div`
  margin-top: ${({ theme }) => theme?.spacings?.lg || "24px"};
  display: flex;
  justify-content: center;
`;

const Primary = styled.button`
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme?.radii?.md || "8px"};
  background: ${({ theme }) => theme?.buttons?.primary?.background || "#486289"};
  color: ${({ theme }) => theme?.buttons?.primary?.text || "#fff"};
  border: ${({ theme }) => theme?.borders?.thin || "1px solid"}
          ${({ theme }) => theme?.colors?.buttonBorder || "#486289"};
  text-decoration: none;
  font-weight: ${({ theme }) => theme?.fontWeights?.semiBold || 600};
  box-shadow: ${({ theme }) => theme?.shadows?.button || "0 2px 10px rgba(0,0,0,0.05)"};
  transition: ${({ theme }) => theme?.transition?.fast || "0.2s ease-in-out"};
  &:hover, &:focus-visible {
    background: ${({ theme }) => theme?.buttons?.primary?.backgroundHover || "#365075"};
    outline: none;
  }
`;

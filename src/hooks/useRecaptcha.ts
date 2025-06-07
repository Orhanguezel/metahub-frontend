// src/hooks/useRecaptcha.ts
import { useCallback } from "react";
import { load } from "recaptcha-v3";

export const useRecaptcha = () => {
   const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      try {
        const recaptcha = await load(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!
        );
        const token = await recaptcha.execute(action);
        return token;
      } catch (error) {
        console.error("reCAPTCHA error:", error);
        return null;
      }
    },
    []
  );

  return executeRecaptcha;
};

  
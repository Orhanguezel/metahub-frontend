// src/shared/getLocalized.ts

export function getLocalized(
  obj: Record<string, string> | string | undefined | null,
  lang: string
): string {
  if (obj && typeof obj === "object") {
    // Eğer obj bir nesne ise, önce lang, sonra en, yoksa ilk değer
    return obj[lang] || obj["en"] || Object.values(obj)[0] || "";
  }
  // Eğer obj string ise ya da null/undefined ise
  return obj || "";
}

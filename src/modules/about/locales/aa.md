import tr from "./locales/tr.json";
import en from "./locales/en.json";
// ... diğer diller

import i18n from "@/i18n";

// Sadece bir kez yükle, tekrar tekrar ekleme!
if (!i18n.hasResourceBundle('tr', 'about')) {
  i18n.addResourceBundle('tr', 'about', tr, true, true);
}
// Tüm diller için aynısını yap

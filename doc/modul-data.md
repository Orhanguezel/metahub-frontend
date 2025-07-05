Süper, çok net bir örnek göndermişsin! Şimdi aşağıda **ekran görüntüsündeki modüllerin**
**ikonlarını ve 6 dilde (tr, en, de, es, pl, fr) isimlerini** *JSON formatında* veriyorum.
Senin Sidebar için doğrudan kullanıma hazır olacak!

---

## JSON Formatı (6 Dilde)

```json
[
  {
    "module": "dashboard",
    "icon": "MdDashboard",
    "tr": "Panel",
    "en": "Dashboard",
    "de": "Dashboard",
    "es": "Tablero",
    "pl": "Panel",
    "fr": "Tableau de bord"
  },
  {
    "module": "about",
    "icon": "MdInfo",
    "tr": "Hakkında",
    "en": "About",
    "de": "Über",
    "es": "Acerca de",
    "pl": "O nas",
    "fr": "À propos"
  },
  {
    "module": "admin",
    "icon": "MdAdminPanelSettings",
    "tr": "Yönetici",
    "en": "Admin",
    "de": "Admin",
    "es": "Admin",
    "pl": "Admin",
    "fr": "Admin"
  },
  {
    "module": "bikes",
    "icon": "MdDirectionsBike",
    "tr": "Bisikletler",
    "en": "Bikes",
    "de": "Fahrräder",
    "es": "Bicicletas",
    "pl": "Rowery",
    "fr": "Vélos"
  },
  {
    "module": "cart",
    "icon": "MdShoppingCart",
    "tr": "Sepet",
    "en": "Cart",
    "de": "Warenkorb",
    "es": "Carrito",
    "pl": "Koszyk",
    "fr": "Panier"
  },
  {
    "module": "comment",
    "icon": "MdComment",
    "tr": "Yorumlar",
    "en": "Comments",
    "de": "Kommentare",
    "es": "Comentarios",
    "pl": "Komentarze",
    "fr": "Commentaires"
  },
  {
    "module": "company",
    "icon": "MdBusiness",
    "tr": "Şirket",
    "en": "Company",
    "de": "Firma",
    "es": "Compañía",
    "pl": "Firma",
    "fr": "Entreprise"
  },
  {
    "module": "contact",
    "icon": "MdContactMail",
    "tr": "İletişim",
    "en": "Contact",
    "de": "Kontakt",
    "es": "Contacto",
    "pl": "Kontakt",
    "fr": "Contact"
  },
  {
    "module": "coupon",
    "icon": "MdLocalOffer",
    "tr": "Kuponlar",
    "en": "Coupons",
    "de": "Gutscheine",
    "es": "Cupones",
    "pl": "Kupony",
    "fr": "Coupons"
  },
  {
    "module": "dashboard",
    "icon": "MdDashboard",
    "tr": "Panel",
    "en": "Dashboard",
    "de": "Dashboard",
    "es": "Tablero",
    "pl": "Panel",
    "fr": "Tableau de bord"
  },
  {
    "module": "email",
    "icon": "MdEmail",
    "tr": "E-posta",
    "en": "Email",
    "de": "E-Mail",
    "es": "Correo",
    "pl": "E-mail",
    "fr": "E-mail"
  },
  {
    "module": "faq",
    "icon": "MdHelpCenter",
    "tr": "SSS",
    "en": "FAQ",
    "de": "FAQ",
    "es": "FAQ",
    "pl": "FAQ",
    "fr": "FAQ"
  },
  {
    "module": "gallery",
    "icon": "MdPhotoLibrary",
    "tr": "Galeri",
    "en": "Gallery",
    "de": "Galerie",
    "es": "Galería",
    "pl": "Galeria",
    "fr": "Galerie"
  },
  {
    "module": "invoice",
    "icon": "MdRequestQuote",
    "tr": "Faturalar",
    "en": "Invoices",
    "de": "Rechnungen",
    "es": "Facturas",
    "pl": "Faktury",
    "fr": "Factures"
  },
  {
    "module": "notification",
    "icon": "MdNotifications",
    "tr": "Bildirimler",
    "en": "Notifications",
    "de": "Benachrichtigungen",
    "es": "Notificaciones",
    "pl": "Powiadomienia",
    "fr": "Notifications"
  },
  {
    "module": "order",
    "icon": "MdReceiptLong",
    "tr": "Siparişler",
    "en": "Orders",
    "de": "Bestellungen",
    "es": "Pedidos",
    "pl": "Zamówienia",
    "fr": "Commandes"
  },
  {
    "module": "payment",
    "icon": "MdPayment",
    "tr": "Ödemeler",
    "en": "Payments",
    "de": "Zahlungen",
    "es": "Pagos",
    "pl": "Płatności",
    "fr": "Paiements"
  },
  {
    "module": "setting",
    "icon": "MdSettings",
    "tr": "Ayarlar",
    "en": "Settings",
    "de": "Einstellungen",
    "es": "Ajustes",
    "pl": "Ustawienia",
    "fr": "Paramètres"
  },
  {
    "module": "users",
    "icon": "MdPeople",
    "tr": "Kullanıcılar",
    "en": "Users",
    "de": "Benutzer",
    "es": "Usuarios",
    "pl": "Użytkownicy",
    "fr": "Utilisateurs"
  },
  {
    "module": "wishlist",
    "icon": "MdFavoriteBorder",
    "tr": "Favoriler",
    "en": "Wishlist",
    "de": "Favoriten",
    "es": "Lista de deseos",
    "pl": "Lista życzeń",
    "fr": "Favoris"
  }
]
```

---

### **Ek Notlar:**

* Modül isimleri ve ikonları [Material Design Icons](https://react-icons.github.io/react-icons/icons?name=md) (ör: `MdDashboard`) ile uyumludur.
* Çeviriler hem teknik hem gündelik dilde en yaygın karşılıklarla hazırlandı.
* `aboutttt` özel bir isimse `"about"` gibi tekilleştir (modül ismi key olarak sade olmalı, ek karakter istemez).

---

### **Kullanım**

* JSON’daki her alanı çeviri dosyasına veya doğrudan modül nesnesi olarak kullanabilirsin.
* Ekstra/eksik modül varsa örneğe bakarak kolayca ekleyebilirsin.

Daha fazla modül veya başka bir format istersen (ör. flat obje, mapping, vs.) belirtmen yeterli!

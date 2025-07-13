db.settings.insertOne({
  key: "navbar_logo_text",
  tenant: "koenigsmassage.com",
  value: {
    title: {
      en: "Königs Massage",
      de: "Königs Massage",
      tr: "Königs Masaj",
      fr: "Königs Massage",
      es: "Königs Massage",
      pl: "Königs Masaż",
      url: "https://koenigsmassage.com"
    },
    slogan: {
      en: "Your wellness starts here",
      de: "Ihr Wohlbefinden beginnt hier",
      tr: "Sağlığınız burada başlar",
      fr: "Votre bien-être commence ici",
      es: "Tu bienestar empieza aquí",
      pl: "Twoje zdrowie zaczyna się tutaj",
      url: "https://koenigsmassage.com"
    }
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

module.exports = {
  apps: [
    // 🔧 METAHUB - DEVELOPMENT
    {
      name: "metahub-dev",
      script: "node_modules/next/dist/bin/next",
      args: "dev -p 3100",
      env: {
        NODE_ENV: "development",
        PORT: 3100,
        TENANT_NAME: "metahub",
        NEXT_PUBLIC_APP_ENV: "metahub",
        NEXT_PUBLIC_API_URL: "http://localhost:5014/api",
        NEXT_PUBLIC_API_BASE_URL: "http://localhost:5014/api",
        NEXT_PUBLIC_MEDIA_URL: "http://localhost:5014",
        NEXT_PUBLIC_SOCKET_URL: "http://localhost:5014",
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "6LdvkxArAAAAAFNlFovqunFxta6Gp2yyarkdiMqY",
        METAHUB_API_KEY: "your_api_key_here",
        COOKIE_DOMAIN: "localhost"
      }
    },

    // ✅ METAHUB - PRODUCTION
    {
      name: "metahub-prod",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        TENANT_NAME: "metahub",
        NEXT_PUBLIC_APP_ENV: "metahub",
        NEXT_PUBLIC_API_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_API_BASE_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_MEDIA_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_SOCKET_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "6LdvkxArAAAAAFNlFovqunFxta6Gp2yyarkdiMqY",
        METAHUB_API_KEY: "your_api_key_here",
        COOKIE_DOMAIN: "guezelwebdesign.com" // 🌐 FRONTEND: https://www.guezelwebdesign.com
      }
    },

    // 💆‍♀️ ANASTASIA - DEVELOPMENT
    {
      name: "anastasia-dev",
      script: "node_modules/next/dist/bin/next",
      args: "dev -p 3101",
      env: {
        NODE_ENV: "development",
        PORT: 3101,
        TENANT_NAME: "anastasia",
        NEXT_PUBLIC_APP_ENV: "anastasia",
        NEXT_PUBLIC_API_URL: "http://localhost:5014/api",
        NEXT_PUBLIC_API_BASE_URL: "http://localhost:5014/api",
        NEXT_PUBLIC_MEDIA_URL: "http://localhost:5014",
        NEXT_PUBLIC_SOCKET_URL: "http://localhost:5014",
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "6LdvkxArAAAAAFNlFovqunFxta6Gp2yyarkdiMqY",
        METAHUB_API_KEY: "your_api_key_here",
        COOKIE_DOMAIN: "localhost"
      }
    },

    // ✅ ANASTASIA - PRODUCTION
    {
      name: "anastasia-prod",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        TENANT_NAME: "anastasia",
        NEXT_PUBLIC_APP_ENV: "anastasia",
        NEXT_PUBLIC_API_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_API_BASE_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_MEDIA_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_SOCKET_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "6LdvkxArAAAAAFNlFovqunFxta6Gp2yyarkdiMqY",
        METAHUB_API_KEY: "your_api_key_here",
        COOKIE_DOMAIN: "koenigsmassage.com" // 🌐 FRONTEND: https://koenigsmassage.com
      }
    },

    // ❄️ ENSOTEK - DEVELOPMENT
    {
      name: "ensotek-dev",
      script: "node_modules/next/dist/bin/next",
      args: "dev -p 3102",
      env: {
        NODE_ENV: "development",
        PORT: 3102,
        TENANT_NAME: "ensotek",
        NEXT_PUBLIC_APP_ENV: "ensotek",
        NEXT_PUBLIC_API_URL: "http://localhost:5014/api",
        NEXT_PUBLIC_API_BASE_URL: "http://localhost:5014/api",
        NEXT_PUBLIC_MEDIA_URL: "http://localhost:5014",
        NEXT_PUBLIC_SOCKET_URL: "http://localhost:5014",
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "6LdvkxArAAAAAFNlFovqunFxta6Gp2yyarkdiMqY",
        METAHUB_API_KEY: "your_api_key_here",
        COOKIE_DOMAIN: "localhost"
      }
    },

    // ✅ ENSOTEK - PRODUCTION
    {
      name: "ensotek-prod",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3002",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
        TENANT_NAME: "ensotek",
        NEXT_PUBLIC_APP_ENV: "ensotek",
        NEXT_PUBLIC_API_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_API_BASE_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_MEDIA_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_SOCKET_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "6LdvkxArAAAAAFNlFovqunFxta6Gp2yyarkdiMqY",
        METAHUB_API_KEY: "your_api_key_here",
        COOKIE_DOMAIN: "ensotek.de" // 🌐 FRONTEND: https://ensotek.de
      }
    },

    // 🧼 RADANOR - PRODUCTION
    {
      name: "radanor-prod",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3003",
      env: {
        NODE_ENV: "production",
        PORT: 3003,
        TENANT_NAME: "radanor",
        NEXT_PUBLIC_APP_ENV: "radanor",
        NEXT_PUBLIC_API_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_API_BASE_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_MEDIA_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_SOCKET_URL: "https://api.guezelwebdesign.com",
        NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "6LdvkxArAAAAAFNlFovqunFxta6Gp2yyarkdiMqY",
        METAHUB_API_KEY: "your_api_key_here",
        COOKIE_DOMAIN: "radanor.de" // 🌐 FRONTEND: https://radanor.de
      }
    }
  ]
};

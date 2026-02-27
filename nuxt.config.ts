import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  modules: ['@nuxt/eslint', '@pinia/nuxt'],
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      autoprefixer: {},
    }
  },
  vite: {
    plugins: [
      // @ts-expect-error - I don't know how to type this, but it works
      tailwindcss(),
    ],
  },
  nitro: {
    storage: {
      'games': {
        driver: 'vercel-blob',
        base: 'games',
        access: "private",
        token: process.env.BLOB_READ_WRITE_TOKEN || '',
      }
    },
    experimental: {
      websocket: true,
    }
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      script: [
        // Font Awesome
        {
          src: "https://kit.fontawesome.com/b60418d4fd.js",
          crossorigin: "anonymous",
        },
      ],
    },
  },
})

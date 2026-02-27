import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  modules: ['@nuxt/eslint'],
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
    preset: 'bun',
    storage: {
      'games': {
        driver: 'fs',
        base: 'data/games',
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

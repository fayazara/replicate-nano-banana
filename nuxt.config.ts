// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    WEBHOOK_HOST: process.env.WEBHOOK_HOST,
    public: {}
  },

  compatibilityDate: '2025-01-15',

  vite: {
    server: {
      allowedHosts: [process.env.WEBHOOK_HOST || '']
    }
  }
})

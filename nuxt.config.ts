/// <reference types="nuxt" />

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    port: 3001
  },
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: [
        '/login*'
      ]
    },
    types: '~/types/supabase-database'
  },

  runtimeConfig: {
    public: {
      cdnBaseUrl: process.env.NUXT_PUBLIC_CDN_BASE_URL || '',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      websiteUrl: process.env.NUXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'
    }
  },

  app: {
    baseURL: '/berry-medical-admin/',
    head: {
      title: '贝瑞医疗 · 管理后台',
      htmlAttrs: {
        lang: 'zh-CN'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '贝瑞医疗后台管理系统' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: './favicon.svg' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js'
  },

  typescript: {
    strict: true
  },

  routeRules: {
    '/berry-medical-admin/**': { ssr: false }
  }
})

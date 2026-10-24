import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://strategicsloth.com',
  base: '/',
  integrations: [
    tailwind(),
    react(),
    sitemap({
      filter: (page) => !['/scale-to-freedom', '/promo', '/upsell', '/buy-buttons', '/unrevealed-game'].some(route => page.includes(route)),
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          fr: 'fr-CA',
          es: 'es-MX'
        }
      }
    })
  ],
  build: {
    assets: '_assets',
    format: 'directory'
  }
});
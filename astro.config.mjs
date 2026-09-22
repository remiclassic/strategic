import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://strategicsloth.com',
  base: '/',
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => !['/scale-to-freedom', '/promo', '/upsell', '/buy-buttons'].some(route => page.includes(route))
    })
  ],
  build: {
    assets: '_assets',
    format: 'directory'
  }
});
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
      filter: (page) => !page.includes('/scale-to-freedom')
    })
  ],
  build: {
    assets: '_assets',
    format: 'directory'
  }
});
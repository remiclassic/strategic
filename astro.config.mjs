import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/static';
// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel({
    analytics: false,
    imageService: true,
    devImageService: 'sharp'
  }),
  integrations: [tailwind()],
  build: {
    assets: '_assets',
    format: 'directory'
  }
});
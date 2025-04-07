import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  base: '/strategic/',
  integrations: [tailwind()],
  build: {
    assets: '_assets',
    format: 'directory'
  }
});
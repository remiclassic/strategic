import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://remiclassic.github.io',
  base: '/strategic',
  output: 'static',
  integrations: [tailwind()],
  build: {
    assets: '_assets',
    format: 'directory'
  }
});
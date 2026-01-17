import adapterVercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapterVercel(),
    experimental: {
      remoteFunctions: true
    }
  },
  vitePlugin: {
    inspector: false
  }
};

export default config;

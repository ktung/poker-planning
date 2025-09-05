import adapterAuto from '@sveltejs/adapter-auto';
import adapterVercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

let customAdapter;
if (process.env.ADAPTER === 'vercel') {
  customAdapter = adapterVercel();
} else {
  customAdapter = adapterAuto();
}

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: customAdapter,
    experimental: {
      remoteFunctions: true
    }
  }
};

export default config;

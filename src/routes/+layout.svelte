<script>
  import Footer from '$lib/components/footer.svelte';
  import LanguageSelector from '$lib/components/language-selector.svelte';
  import { injectAnalytics } from '@vercel/analytics/sveltekit';
  import { injectSpeedInsights } from '@vercel/speed-insights';

  let { children } = $props();

  injectAnalytics();
  injectSpeedInsights();
</script>

<main>
  <LanguageSelector />

  <div>
    {@render children()}
  </div>

  <Footer />
</main>

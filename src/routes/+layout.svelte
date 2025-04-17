<script>
  import Footer from '$lib/components/footer.svelte';
  import { injectAnalytics } from '@vercel/analytics/sveltekit';
  import { injectSpeedInsights } from '@vercel/speed-insights';

  let { children } = $props();

  injectAnalytics();
  injectSpeedInsights();
</script>

<main>
  <div>
    {@render children()}
  </div>

  <Footer />
</main>

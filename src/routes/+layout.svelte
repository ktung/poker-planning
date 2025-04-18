<script>
  import Footer from '$lib/components/footer.svelte';
  import LanguageSelector from '$lib/components/language-selector.svelte';
  import { injectAnalytics } from '@vercel/analytics/sveltekit';
  import { injectSpeedInsights } from '@vercel/speed-insights';

  let { children } = $props();

  injectAnalytics();
  injectSpeedInsights();
</script>

<svelte:head>
  <title>Poker Planning</title>
</svelte:head>

<header>
  <a href="/">Poker Planning</a>
  <a href="/about">About</a>
  <LanguageSelector />
</header>
<main>
  {@render children()}
</main>
<Footer />

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  header {
    border-bottom: 1px solid #ccc;
    padding: 1rem;
  }
</style>

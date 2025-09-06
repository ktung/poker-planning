<script>
  import { resolve } from '$app/paths';
  import Footer from '$lib/components/footer.svelte';
  import LanguageSelector from '$lib/components/language-selector.svelte';
  import { m } from '$lib/paraglide/messages';
  import '../app.css';
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
  <a href={resolve('/')}><img src="/favicon.png" alt="Poker Planning Logo" width="30" height="30" />Poker Planning</a>
  <a href={resolve('/about')}>{m.about()}</a>
  <LanguageSelector />
</header>
<main>
  {@render children()}
</main>
<Footer />

<style>
  *,
  :global(body) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.5;
    background-color: #f5f5f5;
  }

  header {
    background-color: white;
    border-bottom: 1px solid #eaeaea;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    box-shadow: var(--shadow-100);
  }

  header a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #333;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  header a:hover {
    color: var(--primary-color);
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    header {
      padding: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    main {
      padding: 1rem;
    }
  }
</style>

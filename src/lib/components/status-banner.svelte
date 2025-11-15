<script lang="ts" module>
  import { SvelteSet } from 'svelte/reactivity';

  const messages = new SvelteSet();

  export function addMessage(message: string) {
    messages.add(message);
  }

  export function clearMessages() {
    messages.clear();
  }
</script>

{#if messages.size > 0}
  <section>
    <ul>
      {#each messages as message (message)}
        <li>{message}</li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  section {
    background-color: red;
    padding: 10px 0;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;

    ul {
      margin: 0;
    }
  }
</style>

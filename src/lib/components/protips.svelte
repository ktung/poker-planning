<script lang="ts" module>
  import { m } from '$lib/paraglide/messages';
  import { CircleX } from 'lucide-svelte';

  type ProtipsType = keyof typeof m;
  const protipsTexts = {
    complexity: getTips('protips.complexity'),
    effort: getTips('protips.effort'),
    uncertainty: getTips('protips.uncertainty')
  };

  let protipsToggles: ProtipsToggleModel = $state({
    complexity: false,
    effort: false,
    uncertainty: false
  });

  function getTips(prefix: string) {
    return Object.keys(m)
      .filter((key) => key.startsWith(prefix))
      .map((key) => <ProtipsType>key);
  }

  export function toggleProtips(type: VoteType) {
    protipsToggles[type] = !protipsToggles[type];
  }
</script>

<section class="protips">
  {#if protipsToggles.complexity}
    <div>
      <h3>{m.complexity()}</h3>
      <span onclick={() => toggleProtips('complexity')}><CircleX /></span>
      <ul>
        {#each protipsTexts.complexity as key (key)}
          <li>{m[key]()}</li>
        {/each}
      </ul>
    </div>
  {/if}
  {#if protipsToggles.effort}
    <div>
      <h3>{m.effort()}</h3>
      <span onclick={() => toggleProtips('effort')}><CircleX /></span>
      <ul>
        {#each protipsTexts.effort as key (key)}
          <li>{m[key]()}</li>
        {/each}
      </ul>
    </div>
  {/if}
  {#if protipsToggles.uncertainty}
    <div>
      <h3>{m.uncertainty()}</h3>
      <span onclick={() => toggleProtips('uncertainty')}><CircleX /></span>
      <ul>
        {#each protipsTexts.uncertainty as key (key)}
          <li>{m[key]()}</li>
        {/each}
      </ul>
    </div>
  {/if}
</section>

<style>
  .protips {
    h3 {
      color: var(--primary-color);
      display: inline;
    }

    span {
      cursor: pointer;
      margin-left: 0.5rem;
      vertical-align: middle;
    }
    span:hover {
      color: var(--primary-color-active);
    }

    div {
      background: white;
      border-radius: var(--radius-small);
      box-shadow: var(--shadow-100);
      padding: 1rem;
    }
  }
</style>

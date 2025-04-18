<script lang="ts">
  import type { PageData } from './$types';
  import Chat from '$lib/components/chat.svelte';

  const { data }: { data: PageData } = $props();
  const { slug } = data;

  const tableData = [
    {
      pointValue: 0,
      complexity: 'easy',
      effort: '< 2h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 0.5,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 1,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 2,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 3,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 5,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 8,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 13,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 20,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 40,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 100,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    }
  ];
</script>

<div>
  <Chat {slug} />

  <table>
    <tbody>
      <tr>
        <td>Points</td>
        <td>Complexity</td>
        <td>Effort</td>
        <td>Uncertainty</td>
      </tr>
      <!-- eslint-disable-next-line svelte/require-each-key todo redo this page -->
      {#each tableData as row}
        <tr>
          <td>{row.pointValue}</td>
          <td>{row.complexity}</td>
          <td>{row.effort}</td>
          <td>{row.uncertainty}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  td:not(:first-child) {
    cursor: pointer;
  }

  td:not(:first-child):hover {
    background-color: #007bff;
  }
</style>

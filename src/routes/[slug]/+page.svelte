<script lang="ts">
  import type { PageData } from './$types';
  import Chat from '$lib/components/chat.svelte';
  import { m } from '$lib/paraglide/messages';
  import { pointsValues, tableData } from '$lib/assets/data';

  const { data }: { data: PageData } = $props();
  const { slug } = data;

  let activeCell = $state({
    complexity: null as number | null,
    effort: null as number | null,
    uncertainty: null as number | null
  });

  let selectedPointsValues = $state({
    complexity: null as number | null,
    effort: null as number | null,
    uncertainty: null as number | null
  });

  let mean = $derived.by(() => {
    const nbSelected = Object.values(activeCell).filter((value) => value !== null).length;

    const mean =
      ((selectedPointsValues.complexity || 0) +
        (selectedPointsValues.effort || 0) +
        (selectedPointsValues.uncertainty || 0)) /
      nbSelected;
    return mean;
  });

  let pointValueOverMean = $derived.by(() => {
    return pointsValues.find((value) => value >= mean) ?? pointsValues[pointsValues.length - 1];
  });

  function handleClick(
    event: MouseEvent,
    type: 'complexity' | 'effort' | 'uncertainty',
    index: number
  ) {
    activeCell[type] = activeCell[type] === index ? null : index;

    const target = event.target as HTMLTableCellElement;
    const row = target.parentElement;
    if (row) {
      const pointValue = row.children[0].textContent;
      if (pointValue) {
        selectedPointsValues[type] = parseFloat(pointValue);
      }
    }
  }
</script>

<div>
  <Chat {slug} />

  Mean {mean}
  Point over mean {pointValueOverMean}

  <table>
    <thead>
      <tr>
        <th>{m.points()}</th>
        <th>{m.complexity()}</th>
        <th>{m.effort()}</th>
        <th>{m.uncertainty()}</th>
      </tr>
    </thead>
    <tbody>
      {#each tableData as row, index (row.pointValue)}
        <tr>
          <td>{row.pointValue}</td>
          <td
            class:active={activeCell.complexity === index}
            onclick={(ev) => handleClick(ev, 'complexity', index)}>{row.complexity}</td
          >
          <td
            class:active={activeCell.effort === index}
            onclick={(ev) => handleClick(ev, 'effort', index)}>{row.effort}</td
          >
          <td
            class:active={activeCell.uncertainty === index}
            onclick={(ev) => handleClick(ev, 'uncertainty', index)}>{row.uncertainty}</td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  table {
    width: 100%;
    max-width: 800px;
    margin: 20px auto;
    border-collapse: collapse;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    overflow: hidden;
  }

  td,
  th {
    padding: 12px 15px;
    text-align: center;
    border-bottom: 1px solid #ddd;
  }
  tr:nth-child(even) {
    background-color: #f8f9fa;
  }

  tr:hover {
    background-color: #f0f0f0;
  }

  thead {
    tr:first-child {
      background-color: #007bff;
      color: white;
      font-weight: bold;
    }
  }

  tbody {
    td:not(:first-child) {
      cursor: pointer;

      &.active,
      &:hover {
        background-color: #007bff;
        color: white;
        transition: all 0.3s ease;
      }
    }
  }
</style>

<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import type { VoteStats } from '$lib/remote/votes.schemas';
  import { round2 } from '$lib/util/math';

  const { pointsValues, myVotes, stats }: { pointsValues: number[]; myVotes: VoteModel; stats: VoteStats } = $props();

  const mean: number | null = $derived.by(() => {
    const nbSelected = Object.values(myVotes).filter((voteValue: number | null) => voteValue !== null && !isNaN(voteValue)).length;
    const mean = ((myVotes.complexity || 0) + (myVotes.effort || 0) + (myVotes.uncertainty || 0)) / nbSelected;
    return round2(mean);
  });

  const pointValueOverMean: number | null = $derived.by(() => {
    if (isNaN(mean)) {
      return null;
    }

    return pointsValues.find((value) => value >= mean) ?? pointsValues[pointsValues.length - 1];
  });

  const isConsensus = $derived.by(() => {
    return (
      stats.teamRecommendedValue !== null &&
      stats.teamMin !== null &&
      stats.teamMax !== null &&
      stats.teamMin.value === stats.teamMax.value &&
      stats.teamMin.value === stats.teamRecommendedValue
    );
  });
</script>

<div class="stats">
  <ul>
    {#if mean !== null && pointValueOverMean !== null}
      <li title="Mean {mean}">{m.yourValuePoint()} {pointValueOverMean}</li>
    {/if}
    {#if stats}
      {#if stats.teamMean !== null && stats.teamRecommendedValue !== null}
        <li title="Mean {stats.teamMean}" class:consensus={isConsensus}>
          {m.teamRecommendedValue()}
          {stats.teamRecommendedValue}
        </li>
      {/if}
      <li>Min {stats.teamMin.value} ({stats.teamMin.usernames})</li>
      <li>Max {stats.teamMax.value} ({stats.teamMax.usernames})</li>
    {/if}
  </ul>
</div>

<style>
  .stats {
    width: 20%;
    margin: 1rem 0;
    background: white;
    box-shadow: var(--shadow-100);
    border-radius: var(--radius-small);
  }

  @media (max-width: 480px) {
    .stats {
      width: 100%;
    }
  }

  .consensus {
    font-weight: bold;
    color: var(--primary-color);
  }
</style>

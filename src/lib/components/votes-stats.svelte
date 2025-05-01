<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import { round2 } from '$lib/util/math';

  let { pointsValues, myVotes, teamVotes }: { pointsValues: number[]; myVotes: VoteModel; teamVotes: UservoteModel[] } = $props();

  let mean: number | null = $derived.by(() => {
    const nbSelected = Object.values(myVotes).filter((voteValue: number | null) => voteValue !== null && !isNaN(voteValue)).length;
    const mean = ((myVotes.complexity || 0) + (myVotes.effort || 0) + (myVotes.uncertainty || 0)) / nbSelected;
    return round2(mean);
  });

  let pointValueOverMean: number | null = $derived.by(() => {
    if (isNaN(mean)) {
      return null;
    }

    return pointsValues.find((value) => value >= mean) ?? pointsValues[pointsValues.length - 1];
  });

  let teamMean: number | null = $derived.by(() => {
    const nbTeamVotes = teamVotes
      .flatMap((vote) => {
        return Object.entries(vote)
          .filter(([key]) => key !== 'username')
          .map(([, value]) => value);
      })
      .filter((vote: number | null) => vote !== null && !isNaN(vote)).length;
    const mean =
      teamVotes.reduce((acc, vote) => acc + (vote.complexity || 0) + (vote.effort || 0) + (vote.uncertainty || 0), 0) / nbTeamVotes;
    return round2(mean);
  });

  let pointValueOverTeamMean: number | null = $derived.by(() => {
    if (isNaN(teamMean)) {
      return null;
    }

    return pointsValues.find((value) => value >= teamMean) ?? pointsValues[pointsValues.length - 1];
  });
</script>

<div class="stats">
  <ul>
    {#if mean !== null && pointValueOverMean !== null}
      <li>{m.yourValuePoint()} <span title="Mean {mean}">{pointValueOverMean}</span></li>
    {/if}
    {#if teamMean !== null && pointValueOverTeamMean !== null}
      <li>{m.teamRecommendedValue()} <span title="Mean {teamMean}">{pointValueOverTeamMean}</span></li>
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
</style>

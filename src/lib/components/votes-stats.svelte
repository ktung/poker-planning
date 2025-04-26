<script lang="ts">
  import { round2 } from '$lib/util/math';

  let { pointsValues, myVotes, teamVotes }: { pointsValues: number[]; myVotes: VoteModel; teamVotes: VoteModel[] } = $props();

  let mean = $derived.by(() => {
    const nbSelected = Object.values(myVotes).filter((vote) => vote !== null && vote !== undefined).length;
    const mean = ((myVotes.complexity || 0) + (myVotes.effort || 0) + (myVotes.uncertainty || 0)) / nbSelected;
    return round2(mean);
  });

  let pointValueOverMean = $derived.by(() => {
    return pointsValues.find((value) => value >= mean) ?? pointsValues[pointsValues.length - 1];
  });

  let teamMean = $derived.by(() => {
    const teamVotesValues = Object.values(teamVotes).filter((vote) => vote !== null && vote !== undefined);
    const nbTeamVotes = teamVotesValues.length;
    const mean =
      teamVotesValues.reduce((acc, vote) => acc + (vote.complexity || 0) + (vote.effort || 0) + (vote.uncertainty || 0), 0) /
      (nbTeamVotes * 3);
    return round2(mean);
  });

  let pointValueOverTeamMean = $derived.by(() => {
    return pointsValues.find((value) => value >= teamMean) ?? pointsValues[pointsValues.length - 1];
  });
</script>

<div class="stats">
  <ul>
    <li>Mean {mean}</li>
    <li>Point over mean {pointValueOverMean}</li>
    <li>Team mean {teamMean}</li>
    <li>Team point over mean {pointValueOverTeamMean}</li>
  </ul>
</div>

<style>
  .stats {
    margin: 1rem 0;
    background: white;
    box-shadow: 0 2px 4px var(--shadow);
    border-radius: 8px;
    padding: 1rem;
  }
</style>

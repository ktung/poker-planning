<script lang="ts">
  import { pointsValues } from '$lib/assets/data';

  interface PropsType {
    votes: UservoteModel[];
    selectedType: VoteType;
    selectedValue: number;
    recommandedValue: number | null;
  }

  const { votes, selectedType, selectedValue, recommandedValue }: PropsType = $props();

  const currentVotes = $derived.by(() => {
    return votes.filter((vote) => vote[selectedType] === selectedValue);
  });
  const hasHighlight = $derived.by(() => {
    if (!recommandedValue) {
      return false;
    }

    const recommandedValueIndex = pointsValues.findIndex((v) => v === recommandedValue);
    const selectedValueIndex = pointsValues.findIndex((v) => v === selectedValue);

    return Math.abs(recommandedValueIndex - selectedValueIndex) > 1;
  });
</script>

<div>
  <ul>
    {#each currentVotes as vote, i (i)}
      <li class:highlight={hasHighlight}>{vote.username}</li>
    {/each}
  </ul>
</div>

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      display: inline;
      padding: 0.3rem;
      gap: 10px;
      background-color: var(--primary-color);
      color: white;
      margin: 2px;
    }

    li.highlight {
      background-color: var(--error-color);
    }
  }
</style>

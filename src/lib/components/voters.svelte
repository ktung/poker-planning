<script lang="ts">
  const { votes, selectedType, selectedValue } = $props();

  const usernames = $derived.by(() => {
    const selectedVotes = votes.filter((vote) => vote[selectedType] === selectedValue);
    return selectedVotes.map((vote) => vote.users.username);
  });
</script>

<div>
  <ul>
    {#each usernames as username, i (i)}
      <li>{username}</li>
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
  }
</style>

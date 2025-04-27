<script lang="ts">
  import { REALTIME_LISTEN_TYPES, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from '@supabase/supabase-js';
  import { fetchVotesAndUsersByRoomId } from '$lib/db/votes';
  import { supabase } from '$lib/supabaseClient';
  import { logger } from '$lib/util/logger';
  import { onMount } from 'svelte';

  let { usersStatuses, roomId }: { usersStatuses: UservoteModel[]; roomId: string } = $props();
  let statuses = $state(usersStatuses);

  onMount(() => {
    const votesChannel = supabase
      .channel(`votes:${roomId}`)
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        { event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL, schema: 'public', table: 'votes' },
        async () => {
          const { data: currentVotesData, error: currentVotesQueryError } = await fetchVotesAndUsersByRoomId(roomId);
          if (currentVotesQueryError) {
            logger.error('Error selecting current votes', currentVotesQueryError);
            throw new Error('Error selecting current votes');
          }
          statuses = currentVotesData.map((vote) => {
            return {
              complexity: vote.complexity,
              effort: vote.effort,
              uncertainty: vote.uncertainty,
              username: vote.users.username
            };
          });
        }
      )
      .subscribe();

    return () => {
      votesChannel.unsubscribe();
    };
  });

  function displayVote(value: number | null) {
    if (value === null || isNaN(value)) {
      return '🤔';
    }

    return '✅';
  }
</script>

<div>
  <table>
    <thead>
      <tr>
        <th>Username</th>
        <th>Complexity</th>
        <th>Effort</th>
        <th>Uncertainty</th>
      </tr>
    </thead>
    <tbody>
      {#each statuses as user, i (i)}
        <tr>
          <td>{user.username}</td>
          <td>{displayVote(user.complexity)}</td>
          <td>{displayVote(user.effort)}</td>
          <td>{displayVote(user.uncertainty)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  table {
    width: 100%;
    margin: 20px auto;
    border-collapse: collapse;
    background-color: white;
    box-shadow: 0 1px 3px var(--shadow-dark);
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

  thead tr:first-child {
    background-color: var(--primary-color);
    color: white;
    font-weight: 500;
  }

  tbody td:not(:first-child) {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  @media (max-width: 768px) {
    td,
    th {
      padding: 8px;
      font-size: 0.875rem;
    }
  }
</style>

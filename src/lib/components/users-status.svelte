<script lang="ts">
  import { REALTIME_LISTEN_TYPES, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from '@supabase/supabase-js';
  import { m } from '$lib/paraglide/messages';
  import { fetchVotesAndUsersByRoomId } from '$lib/remote/votes.remote';
  import { supabase } from '$lib/supabaseClient';
  import { logger } from '$lib/util/logger';
  import { onMount } from 'svelte';

  let { usersStatuses, roomId }: { usersStatuses: UservoteModel[]; roomId: string } = $props();
  let statuses = $state(usersStatuses);

  onMount(() => {
    const votesChannel = supabase
      .channel(`votes:${roomId}`)
      .on(REALTIME_LISTEN_TYPES.SYSTEM, { event: 'reconnect' }, async () => {
        logger.info('Reconnected to votes channel');
        statuses = (await fetchVotesAndUsersByRoomId(roomId)).votes;
      })
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        { event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL, schema: 'public', table: 'votes' },
        async () => {
          statuses = (await fetchVotesAndUsersByRoomId(roomId)).votes;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votesChannel);
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
        <th>{m.username()}</th>
        <th>{m.complexity()}</th>
        <th>{m.effort()}</th>
        <th>{m.uncertainty()}</th>
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
    box-shadow: var(--shadow-100);
    border-radius: var(--radius-small);
    overflow: hidden;
  }

  td,
  th {
    padding: 12px 15px;
    text-align: center;
    border-bottom: 1px solid #ddd;
    word-break: break-all;
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

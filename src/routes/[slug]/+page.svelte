<script lang="ts">
  import {
    REALTIME_LISTEN_TYPES,
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
    REALTIME_PRESENCE_LISTEN_EVENTS,
    REALTIME_SUBSCRIBE_STATES
  } from '@supabase/supabase-js';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { pointsValues, tableData } from '$lib/assets/data';
  import Chat from '$lib/components/chat.svelte';
  import CopiableText from '$lib/components/copiable-text.svelte';
  import UsersStatus from '$lib/components/users-status.svelte';
  import Voters from '$lib/components/voters.svelte';
  import VotesStats from '$lib/components/votes-stats.svelte';
  import { pushMessage } from '$lib/db/messages';
  import { deleteVotesByUserIdAndRoomId, fetchVotesAndUsersByRoomId, upsertVote } from '$lib/db/votes';
  import { m } from '$lib/paraglide/messages';
  import { supabase } from '$lib/supabaseClient';
  import { logger } from '$lib/util/logger';
  import { onDestroy, onMount } from 'svelte';
  import type { PageData } from './$types';

  const { data }: { data: PageData } = $props();
  const { roomId, slug, userId, username, currentVotes } = data;
  const currentHref = page.url.href;
  let voteShown = $state(false);

  onMount(() => {
    const sessionRoomId = window.sessionStorage.getItem('roomId');
    if (!!sessionRoomId && sessionRoomId === slug) {
      goto(`${currentHref}/join`);
    } else {
      window.sessionStorage.setItem('roomId', slug);
    }

    const roomChannel = supabase.channel(slug);
    const channelPresence = supabase.channel(`presence:${slug}`, {
      config: {
        presence: {
          key: slug
        }
      }
    });

    const userStatusChannel = supabase
      .channel(`users_status:${slug}`)
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        { event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL, schema: 'public', table: 'users' },
        (payload) => {
          logger.debug('user status', payload);
        }
      )
      .subscribe();

    channelPresence
      .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC }, () => {
        const state = channelPresence.presenceState();
        logger.debug('sync', state);
      })
      .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.JOIN }, ({ key, newPresences }) => {
        logger.debug('join', key, newPresences);
      })
      .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE }, ({ key, leftPresences }) => {
        logger.debug('leave', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          logger.error(`Error subscribing to presence channel: ${status}`);
          return;
        }

        const userStatus = {
          userId: userId,
          online_at: new Date().toISOString()
        };
        const presenceTrackStatus = await channelPresence.track(userStatus);
        logger.debug('presence status', presenceTrackStatus);
        pushMessage(roomId, userId, `${username} joined the room`).then();
      });

    roomChannel
      .on(REALTIME_LISTEN_TYPES.BROADCAST, { event: 'clearVotes' }, () => {
        activeCell = {
          complexity: null,
          effort: null,
          uncertainty: null
        };
      })
      .subscribe();

    return () => {
      roomChannel.unsubscribe();
      channelPresence.untrack();
      channelPresence.unsubscribe();
      userStatusChannel.unsubscribe();
    };
  });

  onDestroy(async () => {
    pushMessage(roomId, userId, `${username} left the room`).then();

    const { error } = await deleteVotesByUserIdAndRoomId(userId, roomId);

    if (error) {
      logger.error('Error deleting user:', error);
    }
  });

  let activeCell: VoteModel = $state({
    complexity: null,
    effort: null,
    uncertainty: null
  });

  let selectedPointsValues: VoteModel = $state({
    complexity: null,
    effort: null,
    uncertainty: null
  });

  async function handleClick(event: MouseEvent, type: VoteType, index: number) {
    if (activeCell[type] === index) {
      activeCell[type] = null;
      selectedPointsValues[type] = null;
      return;
    } else {
      activeCell[type] = index;
    }

    const target = event.target as HTMLTableCellElement;
    const row = target.parentElement;
    if (row) {
      const pointValue = row.children[0].textContent;
      if (pointValue) {
        selectedPointsValues[type] = parseFloat(pointValue);
      }
    }

    const { error } = await upsertVote(userId, roomId, type, selectedPointsValues[type]);
    if (error) {
      logger.error('Error upserting vote', error);
    }
  }

  let savedVotes: UservoteModel[] = $state([]);
  async function showVotes() {
    const { data, error } = await fetchVotesAndUsersByRoomId(roomId);
    if (error) {
      logger.error('Error fetching votes:', error);
      throw error;
    }
    voteShown = true;

    data.forEach((vote) => {
      const { complexity, effort, uncertainty, users } = vote;
      savedVotes.push({
        complexity,
        effort,
        uncertainty,
        username: users.username
      });
    });

    activeCell = {
      complexity: null,
      effort: null,
      uncertainty: null
    };
  }

  function clearVote() {
    supabase
      .channel(slug)
      .send({
        type: 'broadcast',
        event: 'clearVotes',
        payload: {}
      })
      .then(() => {
        voteShown = false;
      });
  }
</script>

<section>
  <div>
    <span>Invite your team to the room: </span><CopiableText text={`${currentHref}/join`} />
    {#if voteShown}
      <button onclick={clearVote}>Clear votes</button>
    {:else}
      <button onclick={showVotes}>Show votes</button>
    {/if}
  </div>

  <div class="infos">
    <Chat {roomId} {slug} {userId} />
    <UsersStatus usersStatuses={currentVotes} {roomId} />
    <VotesStats {pointsValues} myVotes={selectedPointsValues} teamVotes={savedVotes} />
  </div>

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
          <td class:active={activeCell.complexity === index} onclick={(ev) => handleClick(ev, 'complexity', index)}>
            {row.complexity}
            <Voters votes={savedVotes} selectedType="complexity" selectedValue={row.pointValue} />
          </td>
          <td class:active={activeCell.effort === index} onclick={(ev) => handleClick(ev, 'effort', index)}
            >{row.effort}
            <Voters votes={savedVotes} selectedType="effort" selectedValue={row.pointValue} />
          </td>
          <td class:active={activeCell.uncertainty === index} onclick={(ev) => handleClick(ev, 'uncertainty', index)}
            >{row.uncertainty}
            <Voters votes={savedVotes} selectedType="uncertainty" selectedValue={row.pointValue} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  .infos {
    display: flex;
    justify-content: space-around;
    margin-bottom: 2rem;
  }

  section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  button {
    padding: 0.8rem 1.5rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover {
    background-color: var(--primary-color-active);
    transform: translateY(-1px);
  }

  button:active {
    transform: translateY(0);
  }

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

  tbody td:not(:first-child).active,
  tbody td:not(:first-child):hover {
    background-color: var(--primary-color);
    color: white;
  }

  @media (max-width: 768px) {
    td,
    th {
      padding: 8px;
      font-size: 0.875rem;
    }

    section {
      padding: 0;
    }

    .infos {
      flex-direction: column;
    }
  }
</style>

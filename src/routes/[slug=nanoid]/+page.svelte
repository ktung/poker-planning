<script lang="ts">
  import {
    REALTIME_LISTEN_TYPES,
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
    REALTIME_PRESENCE_LISTEN_EVENTS,
    REALTIME_SUBSCRIBE_STATES,
    RealtimeChannel,
    type RealtimeChannelSendResponse,
    type RealtimePresenceState
  } from '@supabase/supabase-js';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { pointsValues, tableData } from '$lib/assets/data';
  import Chat from '$lib/components/chat.svelte';
  import CopiableText from '$lib/components/copiable-text.svelte';
  import Protips, { toggleProtips } from '$lib/components/protips.svelte';
  import UsersStatus from '$lib/components/users-status.svelte';
  import Voters from '$lib/components/voters.svelte';
  import VotesStats from '$lib/components/votes-stats.svelte';
  import { m } from '$lib/paraglide/messages';
  import { pushMessage } from '$lib/remote/messages.remote';
  import { fetchVotesAndUsersByRoomId, resetVotesByRoomId, upsertVote } from '$lib/remote/votes.remote';
  import { defaultVoteStats, type VoteStats } from '$lib/remote/votes.schemas';
  import { supabase } from '$lib/supabaseClient';
  import { logger } from '$lib/util/logger';
  import { getJoinUrl } from '$lib/util/routes';
  import { CircleQuestionMark } from 'lucide-svelte';
  import { onDestroy, onMount } from 'svelte';
  import type { PageData } from './$types';

  const { data }: { data: PageData } = $props();
  const { roomId, slug, userId, currentVotes, username } = data;
  let voteShown = $state(false);
  let roomChannel: RealtimeChannel;
  let voteChannel: RealtimeChannel;
  let stats: VoteStats = $state(defaultVoteStats);

  onMount(() => {
    const sessionRoomId = window.sessionStorage.getItem('roomId');
    if (sessionRoomId && sessionRoomId === slug) {
      logger.error('Redirecting to join url if its a refresh');
      goto(resolve('/[slug=nanoid]/join', { slug: slug }));
    } else {
      window.sessionStorage.setItem('roomId', slug);
    }

    roomChannel = supabase.channel(slug);
    const channelPresence = supabase.channel(`presence:${slug}`, {
      config: {
        presence: {
          key: slug
        }
      }
    });

    channelPresence
      .on(REALTIME_LISTEN_TYPES.SYSTEM, { event: 'reconnect' }, (payload) => {
        logger.debug('Listen presence channel reconnect', payload);
        const state: RealtimePresenceState<UserTrackModel> = channelPresence.presenceState();
        const users = state[slug];

        if (users && users.length !== 0 && users[0].userId === userId) {
          fetch(`/api/rooms/sync`, {
            method: 'POST',
            body: JSON.stringify({
              roomId: roomId,
              userId: userId,
              users: users
            })
          });
        }
      })
      .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC }, () => {
        const state: RealtimePresenceState<UserTrackModel> = channelPresence.presenceState();
        logger.debug('Listen presence channel sync', state);
        const users = state[slug];

        if (users && users.length !== 0 && users[0].userId === userId) {
          fetch(`/api/rooms/sync`, {
            method: 'POST',
            body: JSON.stringify({
              roomId: roomId,
              userId: userId,
              users: users
            })
          });
        }
      })
      .subscribe(async (status) => {
        if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT || status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          logger.error('Error subscribing to presence channel', status);
          // goto(resolve('/[slug=nanoid]/join', { slug: slug }));
          // return;
        }

        const userStatus: UserTrackModel = {
          userId: userId,
          onlineAt: new Date().toISOString()
        };
        const presenceTrackStatus: RealtimeChannelSendResponse = await channelPresence.track(userStatus);
        if (presenceTrackStatus === 'error') {
          logger.error('track presence', presenceTrackStatus);
          // goto(resolve('/[slug=nanoid]/join', { slug: slug }));
        }
      });

    roomChannel
      .on(REALTIME_LISTEN_TYPES.BROADCAST, { event: 'clearVotes' }, (payload) => {
        logger.debug('Listen room channel clearVotes', payload);
        clearVotes();
      })
      .on(REALTIME_LISTEN_TYPES.BROADCAST, { event: 'showVotes' }, async (payload) => {
        logger.debug('Listen room channel showVotes', payload);
        handleShowVotes();
      })
      .subscribe();

    return () => {
      logger.info('Removing room channel');
      supabase.removeChannel(roomChannel);
      logger.info('Removing presence channel');
      channelPresence.untrack();
      supabase.removeChannel(channelPresence);
    };
  });

  onDestroy(() => {
    logger.info('Removing all channels');
    supabase.removeAllChannels();
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
    let selectedIndex = null;
    let selectedValue = null;

    // click to on
    if (activeCell[type] !== index) {
      selectedIndex = index;
      const target = event.target as HTMLTableCellElement;
      const row = target.closest('tr');
      if (row) {
        const pointValue = row.children[0].textContent;
        if (pointValue) {
          selectedValue = parseFloat(pointValue);
        }
      }
    }

    const { error } = await upsertVote({ userId, roomId, type, value: selectedValue });
    if (error) {
      logger.error('Error upserting vote', error);
    } else {
      activeCell[type] = selectedIndex;
      selectedPointsValues[type] = selectedValue;
    }
  }

  let savedVotes: UservoteModel[] = $state([]);

  $effect(() => {
    if (!voteShown && !!voteChannel) {
      logger.info('Removing votes channel');
      supabase.removeChannel(voteChannel);
    }

    if (voteShown) {
      subscribeVotesChanges();
    }
  });

  function subscribeVotesChanges() {
    if (voteChannel) {
      logger.info('Removing votes channel');
      supabase.removeChannel(voteChannel);
    }
    voteChannel = supabase
      .channel(`votes:${slug}`)
      .on(REALTIME_LISTEN_TYPES.SYSTEM, { event: 'reconnect' }, async (payload) => {
        logger.debug('Listen votes channel reconnect (room)', payload);
        const data = await fetchVotesAndUsersByRoomId(roomId);
        savedVotes = data.votes;
        stats = data.stats;
      })
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        { event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE, schema: 'public', table: 'votes', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          logger.debug('Listen votes channel postgres', payload);
          const data = await fetchVotesAndUsersByRoomId(roomId);
          savedVotes = data.votes;
          stats = data.stats;
        }
      )
      .subscribe();
  }

  async function sendShowVotes() {
    roomChannel
      .send({ type: REALTIME_LISTEN_TYPES.BROADCAST, event: 'showVotes' })
      .then(() => pushMessage({ roomId, userId, message: `${username} ${m.showVotesMessage()}` }))
      .then(async () => {
        await handleShowVotes();
      });
  }

  function sendClearVotes() {
    roomChannel
      .send({ type: REALTIME_LISTEN_TYPES.BROADCAST, event: 'clearVotes' })
      .then(() => pushMessage({ roomId, userId, message: `${username} ${m.clearVotesMessage()}` }))
      .then(async () => {
        await resetVotesByRoomId(roomId);
        clearVotes();
      });
  }

  function clearVotes() {
    voteShown = false;
    savedVotes = [];
    stats = defaultVoteStats;
    selectedPointsValues = {
      complexity: null,
      effort: null,
      uncertainty: null
    };
    activeCell = {
      complexity: null,
      effort: null,
      uncertainty: null
    };
  }

  async function handleShowVotes() {
    const data = await fetchVotesAndUsersByRoomId(roomId);
    savedVotes = data.votes;
    stats = data.stats;
    voteShown = true;
  }
</script>

<svelte:head>
  <title>{m.votingSession()} {slug} | Poker Planning</title>
</svelte:head>

<section>
  <div>
    <span>{m.inviteLink()}</span><CopiableText text={getJoinUrl(page.url.href)} />
    <button onclick={sendClearVotes}>{m.clearVotes()}</button>
    <button onclick={sendShowVotes}>{m.showVotes()}</button>
  </div>

  <div class="infos">
    <Chat {roomId} {slug} {userId} />
    <UsersStatus usersStatuses={currentVotes} {roomId} />
    <VotesStats {pointsValues} myVotes={selectedPointsValues} {stats} />
  </div>

  <Protips />

  <table>
    <thead>
      <tr>
        <th>{m.points()}</th>
        <th>{m.complexity()}<span onclick={() => toggleProtips('complexity')}><CircleQuestionMark /></span></th>
        <th>{m.effort()}<span onclick={() => toggleProtips('effort')}><CircleQuestionMark /></span></th>
        <th>{m.uncertainty()}<span onclick={() => toggleProtips('uncertainty')}><CircleQuestionMark /></span></th>
      </tr>
    </thead>
    <tbody>
      {#each tableData as row, index (row.pointValue)}
        <tr>
          <td>{row.pointValue}</td>
          <td class:active={!voteShown && activeCell.complexity === index} onclick={(ev) => handleClick(ev, 'complexity', index)}>
            {row.complexity}
            {#if voteShown}
              <Voters
                votes={savedVotes}
                selectedType="complexity"
                selectedValue={row.pointValue}
                recommandedValue={stats?.complexityRecommandation}
              />
            {/if}
          </td>
          <td class:active={!voteShown && activeCell.effort === index} onclick={(ev) => handleClick(ev, 'effort', index)}
            >{row.effort}
            {#if voteShown}
              <Voters
                votes={savedVotes}
                selectedType="effort"
                selectedValue={row.pointValue}
                recommandedValue={stats?.effortRecommandation}
              />
            {/if}
          </td>
          <td class:active={!voteShown && activeCell.uncertainty === index} onclick={(ev) => handleClick(ev, 'uncertainty', index)}
            >{row.uncertainty}
            {#if voteShown}
              <Voters
                votes={savedVotes}
                selectedType="uncertainty"
                selectedValue={row.pointValue}
                recommandedValue={stats?.uncertaintyRecommandation}
              />
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  button {
    padding: 0.8rem 1.5rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-small);
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

  .infos {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

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

    span {
      cursor: pointer;
      margin-left: 0.5rem;
      vertical-align: middle;
    }
    span:hover {
      color: var(--secondary-color-active);
    }
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
    /* transition: all 0.2s ease; */
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

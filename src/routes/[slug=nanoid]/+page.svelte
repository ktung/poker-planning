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
  import { CircleQuestionMark, CircleX } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  const { data }: { data: PageData } = $props();
  const { roomId, slug, userId, currentVotes, username, protipsTexts } = data;
  let voteShown = $state(false);
  let roomChannel: RealtimeChannel;
  let voteChannel: RealtimeChannel;
  let stats: VoteStats = $state(defaultVoteStats);

  onMount(() => {
    const sessionRoomId = window.sessionStorage.getItem('roomId');
    if (!!sessionRoomId && sessionRoomId === slug) {
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
      .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC }, () => {
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
      .subscribe(async (status) => {
        if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT || status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          logger.error(`Error subscribing to presence channel: ${status}`);
          goto(resolve('/[slug=nanoid]/join', { slug: slug }));
          return;
        }

        const userStatus: UserTrackModel = {
          userId: userId,
          onlineAt: new Date().toISOString()
        };
        const presenceTrackStatus: RealtimeChannelSendResponse = await channelPresence.track(userStatus);
        if (presenceTrackStatus === 'error') {
          logger.info('track presence', presenceTrackStatus);
          goto(resolve('/[slug=nanoid]/join', { slug: slug }));
        }
      });

    roomChannel
      .on(REALTIME_LISTEN_TYPES.BROADCAST, { event: 'clearVotes' }, () => {
        clearVotes();
      })
      .on(REALTIME_LISTEN_TYPES.BROADCAST, { event: 'showVotes' }, async () => {
        handleShowVotes();
      })
      .subscribe();

    return () => {
      roomChannel.unsubscribe();
      channelPresence.untrack();
      channelPresence.unsubscribe();
    };
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
    } else {
      activeCell[type] = index;
      const target = event.target as HTMLTableCellElement;
      const row = target.closest('tr');
      if (row) {
        const pointValue = row.children[0].textContent;
        if (pointValue) {
          selectedPointsValues[type] = parseFloat(pointValue);
        }
      }
    }

    const { error } = await upsertVote({ userId, roomId, type, value: selectedPointsValues[type] });
    if (error) {
      logger.error('Error upserting vote', error);
    }
  }

  let savedVotes: UservoteModel[] = $state([]);

  $effect(() => {
    if (!voteShown && !!voteChannel) {
      voteChannel.unsubscribe();
    }

    if (voteShown) {
      voteChannel = supabase
        .channel(`votes:${slug}`)
        .on(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
          { event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE, schema: 'public', table: 'votes', filter: `room_id=eq.${roomId}` },
          async () => {
            const data = await fetchVotesAndUsersByRoomId(roomId);
            savedVotes = data.votes;
            stats = data.stats;
          }
        )
        .subscribe();
    }
  });

  async function sendShowVotes() {
    roomChannel
      .send({
        type: 'broadcast',
        event: 'showVotes',
        payload: {}
      })
      .then(() => pushMessage({ roomId, userId, message: `${username} ${m.showVotesMessage()}` }))
      .then(async () => {
        handleShowVotes();
      });
  }

  function sendClearVotes() {
    roomChannel
      .send({
        type: 'broadcast',
        event: 'clearVotes',
        payload: {}
      })
      .then(() => pushMessage({ roomId, userId, message: `${username} ${m.clearVotesMessage()}` }))
      .then(async () => {
        await resetVotesByRoomId(roomId);
        clearVotes();
      });
  }

  let protipsToggles: ProtipsToggleModel = $state({
    complexity: false,
    effort: false,
    uncertainty: false
  });

  function toggleProtips(event: MouseEvent, type: VoteType) {
    protipsToggles[type] = !protipsToggles[type];
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
    <VotesStats {pointsValues} myVotes={selectedPointsValues} {stats} teamVotes={savedVotes} />
  </div>

  <section class="protips">
    {#if protipsToggles.complexity}
      <div>
        <h3>{m.complexity()}</h3>
        <span onclick={(ev) => toggleProtips(ev, 'complexity')}><CircleX /></span>
        <ul>
          {#each protipsTexts.complexity as key (key)}
            <li>{m[key]()}</li>
          {/each}
        </ul>
      </div>
    {/if}
    {#if protipsToggles.effort}
      <div>
        <h3>{m.effort()}</h3>
        <span onclick={(ev) => toggleProtips(ev, 'effort')}><CircleX /></span>
        <ul>
          {#each protipsTexts.effort as key (key)}
            <li>{m[key]()}</li>
          {/each}
        </ul>
      </div>
    {/if}
    {#if protipsToggles.uncertainty}
      <div>
        <h3>{m.uncertainty()}</h3>
        <span onclick={(ev) => toggleProtips(ev, 'uncertainty')}><CircleX /></span>
        <ul>
          {#each protipsTexts.uncertainty as key (key)}
            <li>{m[key]()}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </section>

  <table>
    <thead>
      <tr>
        <th>{m.points()}</th>
        <th>{m.complexity()}<span onclick={(ev) => toggleProtips(ev, 'complexity')}><CircleQuestionMark /></span></th>
        <th>{m.effort()}<span onclick={(ev) => toggleProtips(ev, 'effort')}><CircleQuestionMark /></span></th>
        <th>{m.uncertainty()}<span onclick={(ev) => toggleProtips(ev, 'uncertainty')}><CircleQuestionMark /></span></th>
      </tr>
    </thead>
    <tbody>
      {#each tableData as row, index (row.pointValue)}
        <tr>
          <td>{row.pointValue}</td>
          <td class:active={!voteShown && activeCell.complexity === index} onclick={(ev) => handleClick(ev, 'complexity', index)}>
            {row.complexity}
            <Voters
              votes={savedVotes}
              selectedType="complexity"
              selectedValue={row.pointValue}
              recommandedValue={stats?.complexityRecommandation}
            />
          </td>
          <td class:active={!voteShown && activeCell.effort === index} onclick={(ev) => handleClick(ev, 'effort', index)}
            >{row.effort}
            <Voters
              votes={savedVotes}
              selectedType="effort"
              selectedValue={row.pointValue}
              recommandedValue={stats?.effortRecommandation}
            />
          </td>
          <td class:active={!voteShown && activeCell.uncertainty === index} onclick={(ev) => handleClick(ev, 'uncertainty', index)}
            >{row.uncertainty}
            <Voters
              votes={savedVotes}
              selectedType="uncertainty"
              selectedValue={row.pointValue}
              recommandedValue={stats?.uncertaintyRecommandation}
            />
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

  .protips {
    h3 {
      color: var(--primary-color);
      display: inline;
    }

    span {
      cursor: pointer;
      margin-left: 0.5rem;
      vertical-align: middle;
    }
    span:hover {
      color: var(--primary-color-active);
    }

    div {
      background: white;
      border-radius: var(--radius-small);
      box-shadow: var(--shadow-100);
      padding: 1rem;
    }
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
